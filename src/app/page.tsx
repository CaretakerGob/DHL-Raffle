
"use client";

import * as _React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmployeeSelector } from "@/components/employee-selector";
import { RafflePool } from "@/components/raffle-pool";
import { WinnerDisplay } from "@/components/winner-display";
import { Confetti } from "@/components/confetti";
import type { Employee } from "@/types/employee";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_EMPLOYEES } from "@/data/default-employees";
import { Settings, Trophy, Gift } from "lucide-react";

const LOCAL_STORAGE_EMPLOYEES_KEY = 'dhlRaffleEmployeesV2';

const generateId = (prefix: string, index: number): string => {
  const randomPart = Math.random().toString(36).substring(2, 10);
  const timestampPart = Date.now().toString(36);
  return `${prefix}-${index + 1}-${timestampPart}-${randomPart}`;
};

type ConfirmationAction = 
  | null 
  | { type: 'deleteAll' } 
  | { type: 'deleteSingle', employeeId: string, employeeName: string }
  | { type: 'restoreDefaults' };


export default function RafflePage() {
  const [allEmployees, setAllEmployees] = _React.useState<Employee[]>([]);
  const [rafflePool, setRafflePool] = _React.useState<Employee[]>([]);
  const [winner, setWinner] = _React.useState<Employee | null>(null);
  const [prizeName, setPrizeName] = _React.useState<string>("");
  const [isDrawing, setIsDrawing] = _React.useState<boolean>(false);
  const [showConfetti, setShowConfetti] = _React.useState<boolean>(false);
  const [showWinnerModal, setShowWinnerModal] = _React.useState<boolean>(false);
  const [showManageEmployeesModal, setShowManageEmployeesModal] = _React.useState<boolean>(false);
  const modalTimerRef = _React.useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const [isInitialLoadComplete, setIsInitialLoadComplete] = _React.useState<boolean>(false);

  const [showConfirmationDialog, setShowConfirmationDialog] = _React.useState<boolean>(false);
  const [confirmationAction, setConfirmationAction] = _React.useState<ConfirmationAction>(null);
  const [confirmationTitle, setConfirmationTitle] = _React.useState<string>("");
  const [confirmationMessage, setConfirmationMessage] = _React.useState<string>("");


  _React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmployeesJson = localStorage.getItem(LOCAL_STORAGE_EMPLOYEES_KEY);
      let dataToSetStateWith: Employee[];
      console.log('[RafflePage] Initial load: reading from localStorage. Key:', LOCAL_STORAGE_EMPLOYEES_KEY);

      if (storedEmployeesJson) {
        console.log('[RafflePage] Initial load: Found stored employees JSON:', storedEmployeesJson);
        try {
          const parsedEmployees = JSON.parse(storedEmployeesJson) as Partial<Employee>[];
          dataToSetStateWith = parsedEmployees.map((emp, index) => ({
            id: emp.id || generateId('migrated', index),
            name: emp.name || 'Unknown Employee',
            category: emp.category || 'employee',
          })) as Employee[];
          console.log('[RafflePage] Initial load: Parsed employees successfully:', dataToSetStateWith);
        } catch (error) {
          console.error("[RafflePage] Initial load: Error parsing employees from localStorage. Clearing stored data and using default data:", error);
          localStorage.removeItem(LOCAL_STORAGE_EMPLOYEES_KEY);
          dataToSetStateWith = [...DEFAULT_EMPLOYEES].sort((a, b) => a.name.localeCompare(b.name));
        }
      } else {
        console.log('[RafflePage] Initial load: No stored employees found. Using default data.');
        dataToSetStateWith = [...DEFAULT_EMPLOYEES].sort((a, b) => a.name.localeCompare(b.name));
      }
      setAllEmployees(dataToSetStateWith);
      setIsInitialLoadComplete(true); 
      console.log('[RafflePage] Initial load: Completed. isInitialLoadComplete set to true.');
    }
  }, []);

  _React.useEffect(() => {
    console.log('[RafflePage] Persistence Effect: Triggered. isInitialLoadComplete:', isInitialLoadComplete, 'Number of employees:', allEmployees.length);
    if (typeof window !== 'undefined' && isInitialLoadComplete) {
      console.log('[RafflePage] Persistence Effect: Conditions met. Attempting to save to localStorage. Key:', LOCAL_STORAGE_EMPLOYEES_KEY);
      try {
        localStorage.setItem(LOCAL_STORAGE_EMPLOYEES_KEY, JSON.stringify(allEmployees));
        console.log('[RafflePage] Persistence Effect: Successfully saved employees to localStorage:', allEmployees);
      } catch (error) {
        console.error('[RafflePage] Persistence Effect: Error saving employees to localStorage:', error);
      }
    } else {
      console.log('[RafflePage] Persistence Effect: Conditions NOT met for saving. isInitialLoadComplete:', isInitialLoadComplete);
    }
  }, [allEmployees, isInitialLoadComplete]);


  const handleAddEmployeeToPool = (employeeId: string) => {
    const employeeToAdd = allEmployees.find((emp) => emp.id === employeeId);
    if (employeeToAdd && !rafflePool.find((emp) => emp.id === employeeId)) {
      setRafflePool((prevPool) => [...prevPool, employeeToAdd]);
    }
  };

  const handleRemoveEmployeeFromPool = (employeeId: string) => {
    const employeeToRemove = rafflePool.find(emp => emp.id === employeeId);
    setRafflePool((prevPool) => prevPool.filter((emp) => emp.id !== employeeId));
    if (employeeToRemove) {
      toast({
        title: "Employee Removed from Pool",
        description: `${employeeToRemove.name} has been removed from the raffle pool.`,
      });
    }
  };

 const executeDeleteSingleEmployee = (employeeId: string) => {
    let employeeNameForToast: string | undefined;
    console.log(`[RafflePage] Attempting to delete employee with ID: ${employeeId}`);

    setAllEmployees(prevAllEmployees => {
      const employeeFound = prevAllEmployees.find(emp => emp.id === employeeId);
      if (employeeFound) {
        employeeNameForToast = employeeFound.name;
        console.log(`[RafflePage] Found employee for deletion: ${employeeNameForToast}`);
      } else {
         console.warn(`[RafflePage] handleDelete: Employee with ID ${employeeId} not found in 'allEmployees' state for toast message. Current count: ${prevAllEmployees.length}`);
      }
      const newList = prevAllEmployees.filter(emp => emp.id !== employeeId);
      console.log(`[RafflePage] New employee list after filter (length ${newList.length}):`, newList);
      return newList;
    });

    setRafflePool(prevPool => prevPool.filter(emp => emp.id !== employeeId));

    if (employeeNameForToast) {
      console.log(`[RafflePage] Employee ${employeeNameForToast} removed from system.`);
      toast({
        title: "Employee Removed",
        description: `${employeeNameForToast} has been removed from the system and the raffle pool.`,
        variant: "destructive",
      });
    } else {
      console.log(`[RafflePage] Employee with ID ${employeeId} not found or already removed.`);
      toast({
        title: "Employee Not Found or Already Removed",
        description: `Employee with ID ${employeeId} could not be removed or was already gone.`,
        variant: "destructive",
      });
    }
  };

  const requestDeleteSingleEmployee = (employeeId: string, employeeName: string) => {
    setConfirmationTitle("Confirm Deletion");
    setConfirmationMessage(`Are you sure you want to permanently remove ${employeeName} from the system? This action cannot be undone.`);
    setConfirmationAction({ type: 'deleteSingle', employeeId, employeeName });
    setShowConfirmationDialog(true);
  };

  const handleDeleteAllEmployeesRequest = () => {
    console.log('[RafflePage] Attempting to delete all employees.');
    if (allEmployees.length === 0) {
      console.log('[RafflePage] No employees to delete.');
      toast({
        title: "No Employees",
        description: "There are no employees in the system to delete.",
      });
      return;
    }
    setConfirmationTitle("Confirm Delete All");
    setConfirmationMessage("Are you sure you want to permanently remove ALL employees from the system? This action cannot be undone.");
    setConfirmationAction({ type: 'deleteAll' });
    setShowConfirmationDialog(true);
  };

  const handleRestoreDefaultEmployeesRequest = () => {
    if (DEFAULT_EMPLOYEES.length === 0) {
        toast({
            title: "No Default Employees",
            description: "There is no default employee list configured.",
        });
        return;
    }
    setConfirmationTitle("Confirm Restore Defaults");
    setConfirmationMessage("Are you sure you want to replace all current employees with the default list? This action cannot be undone and will also clear the current raffle pool.");
    setConfirmationAction({ type: 'restoreDefaults' });
    setShowConfirmationDialog(true);
  };

  const handleConfirmAction = () => {
    if (!confirmationAction) return;

    if (confirmationAction.type === 'deleteAll') {
      console.log('[RafflePage] Confirmed deletion of all employees.');
      setAllEmployees([]);
      setRafflePool([]);
      console.log('[RafflePage] All employees state set to empty.');
      toast({
        title: "All Employees Removed",
        description: "All employees have been removed from the system and the raffle pool.",
        variant: "destructive",
      });
    } else if (confirmationAction.type === 'deleteSingle') {
      console.log(`[RafflePage] Confirmed deletion of single employee: ${confirmationAction.employeeName}`);
      executeDeleteSingleEmployee(confirmationAction.employeeId);
    } else if (confirmationAction.type === 'restoreDefaults') {
      console.log('[RafflePage] Confirmed restoration of default employees.');
      setAllEmployees([...DEFAULT_EMPLOYEES].sort((a, b) => a.name.localeCompare(b.name)));
      setRafflePool([]);
      console.log('[RafflePage] Employee list restored to defaults.');
      toast({
        title: "Defaults Restored",
        description: "The employee list has been restored to the default set. The raffle pool has been cleared.",
      });
    }


    setShowConfirmationDialog(false);
    setConfirmationAction(null);
  };

  const handleCancelAction = () => {
    console.log('[RafflePage] Cancelled action from dialog.');
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
      const newWinner = rafflePool[randomIndex];
      setWinner(newWinner);
      setShowWinnerModal(true);
      setShowConfetti(true);
      setIsDrawing(false);

      setRafflePool([]); 

      toast({
        title: "Winner Selected!",
        description: `Congratulations to ${newWinner.name}! ${prizeName ? `They won: ${prizeName}.` : ''} The raffle pool has been cleared.`,
        duration: 7000, 
      });

      modalTimerRef.current = setTimeout(() => {
        setShowWinnerModal(false);
      }, 7000);

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
    (emp) => !rafflePool.find((pEmp) => pEmp.id === emp.id)
  );

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
              style={{ width: 'auto', height: 'auto' }}
            />
          </div>
        </header>

        <main className="w-full max-w-xl space-y-6 sm:space-y-8">
          <div className="text-center">
            <Button
              variant="default"
              onClick={() => setShowManageEmployeesModal(true)}
              className="shadow-md"
            >
              <Settings className="mr-2 h-5 w-5" />
              Manage Employees
            </Button>
          </div>

          <Dialog open={showManageEmployeesModal} onOpenChange={setShowManageEmployeesModal}>
            <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border-primary max-h-[80vh] flex flex-col p-0">
              <DialogHeader className="p-6 pb-4">
                <DialogTitle className="text-xl sm:text-2xl text-primary">Manage Employees</DialogTitle>
                <DialogDescription>
                  Add, create, or remove employees from the system. You can also restore the default list.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="flex-1">
                <div className="px-6 pb-6">
                  {isInitialLoadComplete ? (
                    <EmployeeSelector
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

          <Card className="shadow-lg bg-card/90 backdrop-blur-md border border-white/20">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-center sm:text-left flex items-center">
                <Gift className="mr-2 h-6 w-6 text-primary" />
                Set Prize (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="E.g., $50 Gift Card, Extra Day Off"
                value={prizeName}
                onChange={(e) => setPrizeName(e.target.value)}
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-card/90 backdrop-blur-md border border-white/20">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-center sm:text-left">
                Raffle Pool ({rafflePool.length} participant{rafflePool.length === 1 ? '' : 's'})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RafflePool
                pooledEmployees={rafflePool}
                onRemoveEmployee={handleRemoveEmployeeFromPool}
              />
            </CardContent>
          </Card>

          <div className="text-center pt-4">
            <Button
              onClick={handleDrawWinner}
              disabled={rafflePool.length === 0 || isDrawing}
              className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-3 text-lg rounded-lg shadow-md transform hover:scale-105 transition-transform duration-150 ease-in-out"
              size="lg"
            >
              {isDrawing ? 'Drawing...' : 'Draw Winner!'}
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
                  <Trophy className="h-24 w-24 text-accent drop-shadow-[0_4px_10px_hsl(var(--accent)/0.5)]" strokeWidth={1.5} />
                </div>
                <DialogTitle className="text-4xl sm:text-5xl font-bold text-card-foreground animate-winner-reveal" style={{ animationDelay: '0.2s' }}>
                  {winner?.name}
                </DialogTitle>
                <DialogDescription className="text-xl text-card-foreground/90 mt-3 animate-winner-reveal" style={{ animationDelay: '0.4s' }}>
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
          
          <AlertDialog open={showConfirmationDialog} onOpenChange={setShowConfirmationDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{confirmationTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  {confirmationMessage}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={handleCancelAction}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmAction}>Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>


          {!isDrawing && winner && !showWinnerModal && (
            <div className="mt-8 sm:mt-12">
              <WinnerDisplay winner={winner} prizeName={prizeName} />
            </div>
          )}
        </main>

        <footer className="mt-10 sm:mt-16 text-center text-sm text-muted-foreground bg-card/90 backdrop-blur-md p-3 rounded-lg shadow-md border border-white/20">
          <p>&copy; {new Date().getFullYear()} DHL. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
    

    

    



