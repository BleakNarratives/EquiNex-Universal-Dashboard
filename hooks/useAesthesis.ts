// Fix: Add missing React import for using React.PointerEvent type
import React, { useState, useRef, useCallback } from 'react';

interface AesthesisOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onActivate?: () => void; // A unified click/tap event
  swipeThreshold?: number;
}

interface AesthesisResult {
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerLeave: (e: React.PointerEvent) => void;
  };
  isPressed: boolean;
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null;
}

export const useAesthesis = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onActivate,
  swipeThreshold = 50, // Minimum pixels moved to be considered a swipe
}: AesthesisOptions): AesthesisResult => {
  const [isPressed, setIsPressed] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);

  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const isSwipeHandledRef = useRef<boolean>(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Only track left-clicks or touch events
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsPressed(true);
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    isSwipeHandledRef.current = false;
    setSwipeDirection(null);
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    setIsPressed(false);
    
    // If a swipe was not detected, and an onActivate handler exists, fire it.
    // This serves as our unified 'click' or 'tap'.
    if (!isSwipeHandledRef.current && onActivate) {
      onActivate();
    }
    
    pointerStartRef.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, [onActivate]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPressed || !pointerStartRef.current || isSwipeHandledRef.current) {
      return;
    }

    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;

    if (Math.abs(dx) > swipeThreshold || Math.abs(dy) > swipeThreshold) {
      isSwipeHandledRef.current = true; // Ensure swipe is only handled once per interaction
      
      if (Math.abs(dx) > Math.abs(dy)) { // Horizontal swipe
        if (dx > 0) {
          setSwipeDirection('right');
          onSwipeRight?.();
        } else {
          setSwipeDirection('left');
          onSwipeLeft?.();
        }
      } else { // Vertical swipe
        if (dy > 0) {
          setSwipeDirection('down');
          onSwipeDown?.();
        } else {
          setSwipeDirection('up');
          onSwipeUp?.();
        }
      }
    }
  }, [isPressed, swipeThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  const onPointerLeave = useCallback((e: React.PointerEvent) => {
    // If the pointer leaves the element (e.g., mouse drag), cancel the press state.
    if (isPressed) {
      setIsPressed(false);
      pointerStartRef.current = null;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  }, [isPressed]);

  return {
    handlers: {
      onPointerDown,
      onPointerUp,
      onPointerMove,
      onPointerLeave,
    },
    isPressed,
    swipeDirection,
  };
};
