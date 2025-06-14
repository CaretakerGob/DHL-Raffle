
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmployeeSelector } from "@/components/employee-selector";
import { RafflePool } from "@/components/raffle-pool";
import { WinnerDisplay } from "@/components/winner-display";
import { Confetti } from "@/components/confetti";
import type { Employee } from "@/types/employee";
import { useToast } from "@/hooks/use-toast";
import { Settings, Trophy } from "lucide-react";

// Helper to generate unique IDs for mock data
const generateId = (prefix: string, index: number): string => {
  return `${prefix}-${index + 1}-${Date.now().toString(36).slice(-4)}-${Math.random().toString(36).slice(2, 6)}`;
};

const RAW_EMPLOYEE_NAMES: string[] = [
  'Alice Wonderland', 'Bob The Builder', 'Charlie Brown', 'Diana Prince', 'Edward Scissorhands',
  'Fiona Gallagher', 'George Jetson', 'Hannah Montana', 'Ian Malcolm', 'Julia Child',
  'Katherine Hepburn', 'Louis Armstrong', 'Marie Curie', 'Nikola Tesla', 'Oscar Wilde',
  'Pablo Picasso', 'Queen Elizabeth', 'Rembrandt van Rijn', 'Simone de Beauvoir', 'Thomas Edison',
  'Ursula K. Le Guin', 'Vincent van Gogh', 'Wolfgang Mozart', 'Xiaoming Li', 'Yoko Ono Zee'
];

// Ensure MOCK_EMPLOYEES_DATA has unique IDs
const MOCK_EMPLOYEES_DATA: Employee[] = RAW_EMPLOYEE_NAMES.map((name, index) => ({
  id: generateId('emp', index),
  name: name,
}));


export default function RafflePage() {
  const [allEmployees, setAllEmployees] = _React.useState<Employee[]>(() => 
    // Sort a COPY of the mock data for initial state
    [...MOCK_EMPLOYEES_DATA].sort((a,b) => a.name.localeCompare(b.name))
  );
  const [rafflePool, setRafflePool] = _React.useState<Employee[]>([]);
  const [winner, setWinner] = _React.useState<Employee | null>(null);
  const [isDrawing, setIsDrawing] = _React.useState<boolean>(false);
  const [showConfetti, setShowConfetti] = _React.useState<boolean>(false);
  const [showWinnerModal, setShowWinnerModal] = _React.useState<boolean>(false);
  const [showManageEmployeesModal, setShowManageEmployeesModal] = _React.useState<boolean>(false);
  const modalTimerRef = _React.useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const handleAddEmployeeToPool = (employeeId: string) => {
    const employeeToAdd = allEmployees.find((emp) => emp.id === employeeId);
    if (employeeToAdd && !rafflePool.find((emp) => emp.id === employeeId)) {
      setRafflePool((prevPool) => [...prevPool, employeeToAdd]);
      // Toast is handled in EmployeeSelector
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

  const handleDeleteEmployeeSystemWide = (employeeId: string) => {
    let employeeNameForToast: string | undefined;

    setAllEmployees(prevAllEmployees => {
      const employeeToRemove = prevAllEmployees.find(emp => emp.id === employeeId);
      if (employeeToRemove) {
        employeeNameForToast = employeeToRemove.name;
      }
      // Filtering creates a new array. The list is kept sorted, so no need to re-sort here.
      return prevAllEmployees.filter(emp => emp.id !== employeeId);
    });

    setRafflePool(prevPool => prevPool.filter(emp => emp.id !== employeeId));

    if (employeeNameForToast) {
      toast({
        title: "Employee Removed",
        description: `${employeeNameForToast} has been removed from the system and the raffle pool.`,
        variant: "destructive",
      });
    } else {
      // This case implies the employee was not found in the prevAllEmployees state during the update.
      // Could happen if the action was somehow duplicated or list was already modified.
      toast({
        title: "Notice",
        description: `Employee with ID ${employeeId} was not found for removal, or was already removed.`,
        variant: "destructive", // Kept as destructive for visibility, could be default
      });
    }
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

      setRafflePool([]); // Clear pool after drawing

      toast({
        title: "Winner Selected!",
        description: `Congratulations to ${newWinner.name}! The raffle pool has been cleared.`,
        duration: 5000,
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
          <div className="bg-card/90 backdrop-blur-sm py-2 px-3 rounded-lg shadow-xl border border-white/20 flex flex-col items-center">
            <Image
              src="/DHL-raffle-Logo.png"
              alt="DHL Raffle Logo"
              width={350}
              height={105}
              priority
              className="mb-0"
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
                  Add, create, or remove employees from the system.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="flex-1">
                <div className="px-6 pb-6">
                  <EmployeeSelector
                    allEmployees={allEmployees}
                    setAllEmployees={setAllEmployees} 
                    availableEmployeesForSelection={availableToAddToPoolEmployees}
                    onAddEmployeeToPool={handleAddEmployeeToPool}
                    onDeleteEmployeeSystemWide={handleDeleteEmployeeSystemWide}
                  />
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>


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
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          {!isDrawing && winner && !showWinnerModal && (
            <div className="mt-8 sm:mt-12">
              <WinnerDisplay winner={winner} />
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
