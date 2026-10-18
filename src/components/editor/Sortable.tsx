import type { ReactNode } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
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
  children: ReactNode;
}

export function SortableList({ ids, onMove, children }: ListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = ({ active, over }: DragEndEvent) => {    if (over && active.id !== over.id) onMove(String(active.id), String(over.id));
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis, restrictToParent]}>
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
      className={`${className ?? ''}${isDragging ? ' is-dragging' : ''}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      {children(handle)}
    </div>
  );
}
