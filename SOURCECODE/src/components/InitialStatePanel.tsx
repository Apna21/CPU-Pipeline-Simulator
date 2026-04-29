import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronRight } from "lucide-react";

interface InitialStatePanelProps {
  registers: number[];
  memory: number[];
  onRegisterChange: (index: number, value: number) => void;
  onMemoryChange: (index: number, value: number) => void;
  onResetRegisters: () => void;
  onRandomizeRegisters: () => void;
  onResetMemory: () => void;
  onRandomizeMemory: () => void;
  onApply: () => void;
  isApplyDisabled?: boolean;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

const formatRegisterLabel = (index: number) => `R${index}`;
const formatAddressLabel = (wordIndex: number) =>
  `0x${(wordIndex * 4).toString(16).padStart(4, "0").toUpperCase()}`;

const clampNumber = (value: string, fallback = 0) => {
  if (value === "") return fallback;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return parsed | 0;
};

const MEMORY_PAGE_SIZE = 16;

export const InitialStatePanel = ({
  registers,
  memory,
  onRegisterChange,
  onMemoryChange,
  onResetRegisters,
  onRandomizeRegisters,
  onResetMemory,
  onRandomizeMemory,
  onApply,
  isApplyDisabled = false,
  collapsed = false,
  onToggleCollapsed,
}: InitialStatePanelProps) => {
  const [memoryPage, setMemoryPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(memory.length / MEMORY_PAGE_SIZE));
  const memoryRange = useMemo(() => {
    const start = memoryPage * MEMORY_PAGE_SIZE;
    const end = Math.min(memory.length, start + MEMORY_PAGE_SIZE);
    return { start, end };
  }, [memory.length, memoryPage]);

  const registerInputs = useMemo(
    () =>
      registers.map((value, index) => ({
        index,
        label: formatRegisterLabel(index),
        value,
        isReadOnly: index === 0,
      })),
    [registers]
  );

  const memoryInputs = useMemo(() => {
    const inputs = [];
    for (let i = memoryRange.start; i < memoryRange.end; i += 1) {
      inputs.push({
        index: i,
        label: formatAddressLabel(i),
        value: memory[i] ?? 0,
      });
    }
    return inputs;
  }, [memory, memoryRange.end, memoryRange.start]);

  return (
    <Card className="shadow-lg">
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-1 h-8 w-8"
              onClick={onToggleCollapsed}
              disabled={!onToggleCollapsed}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-card-foreground">Initial State</h3>
              <p className="text-sm text-muted-foreground">
                Configure register and memory values before running the simulator. Apply changes to
                reset the CPU with your chosen state.
              </p>
            </div>
          </div>
          <Button onClick={onApply} disabled={isApplyDisabled} variant="default">
            Apply &amp; Reset Simulation
          </Button>
        </div>

        {!collapsed && (
          <>
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-medium text-card-foreground">Registers</h4>
                  <p className="text-xs text-muted-foreground">
                    R0 remains zero. Edit other registers to seed hazard and forwarding scenarios.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onResetRegisters}>
                    Reset Registers
                  </Button>
                  <Button variant="outline" size="sm" onClick={onRandomizeRegisters}>
                    Randomise Registers
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {registerInputs.map(({ index, label, value, isReadOnly }) => (
                  <div key={label} className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {label}
                    </span>
                    <Input
                      type="number"
                      inputMode="numeric"
                      className="font-mono"
                      value={value}
                      disabled={isReadOnly}
                      onChange={(event) => {
                        const next = clampNumber(event.target.value, value);
                        onRegisterChange(index, next);
                      }}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h4 className="text-base font-medium text-card-foreground">Memory</h4>
                  <p className="text-xs text-muted-foreground">
                    Configure a working window of data memory (word-addressed). Each entry represents 4
                    bytes.
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Window
                    </span>
                    <Select
                      value={memoryPage.toString()}
                      onValueChange={(value) => setMemoryPage(Number(value))}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: totalPages }).map((_, page) => {
                          const startAddress = formatAddressLabel(page * MEMORY_PAGE_SIZE);
                          const endAddress = formatAddressLabel(
                            Math.min(memory.length, (page + 1) * MEMORY_PAGE_SIZE) - 1
                          );
                          return (
                            <SelectItem key={page} value={page.toString()}>
                              {startAddress} – {endAddress}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onResetMemory}>
                      Reset Memory
                    </Button>
                    <Button variant="outline" size="sm" onClick={onRandomizeMemory}>
                      Randomise Memory
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3">
                {memoryInputs.map(({ index, label, value }) => (
                  <div key={label} className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {label}
                    </span>
                    <Input
                      type="number"
                      inputMode="numeric"
                      className="font-mono"
                      value={value}
                      onChange={(event) => {
                        const next = clampNumber(event.target.value, value);
                        onMemoryChange(index, next);
                      }}
                    />
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </Card>
  );
};
