
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
import { UserPlus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmployeeSelectorProps {
  availableEmployees: Employee[];
  onAddEmployee: (employeeId: string) => void;
}

export function EmployeeSelector({ availableEmployees, onAddEmployee }: EmployeeSelectorProps) {
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [stagedEmployee, setStagedEmployee] = React.useState<Employee | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const filteredEmployees = availableEmployees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedAvailableEmployees = React.useMemo(() => {
    return [...availableEmployees].sort((a, b) => a.name.localeCompare(b.name));
  }, [availableEmployees]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term === "") {
      setStagedEmployee(null); // Clear staged employee if search term is empty
    } else {
      // If there was a staged employee and the search term changes to not match it, clear it
      if (stagedEmployee && !stagedEmployee.name.toLowerCase().startsWith(term.toLowerCase())) {
        setStagedEmployee(null);
      }
    }

    if (term.length > 0 && filteredEmployees.length > 0) {
      setIsPopoverOpen(true);
    } else {
      setIsPopoverOpen(false);
    }
  };

  const handleEmployeeSelect = (employee: Employee) => {
    onAddEmployee(employee.id);
    toast({
      title: "Employee Added",
      description: `${employee.name} has been added to the raffle.`,
    });
    setSearchTerm("");
    setStagedEmployee(null); 
    setIsPopoverOpen(false); 
    inputRef.current?.focus(); 
  };

  const handleDropdownSelect = (employeeId: string) => {
    if (!employeeId) {
      setStagedEmployee(null);
      setSearchTerm(""); 
      return;
    }
    const employee = availableEmployees.find(emp => emp.id === employeeId);
    if (employee) {
      onAddEmployee(employee.id);
      toast({
        title: "Employee Added",
        description: `${employee.name} has been added to the raffle.`,
      });
      setSearchTerm("");
      setStagedEmployee(null); // This will reset the Select to its placeholder
      inputRef.current?.focus();
    }
  };
  
  React.useEffect(() => {
    if (searchTerm.length > 0 && filteredEmployees.length > 0 && !isPopoverOpen) {
      setIsPopoverOpen(true);
    } else if ((searchTerm.length === 0 || filteredEmployees.length === 0) && isPopoverOpen) {
      if (searchTerm.length > 0 && filteredEmployees.length === 0 && availableEmployees.length > 0) {
        // Keep popover open to show "No matches" if user is typing
      } else {
        setIsPopoverOpen(false);
      }
    }
  }, [searchTerm, filteredEmployees, availableEmployees.length, isPopoverOpen]);


  return (
    <div className="space-y-4">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search or select an employee..."
              value={searchTerm}
              onChange={handleInputChange}
              onClick={() => {
                if (searchTerm.length > 0 && availableEmployees.length > 0 && filteredEmployees.length > 0) {
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
            // Do not show popover content if search term is empty. Effect handles closing.
            if (searchTerm.length === 0) return null; 

            if (availableEmployees.length === 0) {
              return <p className="p-3 text-sm text-muted-foreground">All employees are already in the raffle pool.</p>;
            }
            if (filteredEmployees.length > 0) {
              return (
                <div role="listbox" className="max-h-60 overflow-y-auto py-1">
                  {filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      onClick={() => handleEmployeeSelect(employee)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleEmployeeSelect(employee); }}}
                      tabIndex={0}
                      role="option"
                      aria-selected={stagedEmployee?.id === employee.id}
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

      <div className="flex items-center text-xs text-muted-foreground uppercase">
        <div className="flex-grow border-t border-muted"></div>
        <span className="mx-2">Or</span>
        <div className="flex-grow border-t border-muted"></div>
      </div>

      <Select
        onValueChange={handleDropdownSelect}
        value={stagedEmployee?.id ?? ""} // Value is now controlled by stagedEmployee, which gets nulled after adding
        disabled={sortedAvailableEmployees.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an employee directly..." />
        </SelectTrigger>
        <SelectContent>
          {sortedAvailableEmployees.length === 0 && !searchTerm ? (
             <SelectItem value="no-employees" disabled>All employees are in the pool.</SelectItem>
          ) : (
            sortedAvailableEmployees.map(employee => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
