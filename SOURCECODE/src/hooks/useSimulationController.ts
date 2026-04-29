import { useCallback, useEffect, useRef, useState } from "react";
import { PipelineEngine } from "@/simulation/pipelineEngine";
import {
  EngineState,
  PipelineSnapshot,
  NUM_REGISTERS,
} from "@/simulation/types";
import { DEFAULT_PROGRAM_SOURCE } from "@/simulation/sampleProgram";
import { ParseResult } from "@/simulation/programParser";
import { speedToDelay } from "@/utils/simulation";

type HistoryEntry = {
  snapshot: PipelineSnapshot;
  state: EngineState;
};

const DEFAULT_SPEED = 50;
const INITIAL_MEMORY_WORDS = 64;

const createDefaultRegisterState = () => {
  const registers = new Array(NUM_REGISTERS).fill(0);
  if (registers.length > 2) {
    registers[2] = 100;
  }
  if (registers.length > 3) {
    registers[3] = 5;
  }
  if (registers.length > 4) {
    registers[4] = 2;
  }
  if (registers.length > 5) {
    registers[5] = 3;
  }
  if (registers.length > 6) {
    registers[6] = 1;
  }
  if (registers.length > 7) {
    registers[7] = 9;
  }
  return registers;
};

const createDefaultMemoryState = () => {
  const memory = new Array(INITIAL_MEMORY_WORDS).fill(0);
  memory[0] = 7;
  if (memory.length > 1) {
    memory[1] = 12;
  }
  const idx25 = 100 >>> 2;
  const idx26 = 104 >>> 2;
  if (idx25 < memory.length) {
    memory[idx25] = 7;
  }
  if (idx26 < memory.length) {
    memory[idx26] = 12;
  }
  return memory;
};

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const useSimulationController = () => {
  const engineRef = useRef<PipelineEngine | null>(null);
  const snapshotRef = useRef<PipelineSnapshot | null>(null);
  const historyRef = useRef<HistoryEntry[]>([]);
  const playTimerRef = useRef<number | null>(null);
  const initialisedRef = useRef(false);
  const initialRegistersRef = useRef<number[]>(createDefaultRegisterState());
  const initialMemoryRef = useRef<number[]>(createDefaultMemoryState());

  if (engineRef.current === null) {
    engineRef.current = new PipelineEngine();
  }

  const [snapshot, setSnapshot] = useState<PipelineSnapshot | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [historyDepth, setHistoryDepth] = useState(0);
  const [initialRegisters, setInitialRegisters] = useState<number[]>(() => [...initialRegistersRef.current]);
  const [initialMemory, setInitialMemory] = useState<number[]>(() => [...initialMemoryRef.current]);

  const applyInitialStateToEngine = useCallback((engine: PipelineEngine) => {
    const state = engine.exportState();

    const registers = new Int32Array(state.cpu.registers);
    const desiredRegisters = initialRegistersRef.current;
    const registerCount = Math.min(registers.length, desiredRegisters.length);
    for (let i = 0; i < registerCount; i += 1) {
      registers[i] = i === 0 ? 0 : desiredRegisters[i] | 0;
    }
    if (registers.length > 0) {
      registers[0] = 0;
    }
    state.cpu.registers = registers;

    const memory = new Int32Array(state.cpu.memory);
    const desiredMemory = initialMemoryRef.current;
    const memoryCount = Math.min(memory.length, desiredMemory.length);
    for (let i = 0; i < memoryCount; i += 1) {
      memory[i] = desiredMemory[i] | 0;
    }
    state.cpu.memory = memory;

    engine.restoreState(state);
    return engine.getSnapshot();
  }, []);

  const setInitialRegisterValue = useCallback((index: number, value: number) => {
    if (index === 0) {
      return;
    }
    setInitialRegisters((prev) => {
      if (index < 0 || index >= prev.length) {
        return prev;
      }
      const next = [...prev];
      next[index] = value | 0;
      initialRegistersRef.current = next;
      return next;
    });
  }, []);

  const setInitialMemoryValue = useCallback((index: number, value: number) => {
    setInitialMemory((prev) => {
      if (index < 0 || index >= prev.length) {
        return prev;
      }
      const next = [...prev];
      next[index] = value | 0;
      initialMemoryRef.current = next;
      return next;
    });
  }, []);

  const resetInitialRegisters = useCallback(() => {
    const defaults = createDefaultRegisterState();
    initialRegistersRef.current = defaults;
    setInitialRegisters([...defaults]);
  }, []);

  const resetInitialMemory = useCallback(() => {
    const defaults = createDefaultMemoryState();
    initialMemoryRef.current = defaults;
    setInitialMemory([...defaults]);
  }, []);

  const randomizeInitialRegisters = useCallback(() => {
    setInitialRegisters((prev) => {
      const next = prev.map((_, index) => (index === 0 ? 0 : randomInt(0, 20)));
      initialRegistersRef.current = next;
      return next;
    });
  }, []);

  const randomizeInitialMemory = useCallback(() => {
    setInitialMemory((prev) => {
      const next = prev.map(() => randomInt(0, 50));
      initialMemoryRef.current = next;
      return next;
    });
  }, []);

  const resetInitialStateToDefaults = useCallback(() => {
    resetInitialRegisters();
    resetInitialMemory();
  }, [resetInitialMemory, resetInitialRegisters]);

  const applyInitialRegisterPatch = useCallback((patch: Record<number, number>) => {
    if (!patch) {
      return;
    }
    setInitialRegisters((prev) => {
      const next = [...prev];
      Object.entries(patch).forEach(([key, rawValue]) => {
        const index = Number(key);
        if (!Number.isFinite(index) || index < 0 || index >= next.length) {
          return;
        }
        if (index === 0) {
          next[index] = 0;
          return;
        }
        next[index] = rawValue | 0;
      });
      initialRegistersRef.current = next;
      return next;
    });
  }, []);

  const applyInitialMemoryPatch = useCallback((patch: Record<number, number>) => {
    if (!patch) {
      return;
    }
    setInitialMemory((prev) => {
      const next = [...prev];
      Object.entries(patch).forEach(([key, rawValue]) => {
        const index = Number(key);
        if (!Number.isFinite(index) || index < 0 || index >= next.length) {
          return;
        }
        next[index] = rawValue | 0;
      });
      initialMemoryRef.current = next;
      return next;
    });
  }, []);

  const clearTimer = useCallback(() => {
    if (playTimerRef.current !== null) {
      window.clearInterval(playTimerRef.current);
      playTimerRef.current = null;
    }
  }, []);

  const updateSnapshot = useCallback((next: PipelineSnapshot) => {
    snapshotRef.current = next;
    setSnapshot(next);
  }, []);

  const applyCurrentInitialState = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return null;
    const snapshot = applyInitialStateToEngine(engine);
    updateSnapshot(snapshot);
    return snapshot;
  }, [applyInitialStateToEngine, updateSnapshot]);

  const pushHistory = useCallback(() => {
    const engine = engineRef.current;
    const currentSnapshot = snapshotRef.current;
    if (!engine || !currentSnapshot) return;
    const entry: HistoryEntry = {
      snapshot: currentSnapshot,
      state: engine.exportState(),
    };
    historyRef.current.push(entry);
    setHistoryDepth(historyRef.current.length);
  }, []);

  const popHistory = useCallback((): HistoryEntry | undefined => {
    const entry = historyRef.current.pop();
    if (entry) {
      setHistoryDepth(historyRef.current.length);
    }
    return entry;
  }, []);

  const step = useCallback(() => {
    const engine = engineRef.current;
    const currentSnapshot = snapshotRef.current;
    if (!engine || !currentSnapshot || currentSnapshot.halted) {
      return;
    }

    pushHistory();

    const nextSnapshot = engine.step();
    updateSnapshot(nextSnapshot);

    if (nextSnapshot.halted) {
      setIsPlaying(false);
      clearTimer();
    }
  }, [clearTimer, pushHistory, updateSnapshot]);

  const stepBack = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const entry = popHistory();
    if (!entry) return;

    clearTimer();
    setIsPlaying(false);

    engine.restoreState(entry.state);
    updateSnapshot(entry.snapshot);
  }, [clearTimer, popHistory, updateSnapshot]);

  const resetExecution = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return null;

    clearTimer();
    setIsPlaying(false);
    historyRef.current = [];
    setHistoryDepth(0);

    engine.reset();
    const freshSnapshot = applyInitialStateToEngine(engine);
    updateSnapshot(freshSnapshot);
    return freshSnapshot;
  }, [applyInitialStateToEngine, clearTimer, updateSnapshot]);

  const loadProgramFromSource = useCallback(
    (source: string): ParseResult => {
      const engine = engineRef.current;
      if (!engine) {
        return { instructions: [], errors: [{ line: 0, message: "Engine unavailable" }] };
      }

      clearTimer();
      setIsPlaying(false);
      historyRef.current = [];
      setHistoryDepth(0);

      const result = engine.loadProgramFromSource(source);
      if (result.errors.length === 0) {
        const freshSnapshot = applyInitialStateToEngine(engine);
        updateSnapshot(freshSnapshot);
      }
      return result;
    },
    [applyInitialStateToEngine, clearTimer, updateSnapshot]
  );

  const togglePlay = useCallback(() => {
    const currentSnapshot = snapshotRef.current;
    if (currentSnapshot?.halted) {
      setIsPlaying(false);
      return;
    }
    setIsPlaying((prev) => {
      if (prev) {
        clearTimer();
        return false;
      }
      return true;
    });
  }, [clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
  }, [clearTimer]);

  // Initial load
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    if (!initialisedRef.current) {
      try {
        const { instructions, errors } = engine.loadProgramFromSource(DEFAULT_PROGRAM_SOURCE);
        if (errors.length > 0 || instructions.length === 0) {
          const emptySnapshot = engine.getSnapshot();
          updateSnapshot(emptySnapshot);
        } else {
          const seededSnapshot = applyInitialStateToEngine(engine);
          updateSnapshot(seededSnapshot);
        }
      } catch (error) {
        const emptySnapshot = engine.getSnapshot();
        updateSnapshot(emptySnapshot);
        console.error("Failed to load default program:", error);
      }
      initialisedRef.current = true;
    }

    return () => {
      clearTimer();
    };
  }, [applyInitialStateToEngine, clearTimer, updateSnapshot]);

  // Sync snapshot ref whenever snapshot state changes
  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  // Manage autoplay interval
  useEffect(() => {
    if (!isPlaying) {
      clearTimer();
      return;
    }
    const delay = speedToDelay(speed);
    clearTimer();
    playTimerRef.current = window.setInterval(() => {
      step();
    }, delay);
    return () => {
      clearTimer();
    };
  }, [clearTimer, isPlaying, speed, step]);

  const isHalted = snapshot?.halted ?? false;
  const canStepBack = historyDepth > 0;

  return {
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
    reset: resetExecution,
    loadProgramFromSource,
    historyDepth,
    initialRegisters,
    initialMemory,
    setInitialRegisterValue,
    setInitialMemoryValue,
    resetInitialRegisters,
    resetInitialMemory,
    randomizeInitialRegisters,
    randomizeInitialMemory,
    resetInitialStateToDefaults,
    applyInitialRegisterPatch,
    applyInitialMemoryPatch,
    applyCurrentInitialState,
    applyInitialStateAndReset: resetExecution,
  };
};
