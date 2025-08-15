import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CustomButton } from "../types";
import { iconMap } from "../assets/iconLibrary";

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

interface ButtonListItemProps {
  button: CustomButton;
  onButtonChange: (buttonId: string, newProps: Partial<CustomButton>) => void;
  onDeleteButton: (buttonId: string) => void;
  onEditIcon: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function ButtonListItem({
  button,
  onButtonChange,
  onDeleteButton,
  onEditIcon,
}: ButtonListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: button.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="settings-row manage-button-row"
    >
      <button
        {...attributes}
        {...listeners}
        className="drag-handle"
        title="Drag to reorder"
      >
        <DragHandleIcon />
      </button>
      <input
        type="text"
        value={button.label}
        onChange={(e) => onButtonChange(button.id, { label: e.target.value })}
        className="settings-row-input"
        placeholder="Button Label"
      />
      <select
        value={button.type}
        onChange={(e) =>
          onButtonChange(button.id, { type: e.target.value as "copy" | "link" })
        }
      >
        <option value="copy">Copy</option>
        <option value="link">Link</option>
      </select>
      <div className="button-config-group">
        <select
          value={button.displayType}
          onChange={(e) =>
            onButtonChange(button.id, {
              displayType: e.target.value as "icon" | "text",
            })
          }
        >
          <option value="icon">Icon</option>
          <option value="text">Text</option>
        </select>
        {button.displayType === "icon" && (
          <button className="button-icon-preview" onClick={onEditIcon}>
            {React.createElement(iconMap[button.icon] || iconMap.CopyIcon)}
          </button>
        )}
      </div>
      <button
        onClick={() => onDeleteButton(button.id)}
        className="delete-button"
        title="Delete Button"
      >
        &#x2715;
      </button>
    </div>
  );
}
