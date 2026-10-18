import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParent } from './modifiers';
import { CSS } from '@dnd-kit/utilities';
import { GripIcon } from '../icons';

interface ListProps {
  ids: string[];
  onMove: (fromId: string, toId: string) => void;
  /** Human name for an item, used in screen reader announcements. */
  nameOf?: (id: string) => string;
  children: ReactNode;
}

export function SortableList({ ids, onMove, nameOf = (id) => id, children }: ListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) onMove(String(active.id), String(over.id));
  };
  const pos = (id: string | number) => ids.indexOf(String(id)) + 1;
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${nameOf(String(active.id))}, position ${pos(active.id)} of ${ids.length}.`,
    onDragOver: ({ active, over }) =>
      over ? `${nameOf(String(active.id))} is over position ${pos(over.id)} of ${ids.length}.` : '',
    onDragEnd: ({ active, over }) =>
      over ? `${nameOf(String(active.id))} moved to position ${pos(over.id)} of ${ids.length}.` : 'Move cancelled.',
    onDragCancel: ({ active }) => `Moving ${nameOf(String(active.id))} was cancelled.`,
  };
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParent]}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable: 'To reorder, press Space or Enter, move with the arrow keys, then press Space or Enter again to drop. Escape cancels.',
        },
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

interface ItemProps {
  id: string;
  className?: string;
  handleLabel: string;
  children: (handle: ReactNode) => ReactNode;
}

/** A sortable row. The six-dot handle is the only drag target, so inputs inside stay usable. */
export function SortableItem({ id, className, handleLabel, children }: ItemProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  // Let the card settle visibly after a drop: the refile moment.
  const [justDropped, setJustDropped] = useState(false);
  const wasDragging = useRef(false);
  useEffect(() => {
    if (wasDragging.current && !isDragging) {
      setJustDropped(true);
      const t = setTimeout(() => setJustDropped(false), 500);
      wasDragging.current = false;
      return () => clearTimeout(t);
    }
    wasDragging.current = isDragging;
  }, [isDragging]);

  const handle = (
    <button
      type="button"
      className="drag-handle"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label={handleLabel}
      title="Drag to reorder"
    >
      <GripIcon />
    </button>
  );
  return (
    <div
      ref={setNodeRef}
      className={`sortable ${className ?? ''}${isDragging ? ' is-dragging' : ''}${justDropped ? ' just-dropped' : ''}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      {children(handle)}
    </div>
  );
}
