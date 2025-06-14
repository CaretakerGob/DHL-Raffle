
"use client";

import type { Employee } from "@/types/employee";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Search, PlusCircle, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card"; // For listing all employees
import { ScrollArea } from "@/components/ui/scroll-area"; // For scrollable list

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
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [stagedEmployeeIdForDropdown, setStagedEmployeeIdForDropdown] = React.useState<string>("");
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [newEmployeeNameInput, setNewEmployeeNameInput] = React.useState<string>("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const filteredEmployeesForSearch = availableEmployeesForSelection.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedAvailableEmployeesForDropdown = React.useMemo(() => {
    return [...availableEmployeesForSelection].sort((a, b) => a.name.localeCompare(b.name));
  }, [availableEmployeesForSelection]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    // Always try to open if there's a term and potential matches. Popover content handles "no results"
    if (term.length > 0 && availableEmployeesForSelection.length > 0) {
      setIsPopoverOpen(true);
    } else {
      setIsPopoverOpen(false);
    }
  };

  const handleEmployeeSelect = (employee: Employee) => {
    onAddEmployeeToPool(employee.id);
    toast({
      title: "Employee Added to Pool",
      description: `${employee.name} is now in the raffle!`,
    });
    setSearchTerm(""); // Clear search input
    setIsPopoverOpen(false); // Close popover
    setStagedEmployeeIdForDropdown(""); // Clear dropdown selection if any
    inputRef.current?.focus(); // Optionally refocus search or another field
  };

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
      setStagedEmployeeIdForDropdown(""); // Reset select to placeholder
      inputRef.current?.focus(); 
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
      id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 7), // Simple unique ID
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
      // Toast is handled in RafflePage after successful deletion
    }
  };
  
  React.useEffect(() => {
    // This effect attempts to manage popover visibility based on search term and results
    if (searchTerm.length > 0 && availableEmployeesForSelection.length > 0 && filteredEmployeesForSearch.length > 0) {
      setIsPopoverOpen(true);
    } else if (searchTerm.length > 0 && availableEmployeesForSelection.length > 0 && filteredEmployeesForSearch.length === 0) {
       setIsPopoverOpen(true); // Keep open to show "No matches"
    }
     else {
      setIsPopoverOpen(false);
    }
  }, [searchTerm, filteredEmployeesForSearch.length, availableEmployeesForSelection.length]);


  return (
    <div className="space-y-6">
      {/* Section 1: Add Existing Employee to Pool */}
      <div>
        <h3 className="text-sm font-medium mb-2 text-muted-foreground flex items-center"><UserPlus className="mr-2 h-4 w-4" />Add Existing Employee to Pool</h3>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="search"
                placeholder="Search available employees..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                 onClick={() => {
                  if (searchTerm.length > 0 && availableEmployeesForSelection.length > 0 && filteredEmployeesForSearch.length > 0) {
                    setIsPopoverOpen(true);
                  } else if (searchTerm.length === 0 && availableEmployeesForSelection.length > 0) {
                    setIsPopoverOpen(true); // Open to show full list if search is cleared but was focused
                  }
                }}
                className="pl-8 w-full"
                aria-autocomplete="list"
                aria-expanded={isPopoverOpen}
                aria-controls="employee-prediction-list"
              />
            </div>
          </PopoverTrigger>
          <PopoverContent
            id="employee-prediction-list"
            className="w-[--radix-popover-trigger-width] p-0"
            align="start"
          >
            {(() => {
              if (!isPopoverOpen) return null; // Only render content if popover is meant to be open
              if (availableEmployeesForSelection.length === 0) {
                return <p className="p-3 text-sm text-muted-foreground">All employees are already in the raffle pool or none exist.</p>;
              }
              if (searchTerm.length > 0 && filteredEmployeesForSearch.length === 0) {
                 return <p className="p-3 text-sm text-muted-foreground">No employees match your search.</p>;
              }

              const listToDisplay = searchTerm.length > 0 ? filteredEmployeesForSearch : sortedAvailableEmployeesForDropdown;

              if (listToDisplay.length === 0 && searchTerm.length === 0) {
                 return <p className="p-3 text-sm text-muted-foreground">Type to search or use the dropdown.</p>;
              }
              
              if (listToDisplay.length === 0) { // Should be caught by earlier conditions but as a fallback
                return <p className="p-3 text-sm text-muted-foreground">No available employees.</p>;
              }

              return (
                <ScrollArea className="max-h-60">
                  <div role="listbox" className="py-1">
                    {listToDisplay.map((employee) => (
                      <div
                        key={employee.id}
                        onClick={() => handleEmployeeSelect(employee)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleEmployeeSelect(employee); }}}
                        tabIndex={0}
                        role="option"
                        aria-selected={stagedEmployeeIdForDropdown === employee.id}
                        className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none rounded-sm"
                      >
                        {employee.name}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              );
            })()}
          </PopoverContent>
        </Popover>

        <div className="flex items-center text-xs text-muted-foreground uppercase my-3">
          <div className="flex-grow border-t border-muted"></div>
          <span className="mx-2">Or</span>
          <div className="flex-grow border-t border-muted"></div>
        </div>

        <Select
          onValueChange={handleDropdownSelect}
          value={stagedEmployeeIdForDropdown} // Controlled component
          disabled={sortedAvailableEmployeesForDropdown.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an employee directly..." />
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

      {/* Section 2: Create New Employee */}
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
          <Button onClick={handleCreateAndAddEmployee} variant="outline">
            Create & Add
          </Button>
        </div>
      </div>

      {/* Section 3: Manage All Employees in System */}
      <div className="pt-2">
        <h3 className="text-sm font-medium mb-2 text-muted-foreground flex items-center"><Users className="mr-2 h-4 w-4" />All Employees in System ({allEmployees.length})</h3>
        {allEmployees.length === 0 ? (
          <p className="text-xs text-muted-foreground mt-1">
            No employees in the system yet. Add one using the form above!
          </p>
        ) : (
          <ScrollArea className="max-h-72 border rounded-md">
            <div className="p-1 space-y-1">
              {allEmployees.sort((a,b) => a.name.localeCompare(b.name)).map((employee) => (
                <Card key={employee.id} className="bg-card shadow-xs">
                  <CardContent className="p-2 flex items-center justify-between">
                    <span className="text-card-foreground text-sm">{employee.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDeletePress(employee.id, employee.name)}
                      aria-label={`Remove ${employee.name} from system`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
