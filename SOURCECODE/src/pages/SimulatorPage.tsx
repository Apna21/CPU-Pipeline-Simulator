import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PipelineStage } from "@/components/PipelineStage";
import { PipelineFlow } from "@/components/PipelineFlow";
import { ControlPanel } from "@/components/ControlPanel";
import { InstructionEditor } from "@/components/InstructionEditor";
import { RegisterMemoryView } from "@/components/RegisterMemoryView";
import { MetricsPanel } from "@/components/MetricsPanel";
import { HelpDialog } from "@/components/HelpDialog";
import { AboutDialog } from "@/components/AboutDialog";
import { InitialStatePanel } from "@/components/InitialStatePanel";
import { useToast } from "@/hooks/use-toast";
import { useSimulationController } from "@/hooks/useSimulationController";
import { speedLabel } from "@/utils/simulation";
import { DEFAULT_PROGRAM_SOURCE } from "@/simulation/sampleProgram";
import { QuizScenario } from "@/quiz/types";
import { PipelineSnapshot, PipelineStageName } from "@/simulation/types";
import { Activity, Layers, Play, RefreshCcw, Sparkles } from "lucide-react";

type StageBadge = {
  label: string;
  variant?: "neutral" | "hazard" | "info" | "success";
};

const STAGE_METADATA: Array<{
  key: PipelineStageName;
  name: string;
  label: string;
  color: string;
  description: string;
}> = [
  {
    key: "IF",
    name: "Instruction Fetch",
    label: "IF",
    color: "fetch",
    description: "Fetches the next instruction from memory using the program counter",
  },
  {
    key: "ID",
    name: "Instruction Decode",
    label: "ID",
    color: "decode",
    description: "Decodes the instruction and reads register operands",
  },
  {
    key: "EX",
    name: "Execute",
    label: "EX",
    color: "execute",
    description: "Performs arithmetic/logical operations or calculates memory addresses",
  },
  {
    key: "MEM",
    name: "Memory Access",
    label: "MEM",
    color: "memory",
    description: "Accesses data memory for load and store instructions",
  },
  {
    key: "WB",
    name: "Write Back",
    label: "WB",
    color: "writeback",
    description: "Writes the result back to the register file",
  },
];

function formatWord(value: number) {
  return `0x${(value >>> 0).toString(16).padStart(8, "0").toUpperCase()}`;
}

function formatAddress(index: number) {
  return `0x${(index * 4).toString(16).padStart(4, "0").toUpperCase()}`;
}

const DEFAULT_REGISTERS = Array.from({ length: 32 }, (_, index) => ({
  name: `R${index}`,
  value: "0x00000000",
  decimal: 0,
  isHighlighted: false,
}));

const MEMORY_WINDOW_RADIUS = 3;
const MEMORY_WINDOW_SIZE = MEMORY_WINDOW_RADIUS * 2 + 1;

type MemoryWindowCell = {
  address: string;
  value: string;
  decimal: number;
  isHighlighted: boolean;
  isRecent: boolean;
  accessType?: "LOAD" | "STORE";
};

type MemoryWindowData = {
  rangeLabel: string;
  cells: MemoryWindowCell[];
};

const DEFAULT_MEMORY_WINDOW: MemoryWindowData = {
  rangeLabel: `Addresses ${formatAddress(0)} - ${formatAddress(MEMORY_WINDOW_SIZE - 1)}`,
  cells: Array.from({ length: MEMORY_WINDOW_SIZE }, (_, index) => ({
    address: formatAddress(index),
    value: "0x00000000",
    decimal: 0,
    isHighlighted: false,
    isRecent: false,
    accessType: undefined,
  })),
};

const getInstructionBadge = (instruction?: string | null): StageBadge | null => {
  if (!instruction) return null;
  const opcode = instruction.split(/\s+/)[0]?.toUpperCase();
  if (!opcode) return null;
  if (["ADD", "SUB", "AND", "OR"].includes(opcode)) {
    return { label: "ALU", variant: "info" };
  }
  if (["LW", "SW"].includes(opcode)) {
    return { label: "MEM", variant: "info" };
  }
  if (opcode === "BEQ") {
    return { label: "BRANCH", variant: "info" };
  }
  return null;
};

