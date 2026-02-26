"use client";

import * as _React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmployeeSelector } from "@/components/employee-selector";
import { RafflePool } from "@/components/raffle-pool";
import { WinnerDisplay } from "@/components/winner-display";
import { Confetti } from "@/components/confetti";
import type { Employee, RaffleContext, WinnerRecord } from "@/types/employee";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_EMPLOYEES } from "@/data/default-employees";
import {
  DEFAULT_SHIFT_ID,
  SHIFT_OPTIONS,
  DEFAULT_LOCATION_ID,
} from "@/data/raffle-context";
import {
  loadEmployeesForContext,
  loadPoolForContext,
  loadWinnerHistoryForContext,
  saveEmployeesForContext,
  savePoolForContext,
  saveWinnerHistoryForContext,
} from "@/lib/raffle-storage";
import {
  canUseFirestore,
  loadRaffleContextFromFirestore,
  saveRaffleContextToFirestore,
} from "@/lib/raffle-firestore";
import { ensureFirebaseAuth } from "@/lib/firebase-auth";
import {
  Cloud,
  Clock3,
  Gift,
  HardDrive,
  History,
  Moon,
  Settings,
  Sun,
  Trophy,
} from "lucide-react";

const LOCAL_STORAGE_THEME_KEY = "dhlRaffleTheme";

const generateId = (prefix: string, index: number): string => {
  const randomPart = Math.random().toString(36).substring(2, 10);
  const timestampPart = Date.now().toString(36);
  return `${prefix}-${index + 1}-${timestampPart}-${randomPart}`;
};

type ConfirmationAction =
  | null
  | { type: "deleteAll" }
  | { type: "deleteSingle"; employeeId: string; employeeName: string }
  | { type: "restoreDefaults" };

const createDefaultEmployeesForContext = (context: RaffleContext): Employee[] => {
  return DEFAULT_EMPLOYEES.map((employee, index) => ({
    ...employee,
    id: generateId("default", index),
    employeeId: `${employee.employeeId}-${context.locationId}-${context.shiftId}`,
    locationId: context.locationId,
    shiftId: context.shiftId,
  })).sort((a, b) => a.name.localeCompare(b.name));
};

