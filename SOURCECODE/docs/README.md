# Documentation Index

Engineering documentation for the CPU Pipeline Simulator. Each document focuses on one architectural concern.

| Document | Scope |
|----------|-------|
| [`pipeline-engine.md`](./pipeline-engine.md) | Pipeline engine architecture, step algorithm, snapshot model, controller integration, rewind, and tests. |
| [`hazard-detection-unit.md`](./hazard-detection-unit.md) | Hazard detection logic for RAW, load-use, and control hazards, plus the snapshot telemetry it produces. |
| [`visualisation-and-ui.md`](./visualisation-and-ui.md) | UI architecture: snapshot flow, pipeline visuals, register/memory panels, initial-state panel, theming, animations, and accessibility. |
| [`ui-pages.md`](./ui-pages.md) | Routing, layout, and page-level overview (Landing, Simulator, Tutorials, Quiz Mode). |
| [`quiz-system.md`](./quiz-system.md) | Quiz Mode data model, components, simulator integration, and pedagogical intent. |

For a high-level overview of the project and how to run it, see the top-level [`README.md`](../README.md).
