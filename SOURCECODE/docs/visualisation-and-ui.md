# Visualisation & UI Components

The UI is designed to make the invisible decisions of the pipeline visible. All UI state is derived from a single `PipelineSnapshot`, so the engine and the components stay decoupled.

## Snapshot Flow
- `useSimulationController` (`src/hooks/useSimulationController.ts`) owns the `PipelineEngine`, the latest `PipelineSnapshot`, and a per-cycle history.
- The hook exposes control handlers (`step`, `togglePlay`, `stepBack`, `reset`, `loadProgramFromSource`), initial-state helpers (`setInitialRegisterValue`, `setInitialMemoryValue`, `randomizeInitialRegisters`, `randomizeInitialMemory`, `applyInitialRegisterPatch`, `applyInitialMemoryPatch`, `applyInitialStateAndReset`, `applyCurrentInitialState`), and derived state (`isPlaying`, `isHalted`, `speed`, `canStepBack`).
- `SimulatorPage` (`src/pages/SimulatorPage.tsx`) consumes the controller and forwards plain props down to presentational components.

## Pipeline & Hazard Visuals
- `PipelineStage` renders the stage label, current instruction, hazard state, and a list of micro-badges:
  - Instruction-type badges (`ALU`, `MEM`, `BRANCH`).
  - Hazard badges (`STALL`, `FLUSH`).
  - Forwarding badges (`A←EX/MEM`, `B←MEM/WB`, etc.).
- Stage borders switch colour for stalls (`hazard-stall`) and forwarding (`hazard-forward`) using snapshot data.
- `ControlPanel` shows the current status (Running / Ready / Halted) and exposes Play/Pause, Step, Back, Reset, and a speed slider; Back is disabled when there is no recorded history.

## Register & Memory Panel
- The Registers tab shows the **first eight registers** by default with a *Show All Registers* toggle to reveal R0–R31; the toggle is local to the panel.
- A “Write-back Activity” card summarises `snapshot.lastRegisterWrite` (register, value, cycle, instruction). The matching row in the table receives a green pulsing highlight for a single cycle.
- The Memory tab shows a focused window centred on the most recent access (`snapshot.lastMemoryAccess`) instead of a full memory dump. Loads and stores are colour-coded (sky blue for LOAD, amber for STORE) and the affected cell carries a Load/Store badge with the cycle number.
- An optional “Last Memory Access” summary at the top of the tab repeats the address and value for accessibility and demos.

## Initial State Panel
- `InitialStatePanel` (`src/components/InitialStatePanel.tsx`) is collapsed by default.
- Provides input fields for registers R0–R31 (R0 disabled), a paged memory editor (16 cells per page), and dedicated Reset / Randomise buttons for both registers and memory.
- An *Apply & Reset Simulation* button reapplies the current initial-state configuration to the engine and clears the history. Apply is disabled while the simulator is running.
- The controller automatically reapplies the initial state whenever a program is loaded or the simulator is reset, so user-edited values never need to be reapplied manually.

## Metrics Dashboard
- `MetricsPanel` aggregates `cycleCount`, `instructionsCompleted`, `cpi`, `stallCount`, `forwardCount`, `branchCount`, `branchMispredictions`, and `branchAccuracy` from the snapshot.
- All values update every cycle and rewind correctly when the user uses Back-step.

## Back-Step History
- Every call to `step()` pushes the current snapshot and a serialised engine state (`engine.exportState()`) onto a history stack before advancing.
- “Back” pops the stack, restores the engine via `engine.restoreState()`, and rehydrates the previous snapshot without recomputing or mutating the original program.
- History is cleared on reset or program load; the controller exposes `canStepBack` to disable the button when empty.

## Theming
- `useTheme` (`src/hooks/useTheme.ts`) manages a `light` / `dark` flag persisted in `localStorage` and synced with system preference changes.
- The theme toggle lives in `NavigationBar`, which updates the `<html>` `className` so Tailwind’s `dark:` utilities apply automatically.
- Most surfaces use semantic Tailwind tokens (`bg-background`, `bg-card`, `text-foreground`, `border-border`, `text-primary`) so dark mode adapts without manual overrides.

## Animation
- Subtle scroll-triggered animations are driven by Framer Motion’s `whileInView` on the Landing, Tutorials, Quiz, and Simulator pages.
- Animations are decorative only; the simulator never relies on them for correctness.
- `useInViewAnimation` (`src/hooks/useInViewAnimation.ts`) is available as a reusable IntersectionObserver-based fallback.

## Accessibility
- High-contrast colour palette in both light and dark modes.
- All interactive elements (controls, inputs, badges) use Radix-based shadcn/ui primitives that ship with keyboard navigation and ARIA semantics.
- The simulator was tested in Chrome, Edge, and Firefox.
