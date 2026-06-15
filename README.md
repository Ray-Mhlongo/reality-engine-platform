# Reality Engine

Reality Engine is an AI powered decision intelligence system built as the flagship project in Ray Mhlongo's professional portfolio.

Traditional analytics tells users what happened. Reality Engine discovers what matters, predicts what is likely to happen next, and recommends what should be done.

## Features

- CSV and `.xlsx` upload
- Demo mode with sample business data
- Local browser-based profiling for the MVP demo
- Missing value, duplicate, outlier, and data quality detection
- AI Investigation Mode
- Relationship Discovery Engine with interactive knowledge graph
- 30 day, 90 day, and 12 month forecasts
- AI Executive Boardroom with multiple decision personas
- Opportunity Scanner
- Early Warning System
- Natural language data assistant
- What-if simulation engine
- Export executive report as PDF
- Export insights and simulation results as CSV
- Case study modal for portfolio reviewers
- Privacy notice and production-ready architecture notes

## Tech Stack

- React
- Tailwind CSS
- Chart.js
- Vite
- Papa Parse
- read-excel-file
- Google Apps Script API scaffold
- PostgreSQL-ready metadata architecture
- OpenRouter-ready AI integration

## Setup

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Testing

Run the automated QA smoke scenarios:

```bash
npm run qa
```

The QA script checks demo-style data, small datasets, missing values, duplicate rows, no numeric columns, no date columns, only numeric columns, and empty datasets.

Security audit:

```bash
npm audit --omit=dev
```

Production build:

```bash
npm run build
```

## Deployment

The app is configured for static deployment through Vite.

1. Run `npm run build`.
2. Deploy the generated `dist/` folder to GitHub Pages or Cloudflare Pages.
3. For GitHub Pages, keep `base: "./"` in `vite.config.js` so assets resolve correctly from a project page.
4. Configure optional backend variables only when enabling Apps Script/OpenRouter integration.

## Environment

The app runs locally in demo mode without API keys.

Optional production variables:

```bash
VITE_APPS_SCRIPT_API_URL=
VITE_OPENROUTER_MODEL=
```

## Screenshots

Add screenshots here before publishing the portfolio case study:

- Landing hero
- AI Investigation Mode
- Relationship Discovery Engine
- Forecasting Engine
- AI Executive Boardroom
- Opportunity Scanner
- Early Warning System

## Future Roadmap

- Google OAuth and secure email login
- PostgreSQL persistence for dataset metadata and analysis history
- OpenRouter-backed analyst narratives
- Multi-agent AI workflow orchestration
- Knowledge graph storage and graph querying
- External database connectors
- Forecast model selection and backtesting
- Autonomous research agents
- Team workspaces and shared executive reports

## Known Limitations

- The MVP processes files locally in the browser.
- OpenRouter and PostgreSQL are scaffolded but optional until backend deployment is configured.
- Forecasting uses lightweight trend projection rather than a full statistical model library.
- Legacy `.xls` files are intentionally not supported to avoid vulnerable parsing dependencies.
- Export Executive Report uses the browser print dialog to save as PDF.

## Portfolio Links

- Portfolio: https://ray-mhlongo.github.io/ray-mhlongo-portfolio/index.html
- GitHub: https://github.com/Ray-Mhlongo/reality-engine-platform
- LinkedIn: https://www.linkedin.com/in/raymhlongo/
