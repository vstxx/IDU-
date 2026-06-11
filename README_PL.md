# IDU+

IDU+ to lokalny Chrome/Opera WebExtension dla `https://s19.idu.edu.pl/*`, który nakłada nowoczesny, jasny i bardziej kompaktowy wygląd na stronę IDU.

Projekt jest przygotowany jako **Codex-ready workspace**: możesz rozpakować ZIP, otworzyć folder w Codexie i dalej poprawiać CSS/JS.

## Instalacja w Chrome

1. Rozpakuj ZIP.
2. Wejdź w `chrome://extensions`.
3. Włącz `Developer mode`.
4. Kliknij `Load unpacked`.
5. Wybierz folder, w którym bezpośrednio leży `manifest.json`.
6. Wejdź na `https://s19.idu.edu.pl/` i odśwież stronę.

## Instalacja w Opera GX

1. Rozpakuj ZIP.
2. Wejdź w `opera://extensions`.
3. Włącz tryb developera.
4. Kliknij `Load unpacked`.
5. Wybierz folder z `manifest.json`.

## Pliki

```txt
manifest.json              # konfiguracja extensiona
content/idu-modern.css     # główny redesign
content/idu-modern.js      # poprawki DOM, tagowanie stron, subject cards
popup/popup.html           # popup ustawień
popup/popup.css
popup/popup.js
icons/                     # ikony IDU+
docs/OPEN_IN_CODEX.md      # instrukcja odpalenia w Codexie
docs/CODEX_NEXT_PROMPT.md  # gotowy prompt do dalszej naprawy w Codexie
scripts/check-extension.mjs
scripts/pack-extension.mjs
```

## Sprawdzenie projektu

Jeżeli masz Node.js:

```bash
npm run check
```

## Spakowanie po zmianach

```bash
npm run pack
```

Wynik:

```txt
dist/IDUPlus-extension.zip
```

## Prywatność

IDU+ działa tylko na:

```txt
https://s19.idu.edu.pl/*
```

Extension nie potrzebuje hasła, cookies, tokenów ani dostępu do innych stron.

## Font

CSS używa font stacku z Inter jako pierwszą opcją:

```css
font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
```

Nie są bundlowane żadne pliki fontów i extension nie importuje fontów z zewnętrznych serwerów. Jeżeli Inter jest zainstalowany w systemie, będzie użyty; inaczej browser użyje fallbacku systemowego.
