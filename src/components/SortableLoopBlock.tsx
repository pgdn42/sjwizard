import { useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import type { CopyPart, FormData } from "../types";
import { allModuleParts } from "../data/templateFields";

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

interface SortableLoopBlockProps {
  part: CopyPart;
  onUpdate: (updatedPart: CopyPart) => void;
  onDelete: () => void;
  allFieldsAsOptions: { value: string; label: string }[];
  subCaseFieldsAsOptions: { value: string; label: string }[]; // The missing prop
}

export function SortableLoopBlock({
  part,
  onUpdate,
  onDelete,
  allFieldsAsOptions,
  subCaseFieldsAsOptions,
}: SortableLoopBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: part.id });
  const [partToAdd, setPartToAdd] = useState("static");

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const innerTemplate = part.loopTemplate || [];

  const handleInnerPartChange = (
    partId: string,
    newProps: Partial<CopyPart>
  ) => {
    const newLoopTemplate = innerTemplate.map((p) =>
      p.id === partId ? { ...p, ...newProps } : p
    );
    onUpdate({ ...part, loopTemplate: newLoopTemplate });
  };

  const handleInnerDeletePart = (partId: string) => {
    const newLoopTemplate = innerTemplate.filter((p) => p.id !== partId);
    onUpdate({ ...part, loopTemplate: newLoopTemplate });
  };

  const handleInnerDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = innerTemplate.findIndex((p) => p.id === active.id);
      const newIndex = innerTemplate.findIndex((p) => p.id === over.id);
      const newOrderedTemplate = arrayMove(innerTemplate, oldIndex, newIndex);
      onUpdate({ ...part, loopTemplate: newOrderedTemplate });
    }
  };

  const handleAddInnerPart = () => {
    if (!partToAdd) return;
    let newPart: CopyPart | undefined;

    if (partToAdd === "static") {
      newPart = {
        id: `static-${Date.now()}`,
        label: "Static Text",
        type: "static",
        value: "",
        enabled: true,
      };
    } else if (partToAdd === "linebreak") {
      newPart = {
        id: `linebreak-${Date.now()}`,
        label: "Line Break",
        type: "linebreak",
        lineBreakCount: 1,
        enabled: true,
      };
    } else {
      const [moduleId, fieldId] = partToAdd.split(".");
      const isSubCaseField = subCaseFieldsAsOptions.some(
        (f) => f.value === partToAdd
      );
      const partTemplate =
        allModuleParts[moduleId as keyof typeof allModuleParts]?.[fieldId];
      if (partTemplate) {
        newPart = {
          ...partTemplate,
          id: `${partToAdd}-${Date.now()}`,
          fieldId: fieldId,
          moduleId: moduleId as keyof FormData,
          // This is the key: set context based on which list the field came from
          context: isSubCaseField ? "item" : "root",
        };
      }
    }

    if (newPart) {
      onUpdate({ ...part, loopTemplate: [...innerTemplate, newPart] });
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="settings-loop-block">
      <div className="settings-row loop-block-header">
        <button {...attributes} {...listeners} className="drag-handle">
          <DragHandleIcon />
        </button>
        <span className="settings-row-label">{part.label}</span>
        <div className="settings-row-controls">
          <button
            onClick={onDelete}
            className="delete-button"
            title="Delete Block"
          >
            &#x2715;
          </button>
          <input
            type="checkbox"
            checked={part.enabled}
            onChange={(e) => onUpdate({ ...part, enabled: e.target.checked })}
            className="settings-row-checkbox"
          />
        </div>
      </div>

      <div className="loop-block-content">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleInnerDragEnd}
        >
          <SortableContext
            items={innerTemplate.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            {innerTemplate.map((innerPart) => (
              <SortableItem
                key={innerPart.id}
                part={innerPart}
                onPartChange={(changedProps) =>
                  handleInnerPartChange(innerPart.id, changedProps)
                }
                onDelete={() => handleInnerDeletePart(innerPart.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="add-part-controls loop-block-footer">
        <select
          value={partToAdd}
          onChange={(e) => setPartToAdd(e.target.value)}
        >
          <optgroup label="General">
            <option value="static">Static Text</option>
            <option value="linebreak">Line Break</option>
          </optgroup>
          <optgroup label="Main Case Fields">
            {allFieldsAsOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="Sub-Case Fields">
            {subCaseFieldsAsOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </optgroup>
        </select>
        <button onClick={handleAddInnerPart}>Add Part to Loop</button>
      </div>
    </div>
  );
}
