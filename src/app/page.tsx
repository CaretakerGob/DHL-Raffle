
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
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmployeeSelector } from "@/components/employee-selector";
import { RafflePool } from "@/components/raffle-pool";
import { WinnerDisplay } from "@/components/winner-display";
import { Confetti } from "@/components/confetti";
import type { Employee } from "@/types/employee";
import { useToast } from "@/hooks/use-toast";
import { Settings, Trophy, Gift } from "lucide-react";

const LOCAL_STORAGE_EMPLOYEES_KEY = 'dhlRaffleEmployeesV2';

const generateId = (prefix: string, index: number): string => {
  const randomPart = Math.random().toString(36).substring(2, 10);
  const timestampPart = Date.now().toString(36);
  return `${prefix}-${index + 1}-${timestampPart}-${randomPart}`;
};

const RAW_EMPLOYEE_NAMES_CATEGORIES: Array<{name: string, category: 'employee' | 'leadership'}> = [
  { name: 'Alice Wonderland', category: 'leadership' },
  { name: 'Bob The Builder', category: 'leadership' },
  { name: 'Charlie Brown', category: 'leadership' },
  { name: 'Diana Prince', category: 'leadership' },
  { name: 'Edward Scissorhands', category: 'leadership' },
  { name: 'Fiona Gallagher', category: 'employee' },
  { name: 'George Jetson', category: 'employee' },
  { name: 'Hannah Montana', category: 'employee' },
  { name: 'Ian Malcolm', category: 'employee' },
  { name: 'Julia Child', category: 'employee' },
  { name: 'Katherine Hepburn', category: 'employee' },
  { name: 'Louis Armstrong', category: 'employee' },
  { name: 'Marie Curie', category: 'employee' },
  { name: 'Nikola Tesla', category: 'employee' },
  { name: 'Oscar Wilde', category: 'employee' },
  { name: 'Pablo Picasso', category: 'employee' },
  { name: 'Queen Elizabeth', category: 'employee' },
  { name: 'Rembrandt van Rijn', category: 'employee' },
  { name: 'Simone de Beauvoir', category: 'employee' },
  { name: 'Thomas Edison', category: 'employee' },
  { name: 'Ursula K. Le Guin', category: 'employee' },
  { name: 'Vincent van Gogh', category: 'employee' },
  { name: 'Wolfgang Mozart', category: 'employee' },
  { name: 'Xiaoming Li', category: 'employee' },
  { name: 'Yoko Ono Zee', category: 'employee' }
];

const MOCK_EMPLOYEES_DATA: Employee[] = RAW_EMPLOYEE_NAMES_CATEGORIES.map((emp, index) => ({
  id: generateId('emp', index),
  name: emp.name,
  category: emp.category,
}));


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


  _React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmployeesJson = localStorage.getItem(LOCAL_STORAGE_EMPLOYEES_KEY);
      let initialDataToSet: Employee[];

      if (storedEmployeesJson) {
        try {
          let storedEmployees = JSON.parse(storedEmployeesJson) as Partial<Employee>[];
          initialDataToSet = storedEmployees.map((emp, index) => ({
            id: emp.id || generateId('migrated', index),
            name: emp.name || 'Unknown Employee',
            category: emp.category || 'employee',
          })) as Employee[];
        } catch (error) {
          console.error("Error parsing employees from localStorage, falling back to mock data:", error);
          initialDataToSet = [...MOCK_EMPLOYEES_DATA].sort((a, b) => a.name.localeCompare(b.name));
          localStorage.setItem(LOCAL_STORAGE_EMPLOYEES_KEY, JSON.stringify(initialDataToSet));
        }
      } else {
        initialDataToSet = [...MOCK_EMPLOYEES_DATA].sort((a, b) => a.name.localeCompare(b.name));
        localStorage.setItem(LOCAL_STORAGE_EMPLOYEES_KEY, JSON.stringify(initialDataToSet));
      }
      setAllEmployees(initialDataToSet);
      setIsInitialLoadComplete(true);
    }
  }, []);

  _React.useEffect(() => {
    if (typeof window !== 'undefined' && isInitialLoadComplete) {
      localStorage.setItem(LOCAL_STORAGE_EMPLOYEES_KEY, JSON.stringify(allEmployees));
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

 const handleDeleteEmployeeSystemWide = (employeeId: string) => {
    let employeeNameForToast: string | undefined;

    setAllEmployees(prevAllEmployees => {
      const employeeFound = prevAllEmployees.find(emp => emp.id === employeeId);
      if (employeeFound) {
        employeeNameForToast = employeeFound.name;
      } else {
         console.warn(`[RafflePage] handleDelete: Employee with ID ${employeeId} not found in current 'allEmployees' state for toast message.`);
      }
      const newList = prevAllEmployees.filter(emp => emp.id !== employeeId);
      return newList;
    });

    setRafflePool(prevPool => prevPool.filter(emp => emp.id !== employeeId));

    if (employeeNameForToast) {
      toast({
        title: "Employee Removed",
        description: `${employeeNameForToast} has been removed from the system and the raffle pool.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Employee Removed",
        description: `An employee (ID: ${employeeId}) has been removed from the system and the raffle pool.`,
        variant: "destructive",
      });
       console.log(`[RafflePage] Toast fallback: Employee with ID ${employeeId} was targeted for deletion but name not found prior to removal.`);
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

      setRafflePool([]); // Clear the pool after drawing

      toast({
        title: "Winner Selected!",
        description: `Congratulations to ${newWinner.name}! ${prizeName ? `They won: ${prizeName}.` : ''} The raffle pool has been cleared.`,
        duration: 7000, // Increased duration for prize info
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
              height={100}
              priority
              style={{ height: 'auto' }}
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
                  {isInitialLoadComplete ? (
                    <EmployeeSelector
                      allEmployees={allEmployees}
                      setAllEmployees={setAllEmployees}
                      availableEmployeesForSelection={availableToAddToPoolEmployees}
                      onAddEmployeeToPool={handleAddEmployeeToPool}
                      onDeleteEmployeeSystemWide={handleDeleteEmployeeSystemWide}
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
                      You've won: <span className="font-semibold text-primary">{prizeName}</span>!
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
        </main>

        <footer className="mt-10 sm:mt-16 text-center text-sm text-muted-foreground bg-card/90 backdrop-blur-md p-3 rounded-lg shadow-md border border-white/20">
          <p>&copy; {new Date().getFullYear()} DHL. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
