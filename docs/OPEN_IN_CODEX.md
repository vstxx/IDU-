# Jak odpalić IDU+ w Codexie i Chrome

## 1. Rozpakuj ZIP

Rozpakuj `IDUPlus-Codex-Workspace-v0.3.1.zip` do normalnego folderu, np.:

```txt
C:\Users\Janek\Desktop\IDUPlus-Codex-Workspace-v0.3.1
```

W środku tego folderu musi być bezpośrednio `manifest.json`, a nie kolejny zagnieżdżony folder.

## 2. Otwórz folder w Codexie

Otwórz cały folder `IDUPlus-Codex-Workspace-v0.3.1` jako projekt/repo.

Najważniejsze pliki:

```txt
manifest.json              # konfiguracja Chrome/Opera extension
content/idu-modern.css     # główny redesign strony IDU
content/idu-modern.js      # tagowanie stron, mobile cards, naprawy DOM
popup/popup.html           # popup IDU+
popup/popup.css
popup/popup.js
README_PL.md
CHANGELOG.md
docs/CODEX_NEXT_PROMPT.md  # gotowy prompt do dalszej pracy
```

## 3. Sprawdź projekt lokalnie

Jeżeli masz Node.js:

```bash
npm run check
```

To nie buduje aplikacji, tylko sprawdza, czy extension ma wymagane pliki i poprawny manifest.

## 4. Załaduj w Chrome

1. Wejdź w `chrome://extensions`.
2. Włącz `Developer mode`.
3. Kliknij `Load unpacked`.
4. Wybierz folder projektu, czyli folder z `manifest.json`.
5. Wejdź na `https://s19.idu.edu.pl/` i odśwież stronę.

## 5. Opera GX

To samo, tylko użyj:

```txt
opera://extensions
```

## 6. Pakowanie ZIP po zmianach

Jeżeli masz `zip` w systemie:

```bash
npm run pack
```

Gotowa paczka pojawi się w:

```txt
dist/IDUPlus-extension.zip
```

Na Windowsie bez `zip` można użyć ręcznie: zaznacz `manifest.json`, `content`, `popup`, `icons`, `README_PL.md`, `CHANGELOG.md` → wyślij do ZIP.
