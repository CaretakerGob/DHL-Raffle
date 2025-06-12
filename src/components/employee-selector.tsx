"use client";

import type { Employee } from "@/types/employee";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmployeeSelectorProps {
  availableEmployees: Employee[];
  onAddEmployee: (employeeId: string) => void;
}

export function EmployeeSelector({ availableEmployees, onAddEmployee }: EmployeeSelectorProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string | undefined>(undefined);
  const { toast } = useToast();

  const handleAdd = () => {
    if (selectedEmployeeId && selectedEmployeeId !== "none") {
      const employeeToAdd = availableEmployees.find(emp => emp.id === selectedEmployeeId);
      onAddEmployee(selectedEmployeeId);
      toast({
        title: "Employee Added",
        description: `${employeeToAdd?.name} has been added to the raffle.`,
      });
      setSelectedEmployeeId(undefined); // Reset selection
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
        <SelectTrigger className="flex-grow" aria-label="Select an employee">
          <SelectValue placeholder="Select an employee" />
        </SelectTrigger>
        <SelectContent>
          {availableEmployees.length > 0 ? (
            availableEmployees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>
              All employees added or none available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      <Button onClick={handleAdd} disabled={!selectedEmployeeId || selectedEmployeeId === "none" || availableEmployees.length === 0}>
        <UserPlus className="mr-2 h-4 w-4" /> Add to Raffle
      </Button>
    </div>
  );
}
