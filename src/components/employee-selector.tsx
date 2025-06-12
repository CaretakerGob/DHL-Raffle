
"use client";

import type { Employee } from "@/types/employee";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
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
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const { toast } = useToast();

  const handleAdd = () => {
    if (selectedEmployeeId && selectedEmployeeId !== "none") {
      const employeeToAdd = filteredEmployees.find(emp => emp.id === selectedEmployeeId);
      onAddEmployee(selectedEmployeeId);
      toast({
        title: "Employee Added",
        description: `${employeeToAdd?.name} has been added to the raffle.`,
      });
      setSelectedEmployeeId(undefined); // Reset selection
      setSearchTerm(""); // Reset search term
    }
  };

  const filteredEmployees = availableEmployees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 w-full"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
          <SelectTrigger className="flex-grow" aria-label="Select an employee">
            <SelectValue placeholder={filteredEmployees.length > 0 ? "Select an employee" : "No matching employees"} />
          </SelectTrigger>
          <SelectContent>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee, index) => (
                <React.Fragment key={employee.id}>
                  <SelectItem value={employee.id}>
                    {employee.name}
                  </SelectItem>
                  {/* Add a separator after the 3rd item, if there are more items after it */}
                  {index === 2 && index < filteredEmployees.length - 1 && (
                    <SelectSeparator />
                  )}
                  {/* Add a separator after the 6th item, if there are more items after it */}
                  {index === 5 && index < filteredEmployees.length - 1 && (
                    <SelectSeparator />
                  )}
                </React.Fragment>
              ))
            ) : (
              <SelectItem value="none" disabled>
                {availableEmployees.length === 0 ? "All employees added" : "No employees match your search"}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        <Button onClick={handleAdd} disabled={!selectedEmployeeId || selectedEmployeeId === "none" || filteredEmployees.length === 0}>
          <UserPlus className="mr-2 h-4 w-4" /> Add to Raffle
        </Button>
      </div>
    </div>
  );
}
