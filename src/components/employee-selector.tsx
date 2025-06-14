
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
import { UserPlus, Search, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmployeeSelectorProps {
  allEmployees: Employee[];
  setAllEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  availableEmployeesForSelection: Employee[];
  onAddEmployeeToPool: (employeeId: string) => void;
}

export function EmployeeSelector({
  allEmployees,
  setAllEmployees,
  availableEmployeesForSelection,
  onAddEmployeeToPool
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
    if (term.length > 0 && filteredEmployeesForSearch.length > 0) {
      setIsPopoverOpen(true);
    } else {
      setIsPopoverOpen(false);
    }
  };

  const handleEmployeeSelectFromSearch = (employee: Employee) => {
    onAddEmployeeToPool(employee.id);
    // Toast is handled in RafflePage
    setSearchTerm("");
    setIsPopoverOpen(false);
    inputRef.current?.focus();
  };

  const handleDropdownSelect = (employeeId: string) => {
    if (!employeeId) {
      setStagedEmployeeIdForDropdown("");
      return;
    }
    const employee = availableEmployeesForSelection.find(emp => emp.id === employeeId);
    if (employee) {
      onAddEmployeeToPool(employee.id);
      // Toast is handled in RafflePage
      setStagedEmployeeIdForDropdown(""); // Reset select to placeholder
      inputRef.current?.focus(); // Optionally focus back on search or another field
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

    setAllEmployees((prevAllEmployees) => [...prevAllEmployees, newEmployee]);
    toast({
      title: "Employee Created",
      description: `${newEmployee.name} has been added to the system and is available for the raffle.`,
    });
    setNewEmployeeNameInput(""); // Clear input
  };
  
  React.useEffect(() => {
    if (searchTerm.length > 0 && filteredEmployeesForSearch.length > 0 && !isPopoverOpen) {
      setIsPopoverOpen(true);
    } else if ((searchTerm.length === 0 || filteredEmployeesForSearch.length === 0) && isPopoverOpen) {
       if (searchTerm.length > 0 && filteredEmployeesForSearch.length === 0 && availableEmployeesForSelection.length > 0) {
        // Keep popover open to show "No matches" if user is typing
      } else {
        setIsPopoverOpen(false);
      }
    }
  }, [searchTerm, filteredEmployeesForSearch, availableEmployeesForSelection.length, isPopoverOpen]);


  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-1 text-muted-foreground">Add Existing Employee to Pool</h3>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="search"
                placeholder="Search or select an employee..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                onClick={() => {
                  if (searchTerm.length > 0 && availableEmployeesForSelection.length > 0 && filteredEmployeesForSearch.length > 0) {
                    setIsPopoverOpen(true);
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
            onOpenAutoFocus={(e) => {
              // e.preventDefault(); // Keep focus on input
            }}
          >
            {(() => {
              if (searchTerm.length === 0) return null; 
              if (availableEmployeesForSelection.length === 0) {
                return <p className="p-3 text-sm text-muted-foreground">All employees are already in the raffle pool.</p>;
              }
              if (filteredEmployeesForSearch.length > 0) {
                return (
                  <div role="listbox" className="max-h-60 overflow-y-auto py-1">
                    {filteredEmployeesForSearch.map((employee) => (
                      <div
                        key={employee.id}
                        onClick={() => handleEmployeeSelectFromSearch(employee)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleEmployeeSelectFromSearch(employee); }}}
                        tabIndex={0}
                        role="option"
                        aria-selected={stagedEmployeeIdForDropdown === employee.id}
                        className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none rounded-sm"
                      >
                        {employee.name}
                      </div>
                    ))}
                  </div>
                );
              }
              return <p className="p-3 text-sm text-muted-foreground">No employees match your search.</p>;
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
          value={stagedEmployeeIdForDropdown}
          disabled={sortedAvailableEmployeesForDropdown.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an employee directly..." />
          </SelectTrigger>
          <SelectContent>
            {sortedAvailableEmployeesForDropdown.length === 0 && !searchTerm ? (
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
        <h3 className="text-sm font-medium mb-1 text-muted-foreground">Create New Employee</h3>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Enter new employee's name"
            value={newEmployeeNameInput}
            onChange={(e) => setNewEmployeeNameInput(e.target.value)}
            className="flex-grow"
          />
          <Button onClick={handleCreateAndAddEmployee} variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New
          </Button>
        </div>
         {allEmployees.length === 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            No employees in the system yet. Add one to get started!
          </p>
        )}
      </div>
    </div>
  );
}
