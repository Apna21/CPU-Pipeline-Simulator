import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MemoryAccessEvent, RegisterWriteEvent } from "@/simulation/types";

interface RegisterRow {
  name: string;
  value: string;
  decimal?: number;
  isHighlighted?: boolean;
}

interface MemoryWindowCell {
  address: string;
  value: string;
  decimal?: number;
  isHighlighted?: boolean;
  isRecent?: boolean;
  accessType?: "LOAD" | "STORE";
}

interface MemoryWindow {
  rangeLabel: string;
  cells: MemoryWindowCell[];
}

interface RegisterMemoryViewProps {
  registers: RegisterRow[];
  memoryWindow: MemoryWindow;
  lastRegisterWrite: RegisterWriteEvent | null;
  lastMemoryAccess: MemoryAccessEvent | null;
  currentCycle: number;
}

const formatHexWord = (value: number) => `0x${(value >>> 0).toString(16).padStart(8, "0").toUpperCase()}`;

const formatSignedDecimal = (value: number) => value.toString();

const formatByteAddress = (address: number) => `0x${(address >>> 0).toString(16).padStart(4, "0").toUpperCase()}`;

const memoryBadgeTone = (type: "LOAD" | "STORE") =>
  type === "STORE"
    ? "bg-amber-500/20 text-amber-500 border border-amber-500/40"
    : "bg-sky-500/20 text-sky-500 border border-sky-500/40";

export const RegisterMemoryView = ({
  registers,
  memoryWindow,
  lastRegisterWrite,
  lastMemoryAccess,
  currentCycle,
}: RegisterMemoryViewProps) => {
  const registerEvent = lastRegisterWrite;
  const memoryEvent = lastMemoryAccess;
  const memoryTypeClass = memoryEvent ? memoryBadgeTone(memoryEvent.type) : "border border-muted-foreground/30";
  const [showAllRegisters, setShowAllRegisters] = useState(false);

  const visibleRegisters = useMemo(
    () => (showAllRegisters ? registers : registers.slice(0, 8)),
    [registers, showAllRegisters]
  );
  const toggleLabel = showAllRegisters ? "Hide Advanced Registers" : "Show All Registers";

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <Tabs defaultValue="registers" className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-muted/30">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="registers">Registers</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="registers" className="flex-1 overflow-auto p-4 mt-0 space-y-4">
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-500">Write-back Activity</span>
              <Badge className="bg-background/70 text-foreground border border-emerald-500/40">
                Cycle {registerEvent ? registerEvent.cycle : currentCycle}
              </Badge>
            </div>
            {registerEvent ? (
              <div className="mt-2 space-y-1 text-sm">
                <p className="font-mono text-foreground">
                  {registerEvent.register} ← {formatHexWord(registerEvent.value)}{" "}
                  <span className="text-xs text-muted-foreground">
                    ({formatSignedDecimal(registerEvent.value)})
                  </span>
                </p>
                {registerEvent.instruction && (
                  <p className="text-xs text-muted-foreground">{registerEvent.instruction}</p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                No registers have been updated yet. Execute a step to see write-back activity highlighted here.
              </p>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Register</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRegisters.map((reg) => {
                const highlightClasses = reg.isHighlighted
                  ? "bg-emerald-500/10 border-l-4 border-emerald-500/70 animate-pulse"
                  : undefined;
                return (
                  <TableRow key={reg.name} className={highlightClasses}>
                    <TableCell className="font-mono font-medium">{reg.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      <div className="flex items-baseline justify-end gap-2">
                        <span className="text-foreground">{reg.value}</span>
                        {typeof reg.decimal === "number" && (
                          <span className="text-xs text-muted-foreground">
                            {formatSignedDecimal(reg.decimal)}
                          </span>
                        )}
                      </div>
                      {reg.isHighlighted && (
                        <div className="mt-1 flex justify-end">
                          <Badge className="bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                            Updated
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAllRegisters((prev) => !prev)}
            >
              {toggleLabel}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="memory" className="flex-1 overflow-auto p-4 mt-0 space-y-4">
          <div className="rounded-lg border border-muted-foreground/20 bg-muted/20 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Last Memory Access</span>
              <Badge className={memoryTypeClass}>
                {memoryEvent ? `${memoryEvent.type === "LOAD" ? "Load" : "Store"} · Cycle ${memoryEvent.cycle}` : "Waiting"}
              </Badge>
            </div>
            {memoryEvent ? (
              <div className="mt-2 space-y-1 text-sm">
                <p className="font-mono text-foreground">
                  Address {formatByteAddress(memoryEvent.address)} (word {memoryEvent.wordAddress})
                </p>
                <p className="font-mono text-foreground">
                  Value {formatHexWord(memoryEvent.value)}{" "}
                  <span className="text-xs text-muted-foreground">
                    ({formatSignedDecimal(memoryEvent.value)})
                  </span>
                </p>
                {memoryEvent.instruction && (
                  <p className="text-xs text-muted-foreground">{memoryEvent.instruction}</p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                Loads and stores will appear here with their address and value so you can narrate memory behaviour cycle by cycle.
              </p>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
              <span>Focused Memory Window</span>
              <span>{memoryWindow.rangeLabel}</span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memoryWindow.cells.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-xs text-muted-foreground">
                      Memory is empty for this configuration.
                    </TableCell>
                  </TableRow>
                ) : (
                  memoryWindow.cells.map((cell) => {
                    const baseHighlight =
                      cell.isHighlighted && cell.accessType
                        ? cell.accessType === "STORE"
                          ? "bg-amber-500/10 border-l-4 border-amber-500/70"
                          : "bg-sky-500/10 border-l-4 border-sky-500/70"
                        : cell.isHighlighted
                        ? "bg-primary/10 border-l-4 border-primary/50"
                        : "";
                    const pulse = cell.isRecent ? " animate-pulse" : "";
                    const rowClasses = `${baseHighlight}${pulse}`;
                    return (
                      <TableRow key={cell.address} className={rowClasses || undefined}>
                        <TableCell className="font-mono font-medium">{cell.address}</TableCell>
                        <TableCell className="text-right font-mono">
                          <div className="flex items-baseline justify-end gap-2">
                            <span className="text-foreground">{cell.value}</span>
                            {typeof cell.decimal === "number" && (
                              <span className="text-xs text-muted-foreground">
                                {formatSignedDecimal(cell.decimal)}
                              </span>
                            )}
                          </div>
                          {cell.isHighlighted && cell.accessType && (
                            <div className="mt-1 flex justify-end">
                              <Badge className={`${memoryBadgeTone(cell.accessType)} uppercase tracking-wide`}>
                                {cell.accessType === "STORE" ? "Store" : "Load"}
                              </Badge>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
