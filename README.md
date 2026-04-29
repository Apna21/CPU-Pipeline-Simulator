# CPU Pipeline Simulator
An interactive, web-based learning tool that visualises a classic 5-stage MIPS-like CPU pipeline. The simulator pairs a deterministic pipeline engine with structured tutorials and an active-learning quiz system, making the normally invisible behaviour of stalls, forwarding, and branch flushes observable cycle-by-cycle in the browser.
This project was developed as a final-year Computer Science dissertation at the University of Reading.
---
## Features
- **5-stage MIPS-like pipeline** (IF, ID, EX, MEM, WB) with discrete clock-cycle execution.
- **Hazard Detection Unit** that handles RAW data hazards, load-use stalls, and control hazards using a predict-not-taken policy.
- **Forwarding paths** from EX/MEM and MEM/WB, surfaced through visual badges.
- **Step / Play / Back / Reset** controls with a speed slider for live demonstrations.
- **Initial State editor** for pre-configuring registers and memory before running a program.
- **Live metrics dashboard** (cycle count, instructions completed, CPI, stall count, forward count, branch accuracy).
- **Register and memory panels** with write-back highlighting and a focused memory access window.
- **Educational content** with tutorials and twelve embedded short-form videos.
- **Quiz Mode** with 24 active-learning questions across 4 modules, each able to load a scenario directly into the simulator.
- **Dark / light mode**, responsive layout, and accessible controls.
---
## Tech Stack
- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) (build tooling)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix-based components)
- [Framer Motion](https://www.framer.com/motion/) (animations)
- [Lucide Icons](https://lucide.dev/)
- [React Router v6](https://reactrouter.com/)
- [Vitest](https://vitest.dev/) (unit testing)

cd cs3ip_zain_32001784/SOURCECODE
npm install
```
### Run the Development Server
```bash
npm run dev
```
Vite will print a local URL (usually `http://localhost:8080` or `http://localhost:5173`). Open it in any modern browser.
### Build for Production
```bash
npm run build
```
The bundled output is written to `dist/`. To preview the production build locally:
```bash
npm run preview
```
### Run the Test Suite
```bash
npm run test -- --run
```
The Vitest suite covers forwarding, load-use stalls, and branch flush behaviour for the pipeline engine.
---
## Project Structure
```
SOURCECODE/
├── public/                       # Static assets (favicon, etc.)
├── CPU VIDS/                     # Tutorial videos imported by the Learn page
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── quiz/                 # QuizCard
│   │   ├── ui/                   # shadcn/ui primitives
│   │   └── ...                   # PipelineStage, ControlPanel, RegisterMemoryView, etc.
│   ├── hooks/                    # Custom React hooks (useSimulationController, useTheme, ...)
│   ├── pages/                    # Routed pages
│   │   ├── LandingPage.tsx
│   │   ├── SimulatorPage.tsx
│   │   ├── EducationalContentPage.tsx
│   │   └── QuizPage.tsx
│   ├── quiz/                     # Quiz data and types
│   ├── simulation/               # Pipeline engine, parser, types, tests
│   ├── utils/                    # Helpers (e.g., speed mapping)
│   └── main.tsx                  # App entry point
├── package.json
└── vite.config.ts
```
---

## Application Pages
| Route       | Page                | Purpose                                                 |
|-------------|---------------------|---------------------------------------------------------|
| `/`         | Landing page        | Project overview, feature highlights, navigation        |
| `/simulator`| Simulator           | Interactive pipeline execution and visualisation        |
| `/learn`    | Tutorials           | Pipeline-stage explanations, hazard guides, videos      |
| `/quiz`     | Quiz Mode           | 4 modules of 6 active-learning questions each           |
---
## Supported Instruction Set
The simulator implements a focused MIPS-like ISA subset chosen for clarity in teaching:
- Arithmetic / logical: `ADD`, `SUB`, `AND`, `OR`
- Memory: `LW`, `SW`
- Branch: `BEQ`
- Bubble: `NOP`
Labels and `offset(Rn)` addressing are supported by the assembly parser.
---
## Documentation
Additional engineering documentation is available under [`docs/`](./docs/), covering the pipeline engine, hazard detection unit, and visualisation/UI design notes.
---
## Author
Developed by **Zain Chohan** (Student ID `32001784`) as part of the CS3IP final year project, University of Reading, 2025–2026.