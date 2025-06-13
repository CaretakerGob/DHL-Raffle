
"use client";

import * as _React from "react"; 
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeSelector } from "@/components/employee-selector";
import { RafflePool } from "@/components/raffle-pool";
import { WinnerDisplay } from "@/components/winner-display";
import type { Employee } from "@/types/employee";
import { useToast } from "@/hooks/use-toast";

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
];

export default function RafflePage() {
  const [_allEmployees, setAllEmployees] = _React.useState<Employee[]>(MOCK_EMPLOYEES_DATA);
  const [rafflePool, setRafflePool] = _React.useState<Employee[]>([]);
  const [winner, setWinner] = _React.useState<Employee | null>(null);
  const [isDrawing, setIsDrawing] = _React.useState<boolean>(false);
  const { toast } = useToast();

  const handleAddEmployee = (employeeId: string) => {
    const employeeToAdd = _allEmployees.find((emp) => emp.id === employeeId);
    if (employeeToAdd && !rafflePool.find((emp) => emp.id === employeeId)) {
      setRafflePool((prevPool) => [...prevPool, employeeToAdd]);
    }
  };

  const handleRemoveEmployee = (employeeId: string) => {
    const employeeToRemove = rafflePool.find(emp => emp.id === employeeId);
    setRafflePool((prevPool) => prevPool.filter((emp) => emp.id !== employeeId));
    if (employeeToRemove) {
      toast({
        title: "Employee Removed",
        description: `${employeeToRemove.name} has been removed from the raffle.`,
        variant: "destructive",
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

    toast({
      title: "Drawing Winner...",
      description: "Get ready to find out who the lucky employee is!",
    });

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * rafflePool.length);
      const newWinner = rafflePool[randomIndex];
      setWinner(newWinner);
      setIsDrawing(false);
      setRafflePool([]); 
      toast({
        title: "Winner Selected!",
        description: `Congratulations to ${newWinner.name}! The raffle pool has been cleared.`,
        duration: 5000, 
      });
    }, 2500);
  };

  const availableToAdEmployees = _allEmployees.filter(
    (emp) => !rafflePool.find((pEmp) => pEmp.id === emp.id)
  );

  return (
    <div 
      className="min-h-screen text-foreground flex flex-col items-center py-8 sm:py-10 px-4 font-body bg-cover bg-center bg-no-repeat bg-fixed" 
      style={{ backgroundImage: "url('/sunburst-background.png')" }}
    >
      <header className="mb-8 sm:mb-10 text-center">
        <div className="bg-card/70 backdrop-blur-md p-4 sm:p-6 rounded-lg shadow-xl border border-white/20">
          <Image 
            src="/dhl-logo.svg" 
            alt="DHL Logo" 
            width={200} 
            height={60} 
            className="mx-auto mb-4"
            priority
          />
          <h1 className="text-3xl sm:text-4xl font-headline font-bold">
            <span className="text-accent">DHL</span> <span className="text-primary">Raffle</span>
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2">Recognizing our outstanding employees</p>
        </div>
      </header>

      <main className="w-full max-w-xl space-y-6 sm:space-y-8">
        <Card className="shadow-lg bg-card/85 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-center sm:text-left">Add Employees to Raffle</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeSelector
              availableEmployees={availableToAdEmployees}
              onAddEmployee={handleAddEmployee}
            />
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-card/85 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-center sm:text-left">
              Raffle Pool ({rafflePool.length} participant{rafflePool.length === 1 ? '' : 's'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RafflePool
              pooledEmployees={rafflePool}
              onRemoveEmployee={handleRemoveEmployee}
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
          <div className="mt-8 sm:mt-12 text-center text-2xl font-semibold text-primary bg-card/70 backdrop-blur-md p-4 rounded-lg shadow-md animate-pulse border border-white/20">
            Picking a winner... Good luck!
          </div>
        )}
        
        {!isDrawing && winner && (
          <div className="mt-8 sm:mt-12">
            <WinnerDisplay winner={winner} />
          </div>
        )}
      </main>

      <footer className="mt-10 sm:mt-16 text-center text-sm text-muted-foreground bg-card/70 backdrop-blur-md p-3 rounded-lg shadow-md border border-white/20">
        <p>&copy; {new Date().getFullYear()} DHL. All rights reserved.</p>
      </footer>
    </div>
  );
}

