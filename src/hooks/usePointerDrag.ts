// src/hooks/usePointerDrag.ts

import { createContext } from "preact";
import {
  useState,
  useCallback,
  useRef,
  useContext,
  useEffect,
} from "preact/hooks";
import type { Item, DragSource, PointerEvent } from "../types/game";

export interface DragTarget {
  shelfId: string;
  slotIndex: number;
  cellIndex: number;
}

interface UsePointerDragOptions {
  onDragStart?: (source: DragSource) => void;
  onDrop?: (
    source: DragSource,
    targetShelfId: string,
    targetSlotIndex: number,
    targetCellIndex: number,
  ) => void;
  onDragEnd?: () => void;
}

export interface DragController {
  draggedItem: Item | null;
  draggedFrom: DragSource | null;
  isDragging: boolean;
  dragOverTarget: DragTarget | null;
  ghostPosition: { x: number; y: number } | null;
  startDrag: (e: PointerEvent, source: DragSource) => void;
}

export const DragContext = createContext<DragController | null>(null);

export const useDragController = (): DragController => {
  const controller = useContext(DragContext);
  if (!controller) {
    throw new Error(
      "useDragController must be used inside a DragContext.Provider",
    );
  }
  return controller;
};

/** Find the cell under a viewport coordinate. */
const getTargetFromPoint = (x: number, y: number): DragTarget | null => {
  const element = document.elementFromPoint(x, y);
  const cell = element?.closest("[data-cell-id]");
  if (!cell) return null;

  const shelfId = cell.getAttribute("data-shelf-id");
  const slotIndex = Number(cell.getAttribute("data-slot-index"));
  const cellIndex = Number(cell.getAttribute("data-cell-index"));

  if (!shelfId || Number.isNaN(slotIndex) || Number.isNaN(cellIndex))
    return null;
  return { shelfId, slotIndex, cellIndex };
};

const isSameCell = (source: DragSource, target: DragTarget): boolean =>
  source.shelfId === target.shelfId &&
  source.slotIndex === target.slotIndex &&
  source.cellIndex === target.cellIndex;

/**
 * Pointer-events based drag & drop.
 *
 * Create exactly one instance (in GameBoard) and share it through
 * DragContext. Everything else calls `useDragController()`.
 */
export const usePointerDrag = (
  options: UsePointerDragOptions = {},
): DragController => {
  const [draggedItem, setDraggedItem] = useState<Item | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<DragSource | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<DragTarget | null>(null);
  const [ghostPosition, setGhostPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const activeRef = useRef(false);
  const sourceRef = useRef<DragSource | null>(null);

  // Keep references to the installed listeners so they can be removed
  // reliably even if the component re-renders mid-drag.
  const moveHandlerRef = useRef<((e: PointerEvent) => void) | null>(null);
  const upHandlerRef = useRef<((e: PointerEvent) => void) | null>(null);
  const cancelHandlerRef = useRef<((e: PointerEvent) => void) | null>(null);
  const blurHandlerRef = useRef<(() => void) | null>(null);

  const removeListeners = useCallback(() => {
    if (moveHandlerRef.current) {
      document.removeEventListener("pointermove", moveHandlerRef.current);
      moveHandlerRef.current = null;
    }
    if (upHandlerRef.current) {
      document.removeEventListener("pointerup", upHandlerRef.current);
      upHandlerRef.current = null;
    }
    if (cancelHandlerRef.current) {
      document.removeEventListener("pointercancel", cancelHandlerRef.current);
      cancelHandlerRef.current = null;
    }
    if (blurHandlerRef.current) {
      window.removeEventListener("blur", blurHandlerRef.current);
      blurHandlerRef.current = null;
    }
  }, []);

  const resetDragState = useCallback(() => {
    activeRef.current = false;
    sourceRef.current = null;
    setDraggedItem(null);
    setDraggedFrom(null);
    setDragOverTarget(null);
    setGhostPosition(null);
    document.body.style.userSelect = "";
    document.body.style.touchAction = "";
  }, []);

  const finishDrag = useCallback(
    (e: PointerEvent | null) => {
      removeListeners();

      const source = sourceRef.current;
      if (e && source) {
        const target = getTargetFromPoint(e.clientX, e.clientY);
        if (target && !isSameCell(source, target)) {
          optionsRef.current.onDrop?.(
            source,
            target.shelfId,
            target.slotIndex,
            target.cellIndex,
          );
          resetDragState();
          return;
        }
      }

      optionsRef.current.onDragEnd?.();
      resetDragState();
    },
    [removeListeners, resetDragState],
  );

  const startDrag = useCallback(
    (e: PointerEvent, source: DragSource) => {
      // Left mouse button only; touch/pen pointers report button === 0 too.
      if (e.pointerType === "mouse" && e.button !== 0) return;

      // Avoid native image drag / text selection / scrolling.
      e.preventDefault();

      activeRef.current = true;
      sourceRef.current = source;

      setDraggedItem(source.item);
      setDraggedFrom(source);
      setDragOverTarget(null);
      setGhostPosition({ x: e.clientX, y: e.clientY });

      document.body.style.userSelect = "none";
      document.body.style.touchAction = "none";

      const handleMove = (ev: PointerEvent) => {
        if (!activeRef.current) return;
        setGhostPosition({ x: ev.clientX, y: ev.clientY });
        setDragOverTarget(getTargetFromPoint(ev.clientX, ev.clientY));
      };

      const handleUp = (ev: PointerEvent) => {
        finishDrag(ev);
      };

      const handleCancel = () => {
        finishDrag(null);
      };

      moveHandlerRef.current = handleMove;
      upHandlerRef.current = handleUp;
      cancelHandlerRef.current = handleCancel;
      blurHandlerRef.current = handleCancel;

      document.addEventListener("pointermove", handleMove);
      document.addEventListener("pointerup", handleUp);
      document.addEventListener("pointercancel", handleCancel);
      window.addEventListener("blur", handleCancel);

      optionsRef.current.onDragStart?.(source);
    },
    [finishDrag],
  );

  useEffect(() => removeListeners, [removeListeners]);

  return {
    draggedItem,
    draggedFrom,
    isDragging: draggedItem !== null,
    dragOverTarget,
    ghostPosition,
    startDrag,
  };
};
