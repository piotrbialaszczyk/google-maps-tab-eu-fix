# Google Maps Button (EU Fix)

**Firefox extension to restore the missing "Maps" tab on Google Search results — especially for EU users affected by the Digital Markets Act.**

Adds a "Maps" tab next to "All" / "News" / "Images" on Google Search results  
Works across all EU Google domains (`google.pl`, `google.fr`, `google.de`, etc.)  
Auto-localized tab name (e.g. `Mapy`, `Plans`, `Karte`, etc.)  
Loads fast and clean — no flickering, supports BFCache  

## How to install (Temporary)

1. Open Firefox and go to `about:debugging`
2. Click **"This Firefox"** → **"Load Temporary Add-on"**
3. Select the `manifest.json` file in this folder

## How it works

- Injects a "Maps" button by cloning Google's native tab design
- Reads the search query from the current Google URL
- Appends a tab pointing to `https://www.google.com/maps/search/{query}`

## Included Files

- `content-script.js` – the main logic
- `manifest.json` – extension definition
- `icons/` – PNG icons in 16x16, 48x48, 128x128

## License

MIT — see [LICENSE](LICENSE)
