# Flous

**Flous** is an interactive web app that visualizes Tunisian dinar (TND) money at scale: enter an amount and denomination, then watch stacks of bills build in 3D, with optional comparisons for physical scale and rough purchasing-power ideas.

---

## Author

**Concept, design, and development:** [Mohamed Aziz Nacib](https://github.com/Aziiz01)

All project code, assets, and documentation in this repository were created by Mohamed Aziz Nacib unless otherwise noted for third-party libraries (see [Dependencies](#dependencies)).

---

## Features

- **Amount & denomination** — Enter a TND amount and pick a note denomination (bill count is computed from the amount). On first load with no `amount` query parameter, the field starts at **1,000,000** TND with the **20 TND** note selected.
- **3D stacking** — Three.js scene with bill stacks, falling-bill animation, and orbit controls after the run finishes.
- **Large amounts** — All runs now keep the falling-bill animation for visual continuity.
- **Skip waiting** — Optional control to finish the animation immediately and show full stacks.
- **Scale insights** — Height, ground area, volume, and weight comparisons using US note dimensions as a model (see in-app copy).
- **Purchasing power (estimate)** — Illustrative “what could this buy?” list using a rough TND→USD rate (entertainment / education only, not financial advice).
- **Feedback** — Rate-project flow with EmailJS (configure your own keys in `src/config/emailjs.js`).
- **URL state** — Shareable links via `amount` and `denom` query parameters.

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
