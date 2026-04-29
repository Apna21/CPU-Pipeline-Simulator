# Core Pipeline Engine Overview

## Architecture
- **Pipeline stages** follow the classic five-stage MIPS flow: `IF → ID → EX → MEM → WB`. Each stage is rendered by `PipelineStage.tsx`, while the `PipelineEngine` class manages the actual state transitions.
- **Pipeline registers** (`IF/ID`, `ID/EX`, `EX/MEM`, `MEM/WB`) capture per-cycle snapshots of instructions, operands, control signals, and intermediate results. They are defined in `src/simulation/types.ts`.
- **CPU state** tracks the program counter, 32 integer registers, a word-addressed data memory (1024 words / 4 KB by default), and performance counters (cycles, completed instructions, stalls, forwards, branch stats). Registers and memory are stored as `Int32Array` and updated using **clone-on-write** so React reliably re-renders.
- **Snapshot API** (`PipelineEngine.getSnapshot()` and `step()`) returns immutable `PipelineSnapshot` objects consumed by the React UI. Stage components, register/memory panels, and the metrics dashboard render directly from the snapshot.

## Step Algorithm
Each `step()` corresponds to one clock cycle and executes the stages in **reverse order** so each stage observes the *previous* pipeline registers:
1. **Write Back** – commits register writes, increments `instructionsCompleted`, and records a `lastRegisterWrite` event for the UI to highlight.
2. **Memory** – performs LW/SW for the instruction in `EX/MEM` and records a `lastMemoryAccess` event (LOAD or STORE).
3. **Execute** – performs ALU operations, evaluates branches, and applies forwarding from `EX/MEM` and `MEM/WB`.
4. **Decode** – reads register operands, derives control signals, and detects load-use hazards (which insert a one-cycle stall).
5. **Fetch** – fetches the next instruction unless stalled. Branches use **predict-not-taken**; once resolved in EX, taken branches flush the younger stages and redirect the PC.
6. **Bookkeeping** – updates pipeline registers, recomputes derived metrics (CPI, branch accuracy), and halts once the program is exhausted and the pipeline drains.

## Hazard Handling
- **Data hazards (RAW)** – resolved by forwarding:
  - `EX/MEM → ID/EX` for ALU results (excluding pending memory reads).
  - `MEM/WB → ID/EX` for values that have reached WB.
- **Load-use hazards** – cannot be resolved by forwarding; the engine inserts a one-cycle bubble in `ID/EX`, holds the PC and `IF/ID`, and increments `stallCount`.
- **Control hazards** – BEQ resolves in EX. A taken branch flushes `IF/ID` and `ID/EX`, redirects the PC, and increments `branchMispredictions`.
- **Out of scope** – structural hazards, WAR/WAW, and exceptions are not modelled; the pipeline is single-issue with dedicated stage resources.

## Snapshot Enrichment
Every `PipelineSnapshot` includes:
- `stages` – per-stage view (instruction text + hazard info).
- `registers`, `memory` – full architectural state for rendering.
- `stats` – cycle count, instructions completed, stall/forward counts, branch stats, derived `cpi` and `branchAccuracy`.
- `stalledThisCycle`, `flushedThisCycle`, `forwarding` – per-cycle flags.
- `hazardEvents` – ordered list of `STALL`, `FORWARD`, and `FLUSH` events with reason metadata.
- `lastRegisterWrite`, `lastMemoryAccess` – the most recent write-back / memory access used by the UI for animated highlighting.

## Assumptions & Simplifications
- Register `R0` is hard-wired to zero – writes to it are ignored.
- Memory is byte-addressed but accessed as 32-bit words; out-of-range accesses are treated as zero-reads / no-op writes.
- Supported instruction set: `ADD`, `SUB`, `AND`, `OR`, `LW`, `SW`, `BEQ`, plus injected `NOP` bubbles when stalling.
- No caches, branch delay slots, or exception handling are modelled.

## React Integration
- `useSimulationController` (`src/hooks/useSimulationController.ts`) owns a single `PipelineEngine` instance and exposes actions (`step`, `togglePlay`, `stepBack`, `reset`, `loadProgramFromSource`) plus initial-state helpers.
- `SimulatorPage` (`src/pages/SimulatorPage.tsx`) wires the controller into the page-level layout and orchestrates the visual components.
- `PipelineStage`, `RegisterMemoryView`, `MetricsPanel`, and `InitialStatePanel` all render directly from controller state, remaining presentational.
- Play mode runs a `setInterval` whose period is derived from a user-controlled speed slider; manual stepping calls `step()` once per click.

## Initial-State Seeding
- The controller stores user-defined initial register and memory values, exposes setters/randomisers, and re-applies those values automatically on every reset and program load via `applyInitialStateToEngine()` (which uses `engine.exportState()` / `engine.restoreState()`).
- Quiz scenarios use `applyInitialRegisterPatch()` / `applyInitialMemoryPatch()` to write specific values without overwriting the rest of the user’s configured state.

## Rewind (Back-step)
- Before each `step()`, the controller pushes an `EngineState` snapshot onto a history stack via `engine.exportState()`.
- `stepBack()` pops the stack and calls `engine.restoreState()`, returning to the previous cycle without re-running the simulation.
- History is cleared on reset or program load; `canStepBack` reflects the current stack depth.

## Testing
- Vitest is configured in `vite.config.ts` and run with `npm run test -- --run`.
- `src/simulation/__tests__/pipelineEngine.test.ts` covers three regression scenarios:
  1. Forwarding resolving RAW hazards without stalling.
  2. Load-use hazards inserting a stall and emitting a `STALL` event.
  3. Taken branches flushing wrong-path instructions and incrementing the misprediction counter.
- All three tests pass against the current engine; they protect core pipeline semantics during refactoring.
