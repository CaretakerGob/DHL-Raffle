
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
  const congratulationsAudioRef = useRef<HTMLAudioElement | null>(null);
  const kazooAudioRef = useRef<HTMLAudioElement | null>(null);
  const kazooTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Effect for visual confetti pieces
  useEffect(() => {
    if (active) {
      const newPieces = Array.from({ length: count }).map((_, index) => ({
        id: index,
        initialX: Math.random() * 100,
        animationDelay: Math.random() * 1.5, // Staggered start
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
      }));
      setPieces(newPieces);
    } else {
      // When inactive, clear pieces after a delay to allow animation to finish
      const timer = setTimeout(() => {
        setPieces([]);
      }, 3500); // confetti-fall animation is 3s, give some buffer
      return () => clearTimeout(timer);
    }
  }, [active, count]);

  // Effect for audio playback
  useEffect(() => {
    // Define the handler for when Congratulations.mp3 ends
    const handleCongratulationsEnded = () => {
      if (kazooTimeoutRef.current) {
        clearTimeout(kazooTimeoutRef.current);
      }
      kazooTimeoutRef.current = setTimeout(() => {
        if (!kazooAudioRef.current) {
          kazooAudioRef.current = new Audio('/Kazoo.mp3');
        }
        kazooAudioRef.current.currentTime = 0;
        kazooAudioRef.current.play().catch(error => console.error("Error playing Kazoo.mp3:", error));
      }, 1000); // 1-second delay
    };

    if (active) {
      // Initialize Congratulations audio if needed
      if (!congratulationsAudioRef.current) {
        congratulationsAudioRef.current = new Audio('/Congratulations.mp3');
      }
      const currentCongratsPlayer = congratulationsAudioRef.current;

      // Stop Kazoo and clear its timeout if it was somehow active
      if (kazooAudioRef.current) {
        kazooAudioRef.current.pause();
        kazooAudioRef.current.currentTime = 0;
      }
      if (kazooTimeoutRef.current) {
        clearTimeout(kazooTimeoutRef.current);
        kazooTimeoutRef.current = null;
      }

      // Setup and play Congratulations
      currentCongratsPlayer.currentTime = 0; // Rewind
      // Remove listener before adding to prevent duplicates if effect re-runs unexpectedly
      currentCongratsPlayer.removeEventListener('ended', handleCongratulationsEnded);
      currentCongratsPlayer.addEventListener('ended', handleCongratulationsEnded);
      currentCongratsPlayer.play().catch(error => console.error("Error playing Congratulations.mp3:", error));

    } else {
      // If confetti is not active, stop and reset everything
      if (congratulationsAudioRef.current) {
        congratulationsAudioRef.current.pause();
        congratulationsAudioRef.current.currentTime = 0;
        congratulationsAudioRef.current.removeEventListener('ended', handleCongratulationsEnded);
      }
      if (kazooAudioRef.current) {
        kazooAudioRef.current.pause();
        kazooAudioRef.current.currentTime = 0;
      }
      if (kazooTimeoutRef.current) {
        clearTimeout(kazooTimeoutRef.current);
        kazooTimeoutRef.current = null;
      }
    }

    // Cleanup function for when the component unmounts or 'active' changes
    return () => {
      if (congratulationsAudioRef.current) {
        congratulationsAudioRef.current.pause();
        congratulationsAudioRef.current.currentTime = 0;
        congratulationsAudioRef.current.removeEventListener('ended', handleCongratulationsEnded);
      }
      if (kazooAudioRef.current) {
        kazooAudioRef.current.pause();
        kazooAudioRef.current.currentTime = 0;
      }
      if (kazooTimeoutRef.current) {
        clearTimeout(kazooTimeoutRef.current);
      }
    };
  }, [active]); // Only re-run when 'active' changes

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
