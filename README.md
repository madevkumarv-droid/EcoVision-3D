# EcoVision 3D

An interactive sustainability explorer for understanding household emissions and exploring renewable energy. EcoVision 3D brings together an interactive Three.js globe, environmental indicator dashboard, carbon footprint calculator, energy simulator, and an AI-assisted sustainability advisor.

## Features

- **3D Earth explorer** — rotate and zoom the globe, explore renewable energy project markers, and inspect projects.
- **Environmental dashboard** — view environmental indicators and their stated sources.
- **Carbon footprint calculator** — estimate a household carbon footprint from lifestyle and energy inputs.
- **Micro-grid energy simulator** — explore solar and energy storage scenarios.
- **AI sustainability advisor** — request tailored recommendations using the footprint calculator results or a custom question. When Gemini is unavailable, the server provides a heuristic fallback.
- **Renewables catalog and action tips** — browse renewable energy projects and practical sustainability actions.

## Tech stack

- React 19 and TypeScript
- Vite
- Three.js
- Express
- Google Gemini API (`@google/genai`)
- Tailwind CSS

## Requirements

- [Bun](https://bun.sh/) for dependency installation and running the provided scripts.
- A Gemini API key is optional. Without one, the AI advisor uses its built-in fallback recommendations.

## Getting started

```bash
git clone https://github.com/madevkumarv-droid/EcoVision-3D.git
cd EcoVision-3D
bun install
```

Create a local environment file if you want to enable Gemini-powered recommendations:

```bash
cp .env.example .env
```

Set `GEMINI_API_KEY` in `.env` to your Gemini API key. Keep secrets out of source control; `.env` should not be committed.

Start the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Start the Express server with Vite development middleware. |
| `bun run build` | Build the frontend into `dist/`. |
| `bun run start` | Start the server; set `NODE_ENV=production` to serve the production build. |
| `bun run preview` | Run Vite's preview server for the built frontend. |
| `bun run lint` | Run TypeScript type checking (`tsc --noEmit`). |
| `bun run clean` | Remove the generated `dist/` and `server.js` files. |

For a production run, build first and then start the server with `NODE_ENV=production`:

```bash
bun run build
NODE_ENV=production bun run start
```

The server listens on port `3000` by default. Set the `PORT` environment variable to use a different port.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | No | Enables Gemini-backed AI advisor responses. Without it, heuristic recommendations are returned. |
| `APP_URL` | No | Hosting URL for the application; mainly used in hosted AI Studio deployments. |
| `PORT` | No | Server port (defaults to `3000`). |

See [`.env.example`](.env.example) for the environment file template.

## API endpoints

- `POST /api/advisor` — accepts optional `footprintData` and `customQuery` JSON fields and returns a sustainability recommendation.
- `GET /api/environmental-indicators` — returns the environmental indicator snapshot used by the app.

## Project structure

```text
.
├── server.ts               # Express server, API endpoints, and Vite integration
├── src/
│   ├── App.tsx             # Main application and feature composition
│   ├── components/         # Globe, dashboard, calculator, simulator, and other UI
│   ├── data/               # Application data
│   └── types/              # TypeScript types
├── .env.example            # Environment variable template
├── package.json            # Scripts and dependencies
└── vite.config.ts          # Vite configuration
```

## Notes

The environmental indicators endpoint returns values embedded in the server implementation; it should not be treated as a live data feed. Refer to the displayed source attribution and independently verify figures before using them for research or decision-making.

## License

The application source includes an Apache-2.0 SPDX identifier. See the relevant source headers and repository files for licensing details.
