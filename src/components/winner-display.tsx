
"use client";

import type { Employee } from "@/types/employee";
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface WinnerDisplayProps {
  winner: Employee | null;
  prizeName?: string;
}

export function WinnerDisplay({ winner, prizeName }: WinnerDisplayProps) {
  if (!winner) {
    return null;
  }

  return (
    <Card className="bg-card/90 backdrop-blur-md text-card-foreground shadow-xl animate-winner-reveal border border-white/20">
      <CardHeader className="text-center pt-6 pb-2">
        <CardDescription className="text-xl text-card-foreground/90 font-medium">
          The last DHL Raffle winner was...
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center pb-6">
        <div className="flex items-center justify-center my-4">
          <Trophy className="h-16 w-16 text-accent drop-shadow-lg" strokeWidth={1.5} />
        </div>
        <CardTitle className="text-5xl font-bold">
          {winner.name}
        </CardTitle>
        {prizeName && (
          <p className="text-lg mt-2 text-muted-foreground">
            They won: <span className="font-semibold text-primary">{prizeName}</span>
          </p>
        )}
        <p className="text-lg mt-2 text-card-foreground/90">Congratulations to them!</p>
      </CardContent>
    </Card>
  );
}
