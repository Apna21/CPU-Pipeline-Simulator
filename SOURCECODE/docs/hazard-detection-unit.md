# Hazard Detection Unit (HDU)

The HDU is implemented inside `PipelineEngine` rather than as a separate module, reflecting how hazard logic interleaves with stage execution in real hardware. Hazard outcomes are surfaced through the `PipelineSnapshot` so the UI can render them without re-deriving them.

## Supported Hazards

### RAW (Read After Write)
- Forwarding paths: `EX/MEM → EX` and `MEM/WB → EX` for both operands A and B.
- Forwarding is rejected when the producing instruction is a pending load (data not yet available); the engine then falls back to the load-use stall path.
- Each applied forwarding path increments `forwardCount` and emits a `FORWARD` event with the source register and stage.

### Load-Use Stall
- Detected at decode when the instruction in `IF/ID` reads a register being written by a load currently in `ID/EX`.
- The HDU inserts a bubble into `ID/EX`, holds `PC` and `IF/ID` for one cycle, and increments `stallCount`.
- Emits a `STALL` event (`reason = "load-use"`).

### Control Hazards (BEQ)
- Predict-not-taken policy with EX-stage resolution.
- Taken branches:
  - Replace `IF/ID` and `ID/EX` with bubbles.
  - Redirect the PC to the branch target.
  - Increment `branchMispredictions`.
  - Emit a `FLUSH` event.

## Assumptions & Simplifications
- Instruction subset: `ADD`, `SUB`, `AND`, `OR`, `LW`, `SW`, `BEQ`, plus injected `NOP`.
- No structural hazards, WAR, or WAW hazards are modelled; the pipeline is single-issue with dedicated resources.
- Register `R0` remains zero — writes are ignored.
- Memory is word-addressed (1024 words / 4 KB by default) without cache effects.

## Snapshot Telemetry
Every `PipelineSnapshot` exposes:
- `stalledThisCycle`, `flushedThisCycle` – boolean flags driving stage borders.
- `forwarding` – `aFrom` / `bFrom` indicating whether each operand was forwarded from `EX/MEM` or `MEM/WB`.
- `hazardEvents` – ordered list of `STALL`, `FORWARD`, and `FLUSH` events, each annotated with reason / source / target stage.
- `lastRegisterWrite` and `lastMemoryAccess` – most recent write-back / load-store events, used by the register and memory panels for live highlighting.
- Updated counters: `stallCount`, `forwardCount`, `branchCount`, `branchMispredictions`, plus derived `branchAccuracy`.

## Validation Programs
The Vitest suite (`src/simulation/__tests__/pipelineEngine.test.ts`) exercises the same scenarios shown below.

```asm
# A) RAW hazard resolved via forwarding
ADD R1, R2, R3
SUB R4, R1, R5

# B) Load-use hazard requiring a stall
LW  R1, 0(R2)
ADD R3, R1, R4

# C) Branch taken, flushing wrong-path instruction
BEQ R1, R2, 2     # numeric branch offset (or label such as TARGET)
ADD R3, R3, R3    # flushed when branch is taken
ADD R4, R4, R4
```

Expected metrics:
- (A) `stallCount = 0`, `forwardCount > 0`, at least one `FORWARD` event.
- (B) `stallCount ≥ 1`, at least one `STALL` event with `reason = "load-use"`.
- (C) `branchCount = 1`, `branchMispredictions = 1`, at least one `FLUSH` event.

Run `npm run test -- --run` to execute these checks against the current engine.
