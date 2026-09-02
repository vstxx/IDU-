param()

$ErrorActionPreference = "Stop"

$workspace = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$releaseRoot = Join-Path $workspace "release"
$chromeDir = Join-Path $releaseRoot "idu-plus-chrome-web-store"
$firefoxDir = Join-Path $releaseRoot "idu-plus-firefox-addon"
$safariDir = Join-Path $releaseRoot "idu-plus-safari-userscript"
$manifest = Get-Content -Raw (Join-Path $workspace "manifest.json") | ConvertFrom-Json
$version = [string]$manifest.version

if ($version -notmatch '^\d+\.\d+\.\d+$') {
  throw "Invalid release version in manifest.json: $version"
}

New-Item -ItemType Directory -Force -Path $releaseRoot, $chromeDir, $firefoxDir, $safariDir | Out-Null

foreach ($target in @($chromeDir, $firefoxDir, $safariDir)) {
  $resolvedTarget = (Resolve-Path $target).Path

  if (-not $resolvedTarget.StartsWith($releaseRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Release target escaped the release directory: $resolvedTarget"
  }

  Get-ChildItem -LiteralPath $resolvedTarget -Force | Remove-Item -Recurse -Force
}

foreach ($target in @($chromeDir, $firefoxDir)) {
  New-Item -ItemType Directory -Force -Path (Join-Path $target "src"), (Join-Path $target "assets"), (Join-Path $target "fonts") | Out-Null
}

$rootFiles = @("popup.html", "README.md")
$sourceFiles = @("diagnostics.js", "idu-plus.css", "idu-plus.js", "popup.css", "popup.js")
$assetFiles = @("icon-16.png", "icon-32.png", "icon-48.png", "icon-128.png", "idu-plus-logo.png")
$fontFiles = @("Aligra.woff2", "Audex-Regular.woff2", "Inter-Medium.woff2", "Inter-Regular.woff2", "Otfits Grotesk Reg Trial.woff2")

foreach ($targetDir in @($chromeDir, $firefoxDir)) {
  foreach ($file in $rootFiles) {
    Copy-Item -LiteralPath (Join-Path $workspace $file) -Destination (Join-Path $targetDir $file) -Force
  }

  foreach ($file in $sourceFiles) {
    Copy-Item -LiteralPath (Join-Path $workspace "src\$file") -Destination (Join-Path $targetDir "src\$file") -Force
  }

  foreach ($file in $assetFiles) {
    Copy-Item -LiteralPath (Join-Path $workspace "assets\$file") -Destination (Join-Path $targetDir "assets\$file") -Force
  }

  foreach ($file in $fontFiles) {
    Copy-Item -LiteralPath (Join-Path $workspace "fonts\$file") -Destination (Join-Path $targetDir "fonts\$file") -Force
  }
}

Copy-Item -LiteralPath (Join-Path $workspace "manifest.json") -Destination (Join-Path $chromeDir "manifest.json") -Force

$firefoxSettings = [ordered]@{
  gecko = [ordered]@{
    id = "idu-plus@vstxx.github.io"
    strict_min_version = "140.0"
    data_collection_permissions = [ordered]@{
      required = @("personallyIdentifyingInfo")
    }
  }
  gecko_android = [ordered]@{
    strict_min_version = "142.0"
  }
}

$manifest | Add-Member -NotePropertyName browser_specific_settings -NotePropertyValue $firefoxSettings -Force
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$firefoxManifestJson = ($manifest | ConvertTo-Json -Depth 20) + "`n"
[System.IO.File]::WriteAllText((Join-Path $firefoxDir "manifest.json"), $firefoxManifestJson, $utf8NoBom)

Push-Location $workspace
try {
  node scripts/build-safari-userscript.cjs
} finally {
  Pop-Location
}

Copy-Item -LiteralPath (Join-Path $workspace "README.md") -Destination (Join-Path $safariDir "README-extension.md") -Force
$safariReadmeTemplate = Get-Content -Raw (Join-Path $workspace "scripts\safari-userscript-readme.md")
$safariReadme = $safariReadmeTemplate.Replace("{{VERSION}}", $version)
[System.IO.File]::WriteAllText((Join-Path $safariDir "README.md"), $safariReadme, $utf8NoBom)

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function New-ReleaseZip {
  param(
    [Parameter(Mandatory = $true)][string]$SourceDirectory,
    [Parameter(Mandatory = $true)][string]$DestinationPath
  )

  $resolvedSource = (Resolve-Path $SourceDirectory).Path
  $sourcePrefix = $resolvedSource.TrimEnd("\") + "\"
  $absoluteDestination = [System.IO.Path]::GetFullPath($DestinationPath)

  if (-not $absoluteDestination.StartsWith($releaseRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Archive target escaped the release directory: $absoluteDestination"
  }

  if (Test-Path -LiteralPath $absoluteDestination) {
    Remove-Item -LiteralPath $absoluteDestination -Force
  }

  $stream = [System.IO.File]::Open($absoluteDestination, [System.IO.FileMode]::CreateNew)
  $archive = New-Object System.IO.Compression.ZipArchive(
    $stream,
    [System.IO.Compression.ZipArchiveMode]::Create,
    $false
  )

  try {
    Get-ChildItem -LiteralPath $resolvedSource -Recurse -File |
      Sort-Object FullName |
      ForEach-Object {
        if (-not $_.FullName.StartsWith($sourcePrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
          throw "Archive input escaped its source directory: $($_.FullName)"
        }

        $entryName = $_.FullName.Substring($sourcePrefix.Length).Replace("\", "/")
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
          $archive,
          $_.FullName,
          $entryName,
          [System.IO.Compression.CompressionLevel]::Optimal
        ) | Out-Null
      }
  } finally {
    $archive.Dispose()
    $stream.Dispose()
  }
}

New-ReleaseZip -SourceDirectory $chromeDir -DestinationPath (Join-Path $releaseRoot "idu-plus-chrome-web-store.zip")
New-ReleaseZip -SourceDirectory $firefoxDir -DestinationPath (Join-Path $releaseRoot "idu-plus-firefox-addon.zip")
Copy-Item -LiteralPath (Join-Path $releaseRoot "idu-plus-firefox-addon.zip") -Destination (Join-Path $releaseRoot "idu-plus-firefox-addon.xpi") -Force
New-ReleaseZip -SourceDirectory $safariDir -DestinationPath (Join-Path $releaseRoot "idu-plus-safari-userscript.zip")

$releaseArchives = @(
  "idu-plus-chrome-web-store.zip",
  "idu-plus-firefox-addon.zip",
  "idu-plus-firefox-addon.xpi",
  "idu-plus-safari-userscript.zip"
)
$checksumLines = $releaseArchives | ForEach-Object {
  $hash = (Get-FileHash -LiteralPath (Join-Path $releaseRoot $_) -Algorithm SHA256).Hash.ToLowerInvariant()
  "$hash  $_"
}
[System.IO.File]::WriteAllLines((Join-Path $releaseRoot "SHA256SUMS-$version.txt"), $checksumLines, $utf8NoBom)

Write-Output "Built IDU+ $version release packages in $releaseRoot"
