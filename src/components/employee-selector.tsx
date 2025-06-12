
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setStagedEmployee(null); 

    if (term.length > 0) {
      setIsPopoverOpen(true);
    } else {
      setIsPopoverOpen(false);
    }
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setStagedEmployee(employee);
    setSearchTerm(employee.name); 
    setIsPopoverOpen(false); 
    // Consider focusing the "Add to Raffle" button or inputRef.current?.focus();
  };

  const handleAdd = () => {
    if (stagedEmployee) {
      onAddEmployee(stagedEmployee.id);
      toast({
        title: "Employee Added",
        description: `${stagedEmployee.name} has been added to the raffle.`,
      });
      setSearchTerm("");
      setStagedEmployee(null);
      setIsPopoverOpen(false);
      inputRef.current?.focus(); 
    }
  };
  
  React.useEffect(() => {
    // If popover is open but search term is cleared or no longer yields results, close it.
    if (isPopoverOpen && (searchTerm.length === 0 || (searchTerm.length > 0 && filteredEmployees.length === 0 && availableEmployees.length > 0))) {
        // If there are no available employees at all, the message "All employees are..." will show, so keep it open.
        // This condition is mainly for when typing leads to no specific matches.
        if (availableEmployees.length > 0 && filteredEmployees.length === 0) {
             // Keep popover open to show "No matches"
        } else if (searchTerm.length === 0) {
            setIsPopoverOpen(false);
        }
    }
  }, [searchTerm, filteredEmployees, isPopoverOpen, availableEmployees.length]);


  return (
    <div className="space-y-3">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search and select an employee..."
              value={searchTerm}
              onChange={handleInputChange}
              onClick={() => {
                if (searchTerm.length > 0 && availableEmployees.length > 0) {
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
            e.preventDefault(); 
          }}
        >
          {(() => {
            // This content is only shown when isPopoverOpen is true.
            // isPopoverOpen becomes true if searchTerm has text.
            if (searchTerm.length === 0) return null; // Should not happen if popover open logic is correct

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
            
            // searchTerm.length > 0, availableEmployees.length > 0, but filteredEmployees.length === 0
            return <p className="p-3 text-sm text-muted-foreground">No employees match your search.</p>;
          })()}
        </PopoverContent>
      </Popover>

      <Button 
        onClick={handleAdd} 
        disabled={!stagedEmployee || availableEmployees.length === 0} 
        className="w-full"
      >
        <UserPlus className="mr-2 h-4 w-4" /> Add to Raffle
      </Button>
    </div>
  );
}
