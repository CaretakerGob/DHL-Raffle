"use client";

import type { Employee } from "@/types/employee";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface RafflePoolProps {
  pooledEmployees: Employee[];
  onRemoveEmployee: (employeeId: string) => void;
}

export function RafflePool({ pooledEmployees, onRemoveEmployee }: RafflePoolProps) {
  if (pooledEmployees.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">
        No employees in the raffle pool yet.
      </p>
    );
  }

  return (
    <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
      {pooledEmployees.map((employee) => (
        <Card key={employee.id} className="bg-secondary shadow-sm">
          <CardContent className="p-3 flex items-center justify-between">
            <span className="text-secondary-foreground">{employee.name}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveEmployee(employee.id)}
              aria-label={`Remove ${employee.name} from raffle`}
            >
              <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
