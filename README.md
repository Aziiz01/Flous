# Flous

**Flous** is a playful portfolio piece: **see your Tunisian dinar (TND) amount as stacks of bills** in 3D, then optionally peek at physical scale and rough “what could this buy?” ideas — built to impress, not to bank on.

---

## Author

**Concept, design, and development:** [Mohamed Aziz Nacib](https://github.com/Aziiz01)

All project code, assets, and documentation in this repository were created by Mohamed Aziz Nacib unless otherwise noted for third-party libraries (see [Dependencies](#dependencies)).

---

## Features

- **Amount & denomination** — Enter up to **1,000,000 TND** and pick **10 / 20 / 50 TND** notes (bill count is computed from the amount). On first load with no `amount` query parameter, the amount field is **empty** until you choose **Visualize** (default note is **20 TND**).
- **3D stacking** — Full-screen money scene: bills fall into stacks; orbit the view when the run finishes.
- **Large amounts** — All runs now keep the falling-bill animation for visual continuity.
- **Skip waiting** — Optional control to finish the animation immediately and show full stacks.
- **Scale insights** — Interactive comparisons (pick a reference landmark; dual bars show your stack vs the reference) using US note dimensions as a model.
- **Purchasing power (estimate)** — Mini **guessing game** plus a reference list; rough TND→USD rate (entertainment / education only, not financial advice).
- **Feedback** — Rate-project flow with EmailJS (configure your own keys in `src/config/emailjs.js`).
- **URL state** — Shareable links via `amount` and `denom` query parameters.

## SEO

`index.html` includes primary meta tags, Open Graph and Twitter cards, and JSON-LD (`WebApplication`). `public/robots.txt` and `public/sitemap.xml` reference the canonical site URL. Defaults target GitHub Pages at `https://aziiz01.github.io/Flous/` — if you deploy elsewhere, replace that base URL in those files and in `index.html` (canonical, `og:url`, and structured data).

---

## Tech stack

| Layer | Choice |
|--------|--------|
| UI | React 19 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| 3D | Three.js |
| Animation | GSAP |
| Email | EmailJS (`@emailjs/browser`) |

---

## Project structure

```
├── public/
├── src/
│   ├── components/     # UI and 3D scene (e.g. ThreeMoneyScene, overlays, input)
│   ├── config/         # Scene tuning, credit links, EmailJS config
│   ├── data/           # Denominations, purchasable items for estimates
│   ├── utils/          # Formatting, scale math, toast copy
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

---

## Getting started

### Requirements

- **Node.js** 18+ (20+ recommended)

### Install

```bash
git clone https://github.com/Aziiz01/Flous.git
cd Flous
npm install
```

### Development

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### Production build

```bash
npm run build
```

Output is written to `dist/`. Preview locally:

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## Configuration

### EmailJS (optional)

Rate / feedback emails use EmailJS. Copy `src/config/emailjs.js` patterns and supply your own service, template, and public key. Without valid configuration, the UI may still render but sending can fail until keys are set.

### Skip waiting control

If you want to end the animation immediately, use the **Skip waiting** button while the run is active.

---

## Dependencies

This project uses open-source packages listed in `package.json` (React, Vite, Three.js, Tailwind, GSAP, EmailJS, ESLint, etc.). Their licenses apply to those packages only.

---

## License

Copyright © Mohamed Aziz Nacib. All rights reserved unless you add a separate license file with different terms.

---

## Repository

**GitHub:** [https://github.com/Aziiz01/Flous](https://github.com/Aziiz01/Flous)
