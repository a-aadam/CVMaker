import type { Modifier } from '@dnd-kit/core';

// Small local versions of @dnd-kit/modifiers so we don't need another dependency.
export const restrictToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 });

export const restrictToParent: Modifier = ({ transform, containerNodeRect, draggingNodeRect }) => {
  if (!draggingNodeRect || !containerNodeRect) return transform;
  const minY = containerNodeRect.top - draggingNodeRect.top;
  const maxY = containerNodeRect.bottom - draggingNodeRect.bottom;
  return { ...transform, y: Math.min(Math.max(transform.y, minY), maxY) };
};
