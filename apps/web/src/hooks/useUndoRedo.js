import { useState, useCallback, useRef } from 'react';

const MAX_HISTORY = 50;

export function useUndoRedo(initialState) {
  const [history, setHistory] = useState([initialState]);
  const [index, setIndex] = useState(0);
  const skipNextPush = useRef(false);

  const current = history[index];

  const pushState = useCallback((newState) => {
    if (skipNextPush.current) {
      skipNextPush.current = false;
      return;
    }
    setHistory(prev => {
      const truncated = prev.slice(0, index + 1);
      const next = [...truncated, newState];
      if (next.length > MAX_HISTORY) next.shift();
      return next;
    });
    setIndex(prev => {
      const newIdx = Math.min(prev + 1, MAX_HISTORY - 1);
      return newIdx;
    });
  }, [index]);

  const undo = useCallback(() => {
    if (index > 0) {
      skipNextPush.current = true;
      setIndex(prev => prev - 1);
      return history[index - 1];
    }
    return null;
  }, [index, history]);

  const redo = useCallback(() => {
    if (index < history.length - 1) {
      skipNextPush.current = true;
      setIndex(prev => prev + 1);
      return history[index + 1];
    }
    return null;
  }, [index, history]);

  const canUndo = index > 0;
  const canRedo = index < history.length - 1;

  return { current, pushState, undo, redo, canUndo, canRedo };
}
