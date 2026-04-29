# Quiz Mode & Active-Learning System

Quiz Mode bridges the tutorials and the simulator. It presents structured, scenario-backed questions that the learner can verify by loading the matching program directly into the simulator.

## Data Model
Quiz content is fully declarative and lives in `src/quiz/`:

- `types.ts` – the type definitions (`QuizModule`, `QuizQuestion`, `QuizChoice`, `QuizScenario`).
- `quizData.ts` – the four exported modules with their questions and scenarios.

A `QuizScenario` carries everything needed to launch a relevant program in the simulator:

```ts
interface QuizScenario {
  id: string;
  title: string;
  program: string;                            // Assembly source
  description?: string;
  initialRegisters?: Record<number, number>;  // Sparse register seeds
  initialMemory?: Record<number, number>;     // Sparse memory seeds (word indices)
}
```

A `QuizQuestion` references an optional `scenario`, allowing the question to launch the simulator with a preconfigured environment:

```ts
interface QuizQuestion {
  id: string;
  title: string;
  prompt: string;
  choices: QuizChoice[];
  correctChoiceId: string;
  explanation: string;
  hint?: string;
  scenario?: QuizScenario;
}
```

Modules group six questions each, with a free-text label (`tutorialSection`) that mirrors the relevant Tutorials section so learners know which tutorial backs the questions.

## Modules
The default deck contains 24 questions across four modules:

| # | Module                       | Source tutorial section                  |
|---|------------------------------|------------------------------------------|
| 1 | Pipeline Foundations         | Introduction to CPU Pipelining           |
| 2 | Pipeline Stages              | The Five Pipeline Stages                 |
| 3 | Hazards and Recovery         | Hazards and How to Spot Them             |
| 4 | Guided Examples              | Guided Example Walkthroughs              |

## Components

### `QuizPage` (`src/pages/QuizPage.tsx`)
- Renders the page hero, score / answered counts, and a *Reset Progress* button.
- Maps over `quizModules`, displaying each as a collapsible card with a progress bar and the module’s questions when expanded.
- Tracks responses in component state so users can answer in any order.
- On *Load in Simulator*, navigates to `/simulator` with a `state` payload containing the scenario.

### `QuizCard` (`src/components/quiz/QuizCard.tsx`)
- Presents one question with a numbered title, prompt, optional hint, multiple-choice options (Radix `RadioGroup`), and a Check-Answer button.
- Shows correctness feedback after submission and a *Show Explanation* toggle.
- Supports a `Load in Simulator` button when the question has an attached scenario.
- Accepts a `resetSignal` prop so the parent can clear answer state when the user resets progress.

## Simulator Integration

`SimulatorPage` listens for an incoming scenario in `location.state.scenario`. When found, it:

1. Pauses any running playback.
2. Applies the scenario’s register/memory patches via `applyInitialRegisterPatch()` / `applyInitialMemoryPatch()` so unrelated initial-state values are preserved.
3. Loads the scenario’s program into the engine via `loadProgramFromSource()`.
4. Calls `applyInitialStateAndReset()` (with a deferred `applyCurrentInitialState()` follow-up) so the engine starts at cycle 0 with the seeded values visible immediately.
5. Displays a toast confirming the scenario has loaded.

## Pedagogical Intent
Quiz Mode is designed for **active verification rather than memorisation**. Each scenario question encourages the learner to:

1. Read the question and pick an initial answer based on intuition.
2. Click *Load in Simulator* to inspect the program in the actual pipeline.
3. Use Step / Play / Back to confirm or correct the chosen answer.
4. Submit and read the explanation, optionally referring back to the relevant tutorial.

This loop is the distinctive contribution of the system: it converts a static quiz into an exploratory exercise without leaving the application.
