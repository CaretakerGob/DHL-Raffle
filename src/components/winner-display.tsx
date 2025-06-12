"use client";

import type { Employee } from "@/types/employee";
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface WinnerDisplayProps {
  winner: Employee | null;
}

export function WinnerDisplay({ winner }: WinnerDisplayProps) {
  if (!winner) {
    return null;
  }

  return (
    <Card className="bg-primary text-primary-foreground shadow-xl animate-winner-reveal border-2 border-primary-foreground/20">
      <CardHeader className="text-center pt-6 pb-2">
        <CardDescription className="text-xl text-primary-foreground/90 font-medium">
          And the DHL Kudos Raffle winner is...
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center pb-6">
        <div className="flex items-center justify-center my-4">
          <Trophy className="h-16 w-16 text-primary-foreground drop-shadow-lg" strokeWidth={1.5} />
        </div>
        <CardTitle className="text-5xl font-bold">
          {winner.name}
        </CardTitle>
        <p className="text-lg mt-2 text-primary-foreground/90">Congratulations!</p>
      </CardContent>
    </Card>
  );
}
