
"use client";

import React, { useEffect, useState } from 'react';

interface ConfettiPieceData {
  id: number;
  initialX: number;
  animationDelay: number;
  color: string;
  rotation: number;
}

const ConfettiPiece: React.FC<ConfettiPieceData> = ({ initialX, animationDelay, color, rotation }) => {
  const style: React.CSSProperties = {
    left: `${initialX}%`,
    backgroundColor: color,
    animationDelay: `${animationDelay}s`,
    transform: `rotate(${rotation}deg)`,
  };
  return <div className="confetti-piece" style={style} />;
};

interface ConfettiProps {
  count?: number;
  active: boolean;
}

// Using theme colors and some standard festive colors
const CONFETTI_COLORS = [
  'hsl(var(--primary))',   // DHL Yellow
  'hsl(var(--accent))',    // DHL Red
  'hsl(0, 0%, 75%)',       // Silver-like
  'hsl(50, 100%, 60%)',    // Gold-like
];

export function Confetti({ count = 150, active }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPieceData[]>([]);

  useEffect(() => {
    if (active) {
      const newPieces = Array.from({ length: count }).map((_, index) => ({
        id: index,
        initialX: Math.random() * 100,
        animationDelay: Math.random() * 1.5, // Stagger start times up to 1.5s
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
      }));
      setPieces(newPieces);
    } else {
      // Clear pieces when not active to allow re-triggering
      // A small delay ensures fade-out animation completes before removal
      const timer = setTimeout(() => {
        setPieces([]);
      }, 3500); // Should be slightly longer than animation duration
      return () => clearTimeout(timer);
    }
  }, [active, count]);

  if (!pieces.length && !active) { // Only render if there are pieces OR it's just been activated (pieces will be generated)
    return null;
  }


  return (
    <div className="confetti-container" aria-hidden="true">
      {pieces.map((piece) => (
        <ConfettiPiece
          key={piece.id}
          id={piece.id}
          initialX={piece.initialX}
          animationDelay={piece.animationDelay}
          color={piece.color}
          rotation={piece.rotation}
        />
      ))}
    </div>
  );
}
