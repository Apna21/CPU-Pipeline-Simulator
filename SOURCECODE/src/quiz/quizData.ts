import { QuizModule } from "./types";

const joinProgram = (lines: string[]): string => lines.join("\n").trim();

export const quizModules: QuizModule[] = [
  {
    id: "foundations",
    title: "Module 1 · Pipeline Foundations",
    description:
      "Revisit the core ideas behind pipelining before diving into stage-specific behaviour.",
    tutorialSection: "Introduction to CPU Pipelining",
    questions: [
      {
        id: "foundations-stage-fetch",
        title: "Pipeline Stage Basics",
        prompt: "In which pipeline stage does the CPU fetch the next instruction from memory?",
        choices: [
          { id: "if", text: "Instruction Fetch (IF)" },
          { id: "id", text: "Instruction Decode (ID)" },
          { id: "ex", text: "Execute (EX)" },
          { id: "mem", text: "Memory Access (MEM)" },
        ],
        correctChoiceId: "if",
        explanation:
          "The Instruction Fetch (IF) stage reads the next instruction from memory using the program counter.",
        hint: "Consider which stage comes first in the pipeline.",
      },
      {
        id: "foundations-throughput",
        title: "Why Pipeline?",
        prompt: "What is the primary performance benefit of pipelining a CPU?",
        choices: [
          { id: "throughput", text: "It increases instruction throughput" },
          { id: "frequency", text: "It allows a lower clock frequency" },
          { id: "power", text: "It reduces overall power usage" },
          { id: "latency", text: "It reduces the latency of every instruction to one cycle" },
        ],
        correctChoiceId: "throughput",
        explanation:
          "Pipelining overlaps instruction execution so multiple instructions progress simultaneously, increasing throughput.",
      },
      {
        id: "foundations-concurrency",
        title: "How Many Instructions?",
        prompt:
          "In an ideal five-stage pipeline running steady-state, how many instructions can be in-flight at once?",
        choices: [
          { id: "one", text: "One instruction" },
          { id: "two", text: "Two instructions" },
          { id: "five", text: "Up to five instructions" },
          { id: "unlimited", text: "An unlimited number of instructions" },
        ],
        correctChoiceId: "five",
        explanation:
          "Each of the five pipeline stages can hold one instruction during steady-state operation, so up to five instructions are active.",
      },
      {
        id: "foundations-cpi",
        title: "Cycles Per Instruction",
        prompt:
          "When the pipeline is full and no hazards occur, what is the ideal CPI (cycles per instruction)?",
        choices: [
          { id: "cpi1", text: "1 cycle per instruction" },
          { id: "cpi2", text: "2 cycles per instruction" },
          { id: "cpi5", text: "5 cycles per instruction" },
          { id: "cpiVar", text: "It varies depending on the instruction" },
        ],
        correctChoiceId: "cpi1",
        explanation:
          "In steady state, the pipeline completes one instruction each cycle, resulting in an ideal CPI of 1.",
      },
      {
        id: "foundations-terminology",
        title: "Terminology Check",
        prompt:
          "What term describes the technique of overlapping instruction execution across multiple stages?",
        choices: [
          { id: "pipelining", text: "Pipelining" },
          { id: "caching", text: "Caching" },
          { id: "speculation", text: "Speculation" },
          { id: "virtualization", text: "Virtualization" },
        ],
        correctChoiceId: "pipelining",
        explanation:
          "Pipelining is the technique of dividing instruction execution into stages so multiple instructions overlap in time.",
      },
      {
        id: "foundations-fill",
        title: "Pipeline Warm-up",
        prompt:
          "Load the warm-up sequence and step through it. After how many cycles does the first instruction write back its result?",
        choices: [
          { id: "cycle1", text: "After 1 cycle" },
          { id: "cycle3", text: "After 3 cycles" },
          { id: "cycle5", text: "After 5 cycles" },
          { id: "cycle7", text: "After 7 cycles" },
        ],
        correctChoiceId: "cycle5",
        explanation:
          "In a five-stage pipeline, the first instruction completes Write Back on the fifth cycle after it enters the pipeline.",
        scenario: {
          id: "foundations-fill",
          title: "Pipeline Warm-up",
          program: joinProgram(["ADD R1, R2, R3", "SUB R4, R5, R6", "AND R7, R8, R9"]),
          initialRegisters: {
            2: 5,
            3: 6,
            5: 9,
            6: 3,
            8: 1,
            9: 1,
          },
        },
      },
    ],
  },
  {
    id: "stages",
    title: "Module 2 · Pipeline Stages",
    description:
      "Match each pipeline stage with its responsibilities and observe how the simulator visualises their work.",
    tutorialSection: "The Five Pipeline Stages",
    questions: [
      {
        id: "stages-register-read",
        title: "Register Reads",
        prompt: "Which stage reads operands from the register file?",
        choices: [
          { id: "if", text: "Instruction Fetch (IF)" },
          { id: "id", text: "Instruction Decode (ID)" },
          { id: "ex", text: "Execute (EX)" },
          { id: "wb", text: "Write Back (WB)" },
        ],
        correctChoiceId: "id",
        explanation:
          "During ID, the pipeline decodes the instruction and reads any required registers.",
      },
      {
        id: "stages-alu",
        title: "Arithmetic Logic",
        prompt: "Which stage performs arithmetic and logical operations, such as addition or subtraction?",
        choices: [
          { id: "if", text: "Instruction Fetch (IF)" },
          { id: "ex", text: "Execute (EX)" },
          { id: "mem", text: "Memory Access (MEM)" },
          { id: "wb", text: "Write Back (WB)" },
        ],
        correctChoiceId: "ex",
        explanation:
          "The Execute stage sends operands to the ALU to perform arithmetic, logic, and branch calculations.",
      },
      {
        id: "stages-memory-access",
        title: "Data Memory Access",
        prompt: "Which pipeline stage can read from or write to data memory?",
        choices: [
          { id: "if", text: "Instruction Fetch (IF)" },
          { id: "id", text: "Instruction Decode (ID)" },
          { id: "mem", text: "Memory Access (MEM)" },
          { id: "wb", text: "Write Back (WB)" },
        ],
        correctChoiceId: "mem",
        explanation:
          "Loads and stores access data memory in the MEM stage; ALU instructions simply pass their results through.",
      },
      {
        id: "stages-writeback",
        title: "Register Updates",
        prompt: "Which stage writes results back into the register file?",
        choices: [
          { id: "if", text: "Instruction Fetch (IF)" },
          { id: "id", text: "Instruction Decode (ID)" },
          { id: "mem", text: "Memory Access (MEM)" },
          { id: "wb", text: "Write Back (WB)" },
        ],
        correctChoiceId: "wb",
        explanation:
          "The final stage (WB) writes either the ALU result or loaded data back to the destination register.",
      },
      {
        id: "stages-pc-update",
        title: "Program Counter Update",
        prompt: "During sequential execution (no taken branch), which stage updates the PC to the next instruction?",
        choices: [
          { id: "if", text: "Instruction Fetch (IF)" },
          { id: "id", text: "Instruction Decode (ID)" },
          { id: "ex", text: "Execute (EX)" },
          { id: "mem", text: "Memory Access (MEM)" },
        ],
        correctChoiceId: "if",
        explanation:
          "The IF stage increments the program counter to point at the next instruction, assuming the branch predictor says 'not taken'.",
      },
      {
        id: "stages-forwarding",
        title: "Spot the Forwarding Stage",
        prompt:
          "Load the forwarding scenario. When the second instruction executes, which stage displays the forwarding badge?",
        choices: [
          { id: "if", text: "Instruction Fetch (IF)" },
          { id: "id", text: "Instruction Decode (ID)" },
          { id: "ex", text: "Execute (EX)" },
          { id: "mem", text: "Memory Access (MEM)" },
        ],
        correctChoiceId: "ex",
        explanation:
          "Forwarding paths feed the EX stage inputs, so the EX stage shows the forwarding badges when dependencies are resolved without stalling.",
        scenario: {
          id: "stages-forwarding",
          title: "Forwarding Demonstration",
          program: joinProgram(["ADD R1, R2, R3", "ADD R4, R1, R5"]),
          initialRegisters: {
            2: 7,
            3: 2,
            5: 9,
          },
        },
      },
    ],
  },
  {
    id: "hazards",
    title: "Module 3 · Hazards and Recovery",
    description:
      "Identify different hazards and observe how the simulator handles forwarding, stalls, and flushes.",
    tutorialSection: "Hazards and How to Spot Them",
    questions: [
      {
        id: "hazards-raw-dependency",
        title: "Spot the Dependency",
        prompt:
          "Given the instruction pair below, what kind of hazard does the SUB instruction create?\n\nADD R1, R2, R3\nSUB R4, R1, R5",
        choices: [
          { id: "raw", text: "Read After Write (RAW) hazard" },
          { id: "war", text: "Write After Read (WAR) hazard" },
          { id: "waw", text: "Write After Write (WAW) hazard" },
          { id: "none", text: "No hazard" },
        ],
        correctChoiceId: "raw",
        explanation:
          "SUB needs the value produced by ADD in R1, introducing a RAW data hazard that the pipeline resolves with forwarding.",
        scenario: {
          id: "hazards-raw-dependency",
          title: "RAW Hazard Investigation",
          program: joinProgram(["ADD R1, R2, R3", "SUB R4, R1, R5"]),
        },
      },
      {
        id: "hazards-load-use",
        title: "Load-Use Handling",
        prompt:
          "Load the load-use scenario. How does the pipeline resolve the dependency between the LW and the following ADD?",
        choices: [
          { id: "forward-only", text: "Forwarding resolves it without stalling" },
          { id: "stall", text: "It inserts a one-cycle stall" },
          { id: "flush", text: "It flushes the ADD instruction" },
          { id: "ignore", text: "No hazard handling is required" },
        ],
        correctChoiceId: "stall",
        explanation:
          "The loaded data is not ready until MEM/WB, so the pipeline inserts a single-cycle stall before executing the dependent ADD.",
        scenario: {
          id: "hazards-load-use",
          title: "Load-Use Hazard",
          program: joinProgram(["LW R1, 0(R2)", "ADD R3, R1, R4"]),
          initialRegisters: {
            2: 0,
            4: 3,
          },
          initialMemory: {
            0: 20,
          },
        },
      },
      {
        id: "hazards-forwarding-chain",
        title: "Forwarding Chain",
        prompt:
          "Consider the sequence below. Does the pipeline stall, or do forwarding paths resolve the hazards?\n\nADD R5, R1, R2\nSUB R6, R5, R3\nAND R7, R6, R4",
        choices: [
          { id: "forward", text: "Forwarding resolves the hazards without stalling" },
          { id: "stall", text: "The pipeline must insert bubbles" },
          { id: "flush", text: "The pipeline flushes instructions" },
          { id: "none", text: "There are no dependencies" },
        ],
        correctChoiceId: "forward",
        explanation:
          "Back-to-back ALU dependencies are handled by forwarding from EX/MEM and MEM/WB, so the pipeline keeps issuing without stalling.",
        scenario: {
          id: "hazards-forwarding-chain",
          title: "Forwarding Chain",
          program: joinProgram(["ADD R5, R1, R2", "SUB R6, R5, R3", "AND R7, R6, R4"]),
        },
      },
      {
        id: "hazards-branch-mispredict",
        title: "Branch Metrics",
        prompt:
          "When a branch predicted 'not taken' is actually taken, what happens to the branch misprediction counter?",
        choices: [
          { id: "increment", text: "It increments by one" },
          { id: "decrement", text: "It decrements by one" },
          { id: "reset", text: "It resets to zero" },
          { id: "unchanged", text: "It remains unchanged" },
        ],
        correctChoiceId: "increment",
        explanation:
          "Each taken branch that contradicts the predict-not-taken policy increments the branch misprediction counter.",
        scenario: {
          id: "hazards-branch-metrics",
          title: "Branch Metrics Scenario",
          program: joinProgram([
            "BEQ R1, R2, TARGET",
            "ADD R3, R3, R3",
            "TARGET: ADD R4, R4, R4",
          ]),
          initialRegisters: {
            1: 5,
            2: 5,
            3: 3,
            4: 4,
          },
        },
      },
      {
        id: "hazards-stall-indicator",
        title: "Visualising Stalls",
        prompt:
          "When the pipeline inserts a stall due to a load-use hazard, which stage displays the STALL badge?",
        choices: [
          { id: "if", text: "Instruction Fetch (IF)" },
          { id: "id", text: "Instruction Decode (ID)" },
          { id: "ex", text: "Execute (EX)" },
          { id: "mem", text: "Memory Access (MEM)" },
        ],
        correctChoiceId: "id",
        explanation:
          "The hazard is detected during ID, so the ID stage highlights the STALL badge while the bubble flows through the pipeline.",
        scenario: {
          id: "hazards-stall-indicator",
          title: "Stall Visualisation",
          program: joinProgram(["LW R1, 0(R2)", "ADD R3, R1, R4"]),
          initialRegisters: {
            2: 0,
            4: 2,
          },
          initialMemory: {
            0: 15,
          },
        },
      },
      {
        id: "hazards-flush-effect",
        title: "Flush Outcome",
        prompt:
          "When the pipeline flushes an instruction due to a taken branch, what happens to that instruction’s effects?",
        choices: [
          { id: "discarded", text: "They are discarded; the instruction has no architectural effect" },
          { id: "partial", text: "Its register writes still occur" },
          { id: "delayed", text: "It executes later once the branch resolves" },
          { id: "duplicated", text: "It is executed twice to be safe" },
        ],
        correctChoiceId: "discarded",
        explanation:
          "Flushed instructions are bubbles—they never reach Write Back, so they have no architectural effect.",
        scenario: {
          id: "hazards-flush-effect",
          title: "Flush Demonstration",
          program: joinProgram([
            "BEQ R1, R2, TARGET",
            "ADD R3, R3, R3",
            "TARGET: ADD R4, R4, R4",
          ]),
          initialRegisters: {
            1: 8,
            2: 8,
            3: 2,
            4: 4,
          },
        },
      },
    ],
  },
  {
    id: "examples",
    title: "Module 4 · Guided Examples",
    description:
      "Apply what you have learned by analysing the guided example programs from the tutorials.",
    tutorialSection: "Guided Example Walkthroughs",
    questions: [
      {
        id: "examples-a-r4",
        title: "Example A — Result Check",
        prompt:
          "Load Example A and step through it. With the seeded values, what result is written to R4?",
        choices: [
          { id: "7", text: "7" },
          { id: "9", text: "9" },
          { id: "11", text: "11" },
          { id: "13", text: "13" },
        ],
        correctChoiceId: "9",
        explanation:
          "ADD produces R1 = 11, then SUB computes R4 = 11 − 2 = 9. You can confirm this in the Write Back stage.",
        scenario: {
          id: "example-a-values",
          title: "Example A — ALU Sequence",
          program: joinProgram(["ADD R1, R2, R3", "SUB R4, R1, R5", "AND R6, R1, R7"]),
          initialRegisters: {
            2: 5,
            3: 6,
            5: 2,
            7: 1,
          },
        },
      },
      {
        id: "examples-a-forwarding",
        title: "Example A — Forwarding Insight",
        prompt:
          "In Example A, which instructions benefit from forwarding to avoid stalls?",
        choices: [
          { id: "second", text: "Only the second instruction (SUB)" },
          { id: "second-third", text: "The second and third instructions" },
          { id: "third", text: "Only the third instruction (AND)" },
          { id: "none", text: "None — the pipeline stalls instead" },
        ],
        correctChoiceId: "second-third",
        explanation:
          "Both SUB and AND consume the result of the first instruction, so EX/MEM and MEM/WB forwarding paths supply their operands.",
        scenario: {
          id: "example-a-forwarding",
          title: "Example A — Forwarding Focus",
          program: joinProgram(["ADD R1, R2, R3", "SUB R4, R1, R5", "AND R6, R1, R7"]),
          initialRegisters: {
            2: 4,
            3: 8,
            5: 1,
            7: 3,
          },
        },
      },
      {
        id: "examples-b-stall",
        title: "Example B — Stall Count",
        prompt:
          "In Example B (load-use hazard), how many stall cycles does the pipeline insert before the ADD executes?",
        choices: [
          { id: "0", text: "0 cycles" },
          { id: "1", text: "1 cycle" },
          { id: "2", text: "2 cycles" },
          { id: "3", text: "3 cycles" },
        ],
        correctChoiceId: "1",
        explanation:
          "The dependent ADD waits exactly one cycle because the load’s data arrives in MEM/WB.",
        scenario: {
          id: "example-b-stall",
          title: "Example B — Load-Use Hazard",
          program: joinProgram(["LW R1, 0(R2)", "ADD R3, R1, R4", "OR R5, R1, R6"]),
          initialRegisters: {
            2: 0,
            4: 4,
            6: 1,
          },
          initialMemory: {
            0: 20,
          },
        },
      },
      {
        id: "examples-b-r3",
        title: "Example B — Register Outcome",
        prompt:
          "After Example B finishes, what value is written to R3 using the seeded state?",
        choices: [
          { id: "20", text: "20" },
          { id: "21", text: "21" },
          { id: "24", text: "24" },
          { id: "25", text: "25" },
        ],
        correctChoiceId: "24",
        explanation:
          "The load fetches 20, and the ADD computes R3 = 20 + 4 = 24.",
        scenario: {
          id: "example-b-r3",
          title: "Example B — Register Result",
          program: joinProgram(["LW R1, 0(R2)", "ADD R3, R1, R4", "OR R5, R1, R6"]),
          initialRegisters: {
            2: 0,
            4: 4,
            6: 1,
          },
          initialMemory: {
            0: 20,
          },
        },
      },
      {
        id: "examples-c-r3",
        title: "Example C — Flush Effect",
        prompt:
          "In Example C, after the branch is taken, what happens to the value of R3?",
        choices: [
          { id: "unchanged", text: "R3 keeps its original value (3)" },
          { id: "double", text: "R3 doubles to 6" },
          { id: "zero", text: "R3 becomes 0" },
          { id: "random", text: "R3 takes an undefined value" },
        ],
        correctChoiceId: "unchanged",
        explanation:
          "The ADD R3, R3, R3 instruction is flushed once the branch is taken, so R3 never changes.",
        scenario: {
          id: "example-c-flush",
          title: "Example C — Branch Flush",
          program: joinProgram(["BEQ R1, R2, TARGET", "ADD R3, R3, R3", "TARGET: ADD R4, R4, R4"]),
          initialRegisters: {
            1: 8,
            2: 8,
            3: 3,
            4: 4,
          },
        },
      },
      {
        id: "examples-c-r4",
        title: "Example C — Branch Target Result",
        prompt:
          "Continuing Example C, what value is written to R4 at the branch target using the seeded state?",
        choices: [
          { id: "4", text: "4" },
          { id: "6", text: "6" },
          { id: "8", text: "8" },
          { id: "12", text: "12" },
        ],
        correctChoiceId: "8",
        explanation:
          "After the branch, the ADD at the target doubles R4 from 4 to 8.",
        scenario: {
          id: "example-c-r4",
          title: "Example C — Branch Target",
          program: joinProgram(["BEQ R1, R2, TARGET", "ADD R3, R3, R3", "TARGET: ADD R4, R4, R4"]),
          initialRegisters: {
            1: 8,
            2: 8,
            3: 3,
            4: 4,
          },
        },
      },
    ],
  },
];