export default function RafflePage() {
  const [activeShiftId, setActiveShiftId] = _React.useState<string>(DEFAULT_SHIFT_ID);

  const [allEmployees, setAllEmployees] = _React.useState<Employee[]>([]);
  const [rafflePool, setRafflePool] = _React.useState<Employee[]>([]);
  const [winner, setWinner] = _React.useState<Employee | null>(null);
  const [winnerHistory, setWinnerHistory] = _React.useState<WinnerRecord[]>([]);

  const [prizeName, setPrizeName] = _React.useState<string>("");
  const [isDrawing, setIsDrawing] = _React.useState<boolean>(false);
  const [showConfetti, setShowConfetti] = _React.useState<boolean>(false);
  const [showWinnerModal, setShowWinnerModal] = _React.useState<boolean>(false);
  const [showManageEmployeesModal, setShowManageEmployeesModal] = _React.useState<boolean>(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = _React.useState<boolean>(false);

  const modalTimerRef = _React.useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const [showConfirmationDialog, setShowConfirmationDialog] = _React.useState<boolean>(false);
  const [confirmationAction, setConfirmationAction] = _React.useState<ConfirmationAction>(null);
  const [confirmationTitle, setConfirmationTitle] = _React.useState<string>("");
  const [confirmationMessage, setConfirmationMessage] = _React.useState<string>("");
  const [isDarkMode, setIsDarkMode] = _React.useState<boolean>(false);
  const [storageMode, setStorageMode] = _React.useState<"checking" | "firebase" | "local">("checking");

  const context = _React.useMemo<RaffleContext>(
    () => ({ locationId: DEFAULT_LOCATION_ID, shiftId: activeShiftId }),
    [activeShiftId]
  );

  _React.useEffect(() => {
    if (typeof window === "undefined") return;

    let isCancelled = false;

    const loadData = async () => {
      setIsInitialLoadComplete(false);
      setStorageMode("checking");

      const firestoreEnabled = canUseFirestore();

      if (!firestoreEnabled) {
        const localEmployees = loadEmployeesForContext(context);
        const localInitialEmployees =
          localEmployees.length > 0
            ? localEmployees
            : createDefaultEmployeesForContext(context);

        if (!isCancelled) {
          setStorageMode("local");
          setAllEmployees(localInitialEmployees);
          setRafflePool(loadPoolForContext(context));
          setWinnerHistory(loadWinnerHistoryForContext(context));
          setWinner(null);
          setPrizeName("");
          setIsInitialLoadComplete(true);
        }
        return;
      }

      try {
        const isAuthenticated = await ensureFirebaseAuth();
        if (!isAuthenticated) {
          throw new Error("Firebase Auth failed");
        }

        const firestoreData = await loadRaffleContextFromFirestore(context);
        const initialEmployees =
          firestoreData && firestoreData.employees.length > 0
            ? firestoreData.employees
            : createDefaultEmployeesForContext(context);

        if (!isCancelled) {
          setStorageMode("firebase");
          setAllEmployees(initialEmployees);
          setRafflePool(firestoreData?.rafflePool ?? []);
          setWinnerHistory(firestoreData?.winnerHistory ?? []);
          setWinner(null);
          setPrizeName("");
          setIsInitialLoadComplete(true);
        }

        if (!firestoreData && initialEmployees.length > 0) {
          await saveRaffleContextToFirestore(context, {
            employees: initialEmployees,
            rafflePool: [],
            winnerHistory: [],
          });
        }
      } catch {
        const localEmployees = loadEmployeesForContext(context);
        const localInitialEmployees =
          localEmployees.length > 0
            ? localEmployees
            : createDefaultEmployeesForContext(context);

        if (!isCancelled) {
          setStorageMode("local");
          setAllEmployees(localInitialEmployees);
          setRafflePool(loadPoolForContext(context));
          setWinnerHistory(loadWinnerHistoryForContext(context));
          setWinner(null);
          setPrizeName("");
          setIsInitialLoadComplete(true);
        }

        toast({
          title: "Firebase unavailable",
          description: "Falling back to local storage for now.",
          variant: "destructive",
        });
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [context]);

  _React.useEffect(() => {
    if (typeof window === "undefined") return;
    const storedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = storedTheme ? storedTheme === "dark" : prefersDark;
    setIsDarkMode(shouldUseDark);
  }, []);

  _React.useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  _React.useEffect(() => {
    if (!isInitialLoadComplete) return;

    if (storageMode === "firebase") {
      void saveRaffleContextToFirestore(context, {
        employees: allEmployees,
        rafflePool,
        winnerHistory,
      });
      return;
    }

    saveEmployeesForContext(context, allEmployees);
    savePoolForContext(context, rafflePool);
    saveWinnerHistoryForContext(context, winnerHistory);
  }, [allEmployees, rafflePool, winnerHistory, context, isInitialLoadComplete, storageMode]);

  const handleAddEmployeeToPool = (employeeId: string) => {
    const employeeToAdd = allEmployees.find((employee) => employee.id === employeeId);
    if (employeeToAdd && !rafflePool.some((employee) => employee.id === employeeId)) {
      setRafflePool((previousPool) => [...previousPool, employeeToAdd]);
    }
  };

  const handleRemoveEmployeeFromPool = (employeeId: string) => {
    const employeeToRemove = rafflePool.find((employee) => employee.id === employeeId);
    setRafflePool((previousPool) => previousPool.filter((employee) => employee.id !== employeeId));

    if (employeeToRemove) {
      toast({
        title: "Employee Removed from Pool",
        description: `${employeeToRemove.name} has been removed from the raffle pool.`,
      });
    }
  };

  const executeDeleteSingleEmployee = (employeeId: string) => {
    let employeeNameForToast: string | undefined;

    setAllEmployees((previousEmployees) => {
      const employeeFound = previousEmployees.find((employee) => employee.id === employeeId);
      employeeNameForToast = employeeFound?.name;
      return previousEmployees.filter((employee) => employee.id !== employeeId);
    });

    setRafflePool((previousPool) => previousPool.filter((employee) => employee.id !== employeeId));

    if (employeeNameForToast) {
      toast({
        title: "Employee Removed",
        description: `${employeeNameForToast} has been removed from the system and the raffle pool.`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Employee Not Found or Already Removed",
      description: `Employee with ID ${employeeId} could not be removed or was already gone.`,
      variant: "destructive",
    });
  };

  const requestDeleteSingleEmployee = (employeeId: string, employeeName: string) => {
    setConfirmationTitle("Confirm Deletion");
    setConfirmationMessage(
      `Are you sure you want to permanently remove ${employeeName} from ${context.locationId} / ${context.shiftId}?`
    );
    setConfirmationAction({ type: "deleteSingle", employeeId, employeeName });
    setShowConfirmationDialog(true);
  };

  const handleDeleteAllEmployeesRequest = () => {
    if (allEmployees.length === 0) {
      toast({
        title: "No Employees",
        description: "There are no employees in this location and shift to delete.",
      });
      return;
    }

    setConfirmationTitle("Confirm Delete All");
    setConfirmationMessage(
      `Are you sure you want to permanently remove ALL employees for ${context.locationId} / ${context.shiftId}?`
    );
    setConfirmationAction({ type: "deleteAll" });
    setShowConfirmationDialog(true);
  };

  const handleRestoreDefaultEmployeesRequest = () => {
    setConfirmationTitle("Confirm Restore Defaults");
    setConfirmationMessage(
      "Restore default employees for the current location and shift? This also clears the current raffle pool."
    );
    setConfirmationAction({ type: "restoreDefaults" });
    setShowConfirmationDialog(true);
  };

  const handleConfirmAction = () => {
    if (!confirmationAction) return;

    if (confirmationAction.type === "deleteAll") {
      setAllEmployees([]);
      setRafflePool([]);
      toast({
        title: "All Employees Removed",
        description: "All employees have been removed from this location and shift.",
        variant: "destructive",
      });
    }

    if (confirmationAction.type === "deleteSingle") {
      executeDeleteSingleEmployee(confirmationAction.employeeId);
    }

    if (confirmationAction.type === "restoreDefaults") {
      setAllEmployees(createDefaultEmployeesForContext(context));
      setRafflePool([]);
      toast({
        title: "Defaults Restored",
        description: "Employee defaults were restored for this location and shift.",
      });
    }

    setShowConfirmationDialog(false);
    setConfirmationAction(null);
  };

  const handleCancelAction = () => {
    setShowConfirmationDialog(false);
    setConfirmationAction(null);
  };

  const handleDrawWinner = () => {
    if (rafflePool.length === 0) {
      toast({
        title: "Raffle Pool Empty",
        description: "Please add employees to the raffle pool before drawing a winner.",
        variant: "destructive",
      });
      return;
    }

    setIsDrawing(true);
    setWinner(null);
    setShowWinnerModal(false);

    if (modalTimerRef.current) {
      clearTimeout(modalTimerRef.current);
    }

    setShowConfetti(false);

    toast({
      title: "Drawing Winner...",
      description: "Get ready to find out who the lucky employee is!",
    });

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * rafflePool.length);
      const selectedWinner = rafflePool[randomIndex];

      setWinner(selectedWinner);
      setShowWinnerModal(true);
      setShowConfetti(true);
      setIsDrawing(false);
      setRafflePool([]);

      const historyRecord: WinnerRecord = {
        id: generateId("winner", winnerHistory.length),
        employeeId: selectedWinner.employeeId,
        employeeName: selectedWinner.name,
        ...(prizeName.trim() ? { prizeName: prizeName.trim() } : {}),
        drawnAt: new Date().toISOString(),
        locationId: context.locationId,
        shiftId: context.shiftId,
      };

      const nextHistory = [historyRecord, ...winnerHistory].slice(0, 20);
      setWinnerHistory(nextHistory);

      toast({
        title: "Winner Selected!",
        description: `Congratulations to ${selectedWinner.name}! ${prizeName ? `They won: ${prizeName}.` : ""} The raffle pool has been cleared.`,
        duration: 7000,
      });

      modalTimerRef.current = setTimeout(() => {
        setShowWinnerModal(false);
      }, 60000);

      setTimeout(() => {
        setShowConfetti(false);
      }, 6000);
    }, 2500);
  };

  _React.useEffect(() => {
    return () => {
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current);
      }
    };
  }, []);

  const availableToAddToPoolEmployees = allEmployees.filter(
    (employee) => !rafflePool.find((poolEmployee) => poolEmployee.id === employee.id)
  );

  const prizeUsageEntries = _React.useMemo(() => {
    const counts = new Map<string, number>();

    winnerHistory.forEach((item) => {
      const normalizedPrize = item.prizeName?.trim();
      if (!normalizedPrize) return;
      counts.set(normalizedPrize, (counts.get(normalizedPrize) ?? 0) + 1);
    });

    return Array.from(counts.entries()).sort((left, right) => {
      if (right[1] !== left[1]) return right[1] - left[1];
      return left[0].localeCompare(right[0]);
    });
  }, [winnerHistory]);

  const mostUsedPrizes = _React.useMemo(() => {
    return prizeUsageEntries.slice(0, 5).map(([name, count]) => ({ name, count }));
  }, [prizeUsageEntries]);

  const previouslyUsedPrizes = _React.useMemo(() => {
    const seen = new Set<string>();
    const recentPrizes: string[] = [];

    winnerHistory.forEach((item) => {
      const normalizedPrize = item.prizeName?.trim();
      if (!normalizedPrize || seen.has(normalizedPrize)) return;
      seen.add(normalizedPrize);
      recentPrizes.push(normalizedPrize);
    });

    return recentPrizes;
  }, [winnerHistory]);

  const handlePrizePresetSelect = (value: string) => {
    const parts = value.split(":");
    const selectedPrize = parts.slice(1).join(":").trim();
    if (!selectedPrize) return;
    setPrizeName(selectedPrize);
  };

  return (
    <div className="relative min-h-screen text-foreground">
      <Confetti active={showConfetti} count={150} />
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url('/BG.png')" }}
      />
      <div className="absolute inset-0 bg-background/50" />

      <div className="relative z-10 flex flex-col items-center py-16 sm:py-24 px-4">
        <header className="mb-6 sm:mb-8 flex flex-col items-center">
          <div className="bg-primary py-2 px-3 rounded-lg shadow-xl border border-white/20 flex flex-col items-center">
            <Image
              src="/DHL-raffle-Logo.png"
              alt="DHL Raffle Logo"
              width={350}
              height={100}
              priority
              style={{ width: "auto", height: "auto" }}
            />
          </div>
        </header>

        <main className="w-full max-w-xl space-y-6 sm:space-y-8">
          <Card className="shadow-lg bg-card/90 backdrop-blur-md border border-white/20">
            <CardContent className="pt-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">Storage Status</p>
                {storageMode === "firebase" && (
                  <Badge variant="default" className="inline-flex items-center gap-1.5">
                    <Cloud className="h-3.5 w-3.5" />
                    Firebase Connected
                  </Badge>
                )}
                {storageMode === "local" && (
                  <Badge variant="secondary" className="inline-flex items-center gap-1.5">
                    <HardDrive className="h-3.5 w-3.5" />
                    Local Storage Fallback
                  </Badge>
                )}
                {storageMode === "checking" && <Badge variant="outline">Checking...</Badge>}
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <p className="mb-2 text-sm text-muted-foreground flex items-center">
                    <Clock3 className="mr-2 h-4 w-4" />
                    Shift
                  </p>
                  <Select value={activeShiftId} onValueChange={setActiveShiftId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      {SHIFT_OPTIONS.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {shift.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="inline-flex items-center gap-3 rounded-lg border border-white/20 bg-card/90 px-4 py-2 shadow-md backdrop-blur-md">
                  <Sun className="h-4 w-4 text-muted-foreground" />
                  <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} aria-label="Toggle dark mode" />
                  <Moon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="flex justify-center">
                <Button variant="default" onClick={() => setShowManageEmployeesModal(true)} className="shadow-md">
                  <Settings className="mr-2 h-5 w-5" />
                  Manage Employees
                </Button>
              </div>

              <div>
                <p className="mb-2 text-sm text-muted-foreground flex items-center">
                  <Gift className="mr-2 h-4 w-4 text-primary" />
                  Set Prize (Optional)
                </p>
                <div className="space-y-2">
                  <Select onValueChange={handlePrizePresetSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose from previous prizes" />
                    </SelectTrigger>
                    <SelectContent>
                      {mostUsedPrizes.length === 0 && previouslyUsedPrizes.length === 0 && (
                        <SelectItem value="none" disabled>
                          No previous prizes yet
                        </SelectItem>
                      )}

                      {mostUsedPrizes.length > 0 && (
                        <SelectItem value="header-most-used" disabled>
                          Most Used
                        </SelectItem>
                      )}
                      {mostUsedPrizes.map((item) => (
                        <SelectItem key={`most-${item.name}`} value={`most:${item.name}`}>
                          {item.name} ({item.count})
                        </SelectItem>
                      ))}

                      {previouslyUsedPrizes.length > 0 && (
                        <SelectItem value="header-previously-used" disabled>
                          Previously Used
                        </SelectItem>
                      )}
                      {previouslyUsedPrizes.map((name) => (
                        <SelectItem key={`recent-${name}`} value={`recent:${name}`}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                <Input
                  type="text"
                  placeholder="E.g., $50 Gift Card, Extra Day Off"
                  value={prizeName}
                  onChange={(event) => setPrizeName(event.target.value)}
                  className="w-full"
                />
                </div>
              </div>
            </CardContent>
          </Card>

          <Dialog open={showManageEmployeesModal} onOpenChange={setShowManageEmployeesModal}>
            <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border-primary max-h-[80vh] flex flex-col p-0">
              <DialogHeader className="p-6 pb-4">
                <DialogTitle className="text-xl sm:text-2xl text-primary">Manage Employees</DialogTitle>
                <DialogDescription>
                  Manage employees for this location and shift using employee badge IDs.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="flex-1">
                <div className="px-6 pb-6">
                  {isInitialLoadComplete ? (
                    <EmployeeSelector
                      context={context}
                      allEmployees={allEmployees}
                      setAllEmployees={setAllEmployees}
                      availableEmployeesForSelection={availableToAddToPoolEmployees}
                      onAddEmployeeToPool={handleAddEmployeeToPool}
                      onRequestSingleEmployeeDelete={requestDeleteSingleEmployee}
                      onDeleteAllEmployeesSystemWide={handleDeleteAllEmployeesRequest}
                      onRestoreDefaultEmployees={handleRestoreDefaultEmployeesRequest}
                    />
                  ) : (
                    <div className="text-center p-8">Loading employees...</div>
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <div className="text-center pt-4">
            <Button
              onClick={handleDrawWinner}
              disabled={rafflePool.length === 0 || isDrawing}
              className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-3 text-lg rounded-lg shadow-md transform hover:scale-105 transition-transform duration-150 ease-in-out"
              size="lg"
            >
              {isDrawing ? "Drawing..." : "Draw Winner!"}
            </Button>
          </div>

          {isDrawing && (
            <div className="mt-8 sm:mt-12 text-center text-2xl font-semibold bg-card/90 backdrop-blur-md p-4 rounded-lg shadow-md animate-pulse border border-white/20">
              Picking a winner... Good luck!
            </div>
          )}

          <Dialog open={showWinnerModal} onOpenChange={setShowWinnerModal}>
            <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-white/20 text-center p-6 rounded-xl shadow-2xl">
              <DialogHeader className="pt-4">
                <div className="flex items-center justify-center mb-4 animate-winner-reveal">
                  <Trophy
                    className="h-24 w-24 text-accent drop-shadow-[0_4px_10px_hsl(var(--accent)/0.5)]"
                    strokeWidth={1.5}
                  />
                </div>
                <DialogTitle
                  className="text-4xl sm:text-5xl font-bold text-card-foreground animate-winner-reveal"
                  style={{ animationDelay: "0.2s" }}
                >
                  {winner?.name}
                </DialogTitle>
                <DialogDescription
                  className="text-xl text-card-foreground/90 mt-3 animate-winner-reveal"
                  style={{ animationDelay: "0.4s" }}
                >
                  Congratulations!
                  {prizeName && winner && (
                    <span className="block mt-2 text-lg">
                      You've won: <span className="font-semibold text-accent">{prizeName}</span>!
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          {!isDrawing && winner && !showWinnerModal && (
            <div className="mt-8 sm:mt-12">
              <WinnerDisplay winner={winner} prizeName={prizeName} />
            </div>
          )}

          <Card className="shadow-lg bg-card/90 backdrop-blur-md border border-white/20">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-center sm:text-left">
                Raffle Pool ({rafflePool.length} participant{rafflePool.length === 1 ? "" : "s"})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RafflePool pooledEmployees={rafflePool} onRemoveEmployee={handleRemoveEmployeeFromPool} />
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-card/90 backdrop-blur-md border border-white/20">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-center sm:text-left flex items-center">
                <History className="mr-2 h-6 w-6 text-primary" />
                Winner History ({winnerHistory.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {winnerHistory.length === 0 ? (
                <p className="text-muted-foreground text-sm">No winners recorded yet for this location and shift.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {winnerHistory.map((historyItem) => (
                    <div key={historyItem.id} className="rounded-md border border-border p-3 text-sm">
                      <p className="font-medium text-foreground">
                        {historyItem.employeeName} ({historyItem.employeeId})
                      </p>
                      <p className="text-muted-foreground">
                        {historyItem.prizeName ? `Prize: ${historyItem.prizeName}` : "Prize: Not specified"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Drawn: {new Date(historyItem.drawnAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <AlertDialog open={showConfirmationDialog} onOpenChange={setShowConfirmationDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{confirmationTitle}</AlertDialogTitle>
                <AlertDialogDescription>{confirmationMessage}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={handleCancelAction}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmAction}>Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>

        <footer className="mt-10 sm:mt-16 text-center text-sm text-muted-foreground bg-card/90 backdrop-blur-md p-3 rounded-lg shadow-md border border-white/20">
          <p>&copy; {new Date().getFullYear()} DHL. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
