# UI Pages & Routing Overview

The application is a single-page app with four routed pages, all sharing the same layout (`AppLayout`) and a global `NavigationBar`.

## Pages

### Landing Page (`/`)
- Hero section with project title, gradient backdrop, and primary CTAs that route to `/simulator` and `/quiz`.
- Feature highlight cards covering pipeline visualisation, hazard handling, and the integrated learning loop.
- Three-step *guided learning* card linking back to Tutorials, Simulator, and Quiz Mode.
- All sections animate on scroll using Framer Motion `whileInView`.

### Simulator Page (`/simulator`)
- Hero introduction with quick-info badges (5 stages, hazards highlighted, quiz scenarios load instantly).
- Pipeline visualisation with five colour-coded stage cards joined by animated flow connectors and live hazard badges.
- `ControlPanel` with Play/Pause, Step, Back, Reset, and a speed slider.
- `InitialStatePanel` (collapsible, collapsed by default) for editing/randomising register and memory state before execution.
- `InstructionEditor` for writing or pasting assembly programs.
- `RegisterMemoryView` showing the first eight registers by default (toggle for all 32) plus a focused memory window with load/store highlights.
- `MetricsPanel` with cycle count, CPI, stalls, forwards, branches, and branch accuracy.
- Help and About dialogs are reachable from the hero buttons.
- When a quiz scenario is loaded via `location.state.scenario`, the page seeds the initial registers/memory, loads the program, and immediately applies-and-resets so the learner can step through right away.

### Tutorials Page (`/learn`)
- Structured learning content split into four sections: Introduction to Pipelining, The Five Pipeline Stages, Hazards and How to Spot Them, and Guided Example Walkthroughs.
- Each topic is a collapsible card with written explanation, a teaching tip, and an embedded short-form video (12 videos in total, imported from `CPU VIDS/`).
- A footer card encourages users to continue into the Simulator or Quiz Mode.

### Quiz Page (`/quiz`)
- Hero introduction summarising the score and answered count.
- Four collapsible modules of six questions each (24 questions total), aligned with the Tutorials sections:
  1. Pipeline Foundations
  2. Pipeline Stages
  3. Hazards and Recovery
  4. Guided Examples
- Each question card supports multiple-choice answers, optional hints, immediate correctness feedback, a *Show Explanation* toggle, and (where applicable) a **Load in Simulator** button that hands a preconfigured scenario to the simulator.
- A per-module progress bar shows answered / score and updates in real time.
- A *Reset Progress* button clears all responses and re-renders the question cards.

## Routing Structure
`App.tsx` wires the routes inside `AppLayout`, which provides the shared `NavigationBar`:

| Route        | Component               |
|--------------|-------------------------|
| `/`          | `LandingPage`           |
| `/simulator` | `SimulatorPage`         |
| `/learn`     | `EducationalContentPage`|
| `/quiz`      | `QuizPage`              |
| `*`          | `NotFound`              |

## Global Navigation & Theme
- `NavigationBar` provides Home / Simulator / Tutorials / Quiz Mode links, highlights the active route, and exposes the dark-mode toggle backed by `useTheme`.
- Active links use the primary colour; hover states use semantic muted tokens so contrast is preserved across themes.
