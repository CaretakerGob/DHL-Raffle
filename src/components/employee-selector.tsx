
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
import { Label } from "@/components/ui/label";
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
  const [newEmployeeCategory, setNewEmployeeCategory] = React.useState<'employee' | 'leadership'>('employee');
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
      category: newEmployeeCategory,
    };

    setAllEmployees((prevAllEmployees) => [...prevAllEmployees, newEmployee].sort((a,b) => a.name.localeCompare(b.name)));
    toast({
      title: "Employee Created",
      description: `${newEmployee.name} (${newEmployee.category}) has been added.`,
    });
    setNewEmployeeNameInput("");
    setNewEmployeeCategory("employee"); // Reset category to default
  };

 const handleDeletePress = (employeeId: string, employeeName: string) => {
    console.log(`[EmployeeSelector] handleDeletePress called for: ${employeeName} (ID: ${employeeId})`);
    if (window.confirm(`Are you sure you want to permanently remove ${employeeName} from the system? This action cannot be undone.`)) {
      console.log(`[EmployeeSelector] Proceeding with deletion for: ${employeeName} (ID: ${employeeId})`);
      onDeleteEmployeeSystemWide(employeeId);
    } else {
      console.log(`[EmployeeSelector] Cancelled deletion for: ${employeeName} (ID: ${employeeId})`);
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
            <SelectValue placeholder="Select an employee to add to pool..." />
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

      <div className="pt-2 space-y-3">
        <h3 className="text-sm font-medium mb-2 text-muted-foreground flex items-center"><PlusCircle className="mr-2 h-4 w-4" />Create New Employee</h3>
        <div>
          <Label htmlFor="new-employee-name" className="text-xs text-muted-foreground">Name</Label>
          <Input
            id="new-employee-name"
            type="text"
            placeholder="Enter new employee's name"
            value={newEmployeeNameInput}
            onChange={(e) => setNewEmployeeNameInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreateAndAddEmployee();}}
            className="flex-grow mt-1"
          />
        </div>
        <div>
          <Label htmlFor="new-employee-category" className="text-xs text-muted-foreground">Category</Label>
          <Select
            value={newEmployeeCategory}
            onValueChange={(value) => setNewEmployeeCategory(value as 'employee' | 'leadership')}
          >
            <SelectTrigger id="new-employee-category" className="w-full mt-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="leadership">Leadership</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleCreateAndAddEmployee} variant="default" className="w-full">
          Create & Add
        </Button>
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
              {allEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 text-sm">
                  <div className="flex items-center">
                    <span className="text-foreground">{employee.name}</span>
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {employee.category.charAt(0).toUpperCase() + employee.category.slice(1)}
                    </span>
                  </div>
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
