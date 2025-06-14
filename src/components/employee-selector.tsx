
"use client";

import type { Employee } from "@/types/employee";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus, PlusCircle, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmployeeSelectorProps {
  allEmployees: Employee[];
  setAllEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  availableEmployeesForSelection: Employee[];
  onAddEmployeeToPool: (employeeId: string) => void;
  onDeleteEmployeeSystemWide: (employeeId: string) => void;
}

export function EmployeeSelector({
  allEmployees,
  setAllEmployees,
  availableEmployeesForSelection,
  onAddEmployeeToPool,
  onDeleteEmployeeSystemWide
}: EmployeeSelectorProps) {
  const [stagedEmployeeIdForDropdown, setStagedEmployeeIdForDropdown] = React.useState<string>("");
  const [newEmployeeNameInput, setNewEmployeeNameInput] = React.useState<string>("");
  const { toast } = useToast();

  const sortedAvailableEmployeesForDropdown = React.useMemo(() => {
    return [...availableEmployeesForSelection].sort((a, b) => a.name.localeCompare(b.name));
  }, [availableEmployeesForSelection]);

  const handleDropdownSelect = (employeeId: string) => {
    if (!employeeId) {
      setStagedEmployeeIdForDropdown("");
      return;
    }
    const employee = availableEmployeesForSelection.find(emp => emp.id === employeeId);
    if (employee) {
      onAddEmployeeToPool(employee.id);
      toast({
        title: "Employee Added to Pool",
        description: `${employee.name} is now in the raffle!`,
      });
      setStagedEmployeeIdForDropdown("");
    }
  };

  const handleCreateAndAddEmployee = () => {
    const trimmedName = newEmployeeNameInput.trim();
    if (!trimmedName) {
      toast({
        title: "Invalid Name",
        description: "Employee name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    const nameExists = allEmployees.some(
      (emp) => emp.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (nameExists) {
      toast({
        title: "Duplicate Name",
        description: `An employee named "${trimmedName}" already exists.`,
        variant: "destructive",
      });
      return;
    }

    const newEmployee: Employee = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 7),
      name: trimmedName,
    };

    setAllEmployees((prevAllEmployees) => [...prevAllEmployees, newEmployee].sort((a,b) => a.name.localeCompare(b.name)));
    toast({
      title: "Employee Created",
      description: `${newEmployee.name} has been added to the system and is available for the raffle.`,
    });
    setNewEmployeeNameInput("");
  };

  const handleDeletePress = (employeeId: string, employeeName: string) => {
    if (window.confirm(`Are you sure you want to permanently remove ${employeeName} from the system? This action cannot be undone.`)) {
      onDeleteEmployeeSystemWide(employeeId);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2 text-muted-foreground flex items-center"><UserPlus className="mr-2 h-4 w-4" />Add Existing Employee to Pool</h3>
        <Select
          onValueChange={handleDropdownSelect}
          value={stagedEmployeeIdForDropdown}
          disabled={sortedAvailableEmployeesForDropdown.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an employee..." />
          </SelectTrigger>
          <SelectContent>
            {sortedAvailableEmployeesForDropdown.length === 0 ? (
              <SelectItem value="no-employees" disabled>All available employees are in the pool or none exist.</SelectItem>
            ) : (
              sortedAvailableEmployeesForDropdown.map(employee => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="pt-2">
        <h3 className="text-sm font-medium mb-2 text-muted-foreground flex items-center"><PlusCircle className="mr-2 h-4 w-4" />Create New Employee</h3>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Enter new employee's name"
            value={newEmployeeNameInput}
            onChange={(e) => setNewEmployeeNameInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreateAndAddEmployee();}}
            className="flex-grow"
          />
          <Button onClick={handleCreateAndAddEmployee} variant="default">
            Create & Add
          </Button>
        </div>
      </div>

      <div className="pt-2 flex flex-col">
        <h3 className="text-sm font-medium mb-2 text-muted-foreground flex items-center"><Users className="mr-2 h-4 w-4" />All Employees in System ({allEmployees.length})</h3>
        {allEmployees.length === 0 ? (
          <p className="text-xs text-muted-foreground mt-1">
            No employees in the system yet. Add one using the form above!
          </p>
        ) : (
          <ScrollArea className="border rounded-md h-64">
            <div className="p-2 space-y-1">
              {[...allEmployees].sort((a,b) => a.name.localeCompare(b.name)).map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 text-sm">
                  <span className="text-foreground">{employee.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive/80"
                    onClick={() => handleDeletePress(employee.id, employee.name)}
                    aria-label={`Remove ${employee.name} from system`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