const SimulatorPage = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    snapshot,
    isPlaying,
    isHalted,
    speed,
    setSpeed,
    togglePlay,
    pause,
    step,
    stepBack,
    canStepBack,
    reset,
    loadProgramFromSource,
    initialRegisters: initialRegisterState,
    initialMemory: initialMemoryState,
    setInitialRegisterValue,
    setInitialMemoryValue,
    resetInitialRegisters,
    resetInitialMemory,
    randomizeInitialRegisters,
    randomizeInitialMemory,
    applyInitialRegisterPatch,
    applyInitialMemoryPatch,
    applyInitialStateAndReset,
    applyCurrentInitialState,
  } = useSimulationController();

  const [code, setCode] = useState(DEFAULT_PROGRAM_SOURCE.trim());
  const [helpOpen, setHelpOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [initialStateCollapsed, setInitialStateCollapsed] = useState(true);
  const latestSnapshotRef = useRef<PipelineSnapshot | null>(snapshot ?? null);

  useEffect(() => {
    latestSnapshotRef.current = snapshot ?? null;
  }, [snapshot]);

  useEffect(() => {
    const state = location.state as { scenario?: QuizScenario } | undefined;
    const scenario = state?.scenario;
    if (!scenario) {
      return;
    }

    navigate(location.pathname, { replace: true });

    pause();

    let needsReset = false;

    if (scenario.initialRegisters) {
      applyInitialRegisterPatch(scenario.initialRegisters);
      needsReset = true;
    }
    if (scenario.initialMemory) {
      applyInitialMemoryPatch(scenario.initialMemory);
      needsReset = true;
    }

    if (scenario.program) {
      const trimmedProgram = scenario.program.trim();
      setCode(trimmedProgram);
      const result = loadProgramFromSource(trimmedProgram);
      if (result.errors.length > 0) {
        const description = result.errors
          .slice(0, 3)
          .map((err) => `Line ${err.line}: ${err.message}`)
          .join("\n");
        toast({
          title: "Failed to load quiz scenario",
          description,
          variant: "destructive",
        });
        return;
      }
      needsReset = true;
    }

    applyInitialStateAndReset();
    setTimeout(() => {
      applyCurrentInitialState();
    }, 0);
    toast({
      title: "Quiz Scenario Loaded",
      description: scenario.description
        ? scenario.description
        : `Loaded "${scenario.title}" into the simulator. Step through to investigate the answer.`,
    });
  }, [
    applyInitialMemoryPatch,
    applyInitialRegisterPatch,
    applyCurrentInitialState,
    applyInitialStateAndReset,
    loadProgramFromSource,
    location.pathname,
    location.state,
    navigate,
    pause,
    setCode,
    toast,
  ]);

  const handlePlayPause = useCallback(() => {
    if (!snapshot) {
      return;
    }

    if (isPlaying) {
      togglePlay();
      toast({
        title: "Simulation Paused",
        description: `Paused at cycle ${snapshot.stats.cycleCount}.`,
      });
      return;
    }

    if (snapshot.halted) {
      toast({
        title: "Program already halted",
        description: "Reset or load a new program to run the simulation again.",
      });
      return;
    }

    togglePlay();
    toast({
      title: "Simulation Started",
      description: `Running at ${speedLabel(speed)} speed.`,
    });
  }, [isPlaying, snapshot, speed, togglePlay, toast]);

  const handleStep = useCallback(() => {
    const currentSnapshot = latestSnapshotRef.current;
    if (!currentSnapshot || currentSnapshot.halted) {
      toast({
        title: "No more instructions",
        description: "Reset or load a new program to continue.",
      });
      return;
    }

    pause();
    const previousCycle = currentSnapshot.stats.cycleCount;
    step();

    setTimeout(() => {
      const updated = latestSnapshotRef.current;
      if (!updated) return;
      if (updated.halted) {
        toast({
          title: "Program completed",
          description: `Pipeline drained after ${updated.stats.cycleCount} cycles.`,
        });
      } else if (updated.stats.cycleCount !== previousCycle) {
        toast({
          title: "Step Executed",
          description: `Advanced to cycle ${updated.stats.cycleCount}.`,
        });
      }
    }, 0);
  }, [pause, step, toast]);

  const handleBack = useCallback(() => {
    if (!canStepBack) {
      toast({
        title: "Nothing to rewind",
        description: "Execute at least one step before going back.",
      });
      return;
    }
    pause();
    stepBack();
    setTimeout(() => {
      const updated = latestSnapshotRef.current;
      if (!updated) return;
      toast({
        title: "Rewound",
        description: `Returned to cycle ${updated.stats.cycleCount}.`,
      });
    }, 0);
  }, [canStepBack, pause, stepBack, toast]);

  const handleReset = useCallback(() => {
    pause();
    reset();
    setTimeout(() => {
      const updated = latestSnapshotRef.current;
      toast({
        title: "Simulator Reset",
        description: updated
          ? `Back to cycle ${updated.stats.cycleCount}.`
          : "Pipeline and CPU state cleared.",
      });
    }, 0);
  }, [pause, reset, toast]);

  const handleLoadProgram = useCallback(() => {
    pause();
    const result = loadProgramFromSource(code);
    if (result.errors.length > 0) {
      const errorMessages = result.errors
        .slice(0, 3)
        .map((err) => `Line ${err.line}: ${err.message}`)
        .join("\n");
      toast({
        title: "Program Load Failed",
        description: errorMessages,
        variant: "destructive",
      });
      return;
    }

    applyInitialStateAndReset();
    setTimeout(() => {
      applyCurrentInitialState();
    }, 0);

    toast({
      title: "Program Loaded",
      description: `Loaded ${result.instructions.length} instructions.`,
    });
  }, [applyInitialStateAndReset, code, loadProgramFromSource, pause, toast]);

  const handleResetInitialRegisters = useCallback(() => {
    resetInitialRegisters();
  }, [resetInitialRegisters]);

  const handleResetInitialMemory = useCallback(() => {
    resetInitialMemory();
  }, [resetInitialMemory]);

  const handleRandomizeInitialRegisters = useCallback(() => {
    randomizeInitialRegisters();
    toast({
      title: "Initial registers randomised",
      description: "Press Apply & Reset Simulation to use them.",
    });
  }, [randomizeInitialRegisters, toast]);

  const handleRandomizeInitialMemory = useCallback(() => {
    randomizeInitialMemory();
    toast({
      title: "Initial memory randomised",
      description: "Press Apply & Reset Simulation to use it.",
    });
  }, [randomizeInitialMemory, toast]);

  const handleApplyInitialState = useCallback(() => {
    pause();
    applyInitialStateAndReset();
    setTimeout(() => {
      const updated = latestSnapshotRef.current;
      toast({
        title: "Initial state applied",
        description: updated
          ? `Simulator reset to cycle ${updated.stats.cycleCount} with new initial values.`
          : "Simulator reset with updated initial state.",
      });
    }, 0);
  }, [applyInitialStateAndReset, pause, toast]);

  const handleToggleInitialState = useCallback(() => {
    setInitialStateCollapsed((prev) => !prev);
  }, []);

  const handleSpeedChange = useCallback(
    (value: number[]) => {
      const nextSpeed = value[0] ?? 0;
      setSpeed(nextSpeed);
    },
    [setSpeed]
  );

  const stageViews = snapshot?.stages ?? null;
  const stats = snapshot?.stats;
  const cycleCount = stats?.cycleCount ?? 0;
  const cpi = stats?.cpi ?? 0;

  const registers = useMemo(() => {
    if (!snapshot) {
      return DEFAULT_REGISTERS;
    }
    const lastWrite = snapshot.lastRegisterWrite;
    const currentCycle = snapshot.stats.cycleCount;
    return snapshot.registers.map((value, index) => {
      const isRecentUpdate =
        lastWrite?.cycle === currentCycle && lastWrite.registerIndex === index;
      return {
        name: `R${index}`,
        value: formatWord(value),
        decimal: value,
        isHighlighted: isRecentUpdate,
      };
    });
  }, [snapshot]);
  const memoryWindow = useMemo<MemoryWindowData>(() => {
    if (!snapshot) {
      return DEFAULT_MEMORY_WINDOW;
    }
    const { memory, lastMemoryAccess, stats } = snapshot;
    if (memory.length === 0) {
      return DEFAULT_MEMORY_WINDOW;
    }

    const hasAccess = Boolean(lastMemoryAccess);
    const targetIndex = lastMemoryAccess
      ? Math.min(Math.max(lastMemoryAccess.wordAddress, 0), memory.length - 1)
      : 0;

    const rawStart = targetIndex - MEMORY_WINDOW_RADIUS;
    const startIndex = Math.max(0, Math.min(rawStart, Math.max(0, memory.length - MEMORY_WINDOW_SIZE)));
    const endIndex = Math.min(memory.length, startIndex + MEMORY_WINDOW_SIZE);

    const cells = Array.from({ length: endIndex - startIndex }, (_, offset) => {
      const index = startIndex + offset;
      const value = memory[index];
      const isTarget = hasAccess && index === targetIndex;
      const isRecent = isTarget && lastMemoryAccess?.cycle === stats.cycleCount;
      const address = formatAddress(index);
      return {
        address,
        value: formatWord(value),
        decimal: value,
        isHighlighted: isTarget,
        isRecent,
        accessType: isTarget && lastMemoryAccess ? lastMemoryAccess.type : undefined,
      };
    });

    const rangeLabel =
      cells.length > 0
        ? `Addresses ${formatAddress(startIndex)} - ${formatAddress(startIndex + cells.length - 1)}`
        : "No memory data";

    return {
      rangeLabel,
      cells,
    };
  }, [snapshot]);

  const stageBadges = useMemo(() => {
    const badges: Record<PipelineStageName, StageBadge[]> = {
      IF: [],
      ID: [],
      EX: [],
      MEM: [],
      WB: [],
    };

    STAGE_METADATA.forEach(({ key }) => {
      const stageView = stageViews?.[key];
      const instructionBadge = getInstructionBadge(stageView?.instruction);
      if (instructionBadge) {
        badges[key].push(instructionBadge);
      }
    });

    if (snapshot?.stalledThisCycle) {
      badges.ID.push({ label: "STALL", variant: "hazard" });
    }
    if (snapshot?.flushedThisCycle) {
      badges.IF.push({ label: "FLUSH", variant: "hazard" });
    }
    if (snapshot?.forwarding?.aFrom) {
      badges.EX.push({ label: `A←${snapshot.forwarding.aFrom}`, variant: "success" });
    }
    if (snapshot?.forwarding?.bFrom) {
      badges.EX.push({ label: `B←${snapshot.forwarding.bFrom}`, variant: "success" });
    }

    STAGE_METADATA.forEach(({ key }) => {
      const hazardType = stageViews?.[key]?.hazard?.type;
      if (hazardType === "stall") {
        badges[key].push({ label: "STALL", variant: "hazard" });
      }
      if (hazardType === "forward") {
        badges[key].push({ label: "FWD", variant: "success" });
      }
    });

    return badges;
  }, [snapshot, stageViews]);
  const lastRegisterWrite = snapshot?.lastRegisterWrite ?? null;
  const lastMemoryAccess = snapshot?.lastMemoryAccess ?? null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.05),_transparent_45%)]" />
          <div className="relative container mx-auto px-4 py-8 md:py-12">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-5">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold text-primary uppercase tracking-[0.28em]">
                  Simulator · Visualise · Iterate
                </span>
                <div className="space-y-3">
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                    Inspect the pipeline one cycle at a time and{" "}
                    <span className="text-primary">see hazards unfold</span>.
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                    Step, play, rewind, and preconfigure register/memory state for any scenario. Hazard
                    badges, performance metrics, and the register/memory panels keep everything in view for
                    your lecture, demo, or lab.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 rounded-md border border-border/70 bg-background/70 px-3 py-2">
                    <Layers className="w-4 h-4 text-primary" />
                    <span>5 stages with badges &amp; flow</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-md border border-border/70 bg-background/70 px-3 py-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <span>Hazards highlighted per cycle</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-md border border-border/70 bg-background/70 px-3 py-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Quiz scenarios load instantly</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" size="sm" className="sm:w-auto" onClick={() => setHelpOpen(true)}>
                    View Quick Help
                  </Button>
                  <Button variant="outline" size="sm" className="sm:w-auto" onClick={() => setAboutOpen(true)}>
                    About This Tool
                  </Button>
                </div>
              </div>
              <Card className="relative overflow-hidden border border-border/70 bg-muted/20 shadow-lg">
                <div className="absolute -top-24 -right-24 h-36 w-36 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
                <div className="relative p-6 space-y-4">
                  <div className="flex items-center gap-3 text-primary">
                    <Play className="w-5 h-5" />
                    <span className="font-semibold uppercase tracking-wide text-xs">
                      Core workflow
                    </span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-3">
                    <li className="rounded-md border border-border/50 bg-background/80 px-4 py-3">
                      1. Paste or load an instruction sequence (quiz modules can preload scenarios).
                    </li>
                    <li className="rounded-md border border-border/50 bg-background/80 px-4 py-3">
                      2. Configure the initial register/memory state if needed, then apply &amp; reset.
                    </li>
                    <li className="rounded-md border border-border/50 bg-background/80 px-4 py-3">
                      3. Step or play to watch hazards, metrics, and register updates in real time.
                    </li>
                  </ul>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Link
                      to="/learn"
                      className="underline underline-offset-4 hover:text-primary transition"
                    >
                      Review tutorials
                    </Link>
                    <span>·</span>
                    <Link
                      to="/quiz"
                      className="underline underline-offset-4 hover:text-primary transition"
                    >
                      Try quiz mode scenarios
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-10 space-y-6">
          <section className="bg-card/90 rounded-xl shadow-lg border border-border/60 p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Pipeline Stages
              </h3>
              <Button variant="outline" size="sm" onClick={handleReset} className="flex items-center gap-2">
                <RefreshCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-4">
              {STAGE_METADATA.map((stage, idx) => {
                const stageView = stageViews ? stageViews[stage.key] : undefined;
                return (
                  <div key={stage.label} className="flex items-center flex-shrink-0">
                    <PipelineStage
                      name={stage.name}
                      label={stage.label}
                      color={stage.color}
                      description={stage.description}
                      instruction={stageView?.instruction ?? null}
                      hasHazard={Boolean(stageView?.hazard)}
                      hazardType={stageView?.hazard?.type}
                      badges={stageBadges[stage.key]}
                    />
                    {idx < STAGE_METADATA.length - 1 && <PipelineFlow />}
                  </div>
                );
              })}
            </div>
          </section>

          <ControlPanel
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onStep={handleStep}
            onBack={handleBack}
            onReset={handleReset}
            speed={speed}
            onSpeedChange={handleSpeedChange}
            clockCycles={cycleCount}
            cpi={cpi}
            isHalted={isHalted}
            canStepBack={canStepBack}
          />

          <InitialStatePanel
            registers={initialRegisterState}
            memory={initialMemoryState}
            onRegisterChange={setInitialRegisterValue}
            onMemoryChange={setInitialMemoryValue}
            onResetRegisters={handleResetInitialRegisters}
            onRandomizeRegisters={handleRandomizeInitialRegisters}
            onResetMemory={handleResetInitialMemory}
            onRandomizeMemory={handleRandomizeInitialMemory}
            onApply={handleApplyInitialState}
            isApplyDisabled={isPlaying}
            collapsed={initialStateCollapsed}
            onToggleCollapsed={handleToggleInitialState}
          />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1">
              <InstructionEditor
                code={code}
                onCodeChange={setCode}
                onLoadProgram={handleLoadProgram}
              />
            </div>
            <div className="xl:col-span-1 space-y-4">
              <RegisterMemoryView
                registers={registers}
                memoryWindow={memoryWindow}
                lastRegisterWrite={lastRegisterWrite}
                lastMemoryAccess={lastMemoryAccess}
                currentCycle={cycleCount}
              />
            </div>
            <div className="xl:col-span-1">
              <MetricsPanel
                cycleCount={cycleCount}
                instructionsCompleted={stats?.instructionsCompleted ?? 0}
                cpi={cpi}
                stallCount={stats?.stallCount ?? 0}
                forwardCount={stats?.forwardCount ?? 0}
                branchCount={stats?.branchCount ?? 0}
                branchMispredictions={stats?.branchMispredictions ?? 0}
                branchAccuracy={stats?.branchAccuracy ?? 100}
              />
            </div>
          </div>
        </div>
      </main>

      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
    </div>
  );
};

export default SimulatorPage;


