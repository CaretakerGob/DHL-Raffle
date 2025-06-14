
"use client";

import React, { useEffect, useState, useRef } from 'react';

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

const CONFETTI_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(0, 0%, 75%)',
  'hsl(50, 100%, 60%)',
];

export function Confetti({ count = 150, active }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPieceData[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (active) {
      const newPieces = Array.from({ length: count }).map((_, index) => ({
        id: index,
        initialX: Math.random() * 100,
        animationDelay: Math.random() * 1.5,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
      }));
      setPieces(newPieces);
    } else {
      const timer = setTimeout(() => {
        setPieces([]);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [active, count]);

  useEffect(() => {
    if (active) {
      if (!audioRef.current) {
        // Ensure Kazoo.mp3 is in the public folder
        audioRef.current = new Audio('/Kazoo.mp3');
      }
      audioRef.current.currentTime = 0; // Rewind if played before
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
        // Handle potential errors, e.g., browser restrictions on autoplay
      });
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }

    // Cleanup audio on component unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [active]);

  if (!pieces.length && !active) {
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
