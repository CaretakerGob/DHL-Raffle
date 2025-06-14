
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

const MOCK_EMPLOYEES_DATA: Employee[] = [
  { id: '1', name: 'Alice Wonderland' },
  { id: '2', name: 'Bob The Builder' },
  { id: '3', name: 'Charlie Brown' },
  { id: '4', name: 'Diana Prince' },
  { id: '5', name: 'Edward Scissorhands' },
  { id: '6', name: 'Fiona Gallagher' },
  { id: '7', name: 'George Jetson' },
  { id: '8', name: 'Hannah Montana' },
  { id: '9', name: 'Ian Malcolm' },
  { id: '10', name: 'Julia Child' },
  { id: '11', name: 'Katherine Hepburn' },
  { id: '12', name: 'Louis Armstrong' },
  { id: '13', name: 'Marie Curie' },
  { id: '14', name: 'Nikola Tesla' },
  { id: '15', name: 'Oscar Wilde' },
  { id: '16', name: 'Pablo Picasso' },
  { id: '17', name: 'Queen Elizabeth' },
  { id: '18', name: 'Rembrandt van Rijn' },
  { id: '19', name: 'Simone de Beauvoir' },
  { id: '20', name: 'Thomas Edison' },
  { id: '21', name: 'Ursula K. Le Guin' },
  { id: '22', name: 'Vincent van Gogh' },
  { id: '23', name: 'Wolfgang Mozart' },
  { id: '24', name: 'Xiaoming Li' },
  { id: '25', name: 'Yoko Ono' },
];


export default function RafflePage() {
  const [allEmployees, setAllEmployees] = _React.useState<Employee[]>(() => [...MOCK_EMPLOYEES_DATA].sort((a,b) => a.name.localeCompare(b.name)));
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
    const employeeToRemove = allEmployees.find(emp => emp.id === employeeId);
    if (!employeeToRemove) return;

    setAllEmployees(prevAllEmployees => {
        const filteredEmployees = prevAllEmployees.filter(emp => emp.id !== employeeId);
        // Sort the new filtered array
        return filteredEmployees.sort((a, b) => a.name.localeCompare(b.name));
    });

    setRafflePool(prevRafflePool => 
        prevRafflePool.filter(emp => emp.id !== employeeId)
    );

    toast({
      title: "Employee Removed",
      description: `${employeeToRemove.name} has been removed from the system and the raffle pool.`,
      variant: "destructive",
    });
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
