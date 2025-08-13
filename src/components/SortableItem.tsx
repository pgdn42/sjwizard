import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CopyPart } from "../types";

const DragHandleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M9 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M9 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M9 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M15 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M15 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M15 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
  </svg>
);

interface SortableItemProps {
  part: CopyPart;
  onPartChange: (newPart: Partial<CopyPart>) => void;
  onDelete: (partId: string) => void;
}

export function SortableItem({
  part,
  onPartChange,
  onDelete,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: part.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="settings-row">
      <button
        {...attributes}
        {...listeners}
        className="drag-handle"
        title="Drag to reorder"
      >
        <DragHandleIcon />
      </button>

      {part.type !== "static" && (
        <span className="settings-row-label">{part.label}</span>
      )}

      {part.type === "static" && (
        <input
          type="text"
          value={part.value}
          onChange={(e) => onPartChange({ value: e.target.value })}
          className="settings-row-input"
          placeholder="Enter static text..."
        />
      )}

      <div className="settings-row-controls">
        <button
          onClick={() => onDelete(part.id)}
          className="delete-button"
          title="Delete this part"
        >
          &#x2715;
        </button>
        <input
          type="checkbox"
          checked={part.enabled}
          onChange={(e) => onPartChange({ enabled: e.target.checked })}
          className="settings-row-checkbox"
          title={part.enabled ? "Disable this part" : "Enable this part"}
        />
      </div>
    </div>
  );
}
