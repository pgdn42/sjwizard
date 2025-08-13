import { useState, useMemo } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { SortableItem } from "./SortableItem";
import type { CopyConfig, CopyPart } from "../types";

// --- Data ---
const moduleNames: { [key: string]: string } = {
  ersattning: "Ersättning vid försening",
};

const placeholderData: { [key: string]: any } = {
  caseNumber: "1-23456789",
  decision: "100%",
  trainNumber: "42",
  departureDate: "2025-08-13",
};

const allModuleParts: { [key: string]: CopyPart } = {
  caseNumber: {
    id: "caseNumber",
    label: "Ärendenummer",
    type: "field",
    enabled: true,
  },
  decision: { id: "decision", label: "Beslut", type: "field", enabled: true },
  trainNumber: {
    id: "trainNumber",
    label: "Tågnummer",
    type: "field",
    enabled: true,
  },
  departureDate: {
    id: "departureDate",
    label: "Avgångsdatum",
    type: "field",
    enabled: true,
  },
  datetime: {
    id: "datetime",
    label: "Current Date/Time",
    type: "datetime",
    enabled: true,
  },
};
// --- End Data ---

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  copyConfig: CopyConfig;
  onSave: (newConfig: CopyConfig) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  copyConfig,
  onSave,
}: SettingsModalProps) {
  const [internalConfig, setInternalConfig] = useState<CopyConfig>(copyConfig);
  const [selectedModule, setSelectedModule] =
    useState<keyof CopyConfig>("ersattning");
  const [partToAdd, setPartToAdd] = useState<string>("static");

  const currentModuleConfig = useMemo(
    () => internalConfig[selectedModule] || [],
    [internalConfig, selectedModule]
  );
  const itemIds = useMemo(
    () => currentModuleConfig.map((item) => item.id),
    [currentModuleConfig]
  );

  const availablePartsToAdd = useMemo(() => {
    const currentPartIds = new Set(currentModuleConfig.map((p) => p.id));
    return Object.values(allModuleParts).filter(
      (p) => !currentPartIds.has(p.id)
    );
  }, [currentModuleConfig]);

  const previewText = useMemo(() => {
    const now = new Date();
    const formattedDateTime = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")} ${now
      .getHours()
      .toString()
      .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    return currentModuleConfig
      .filter((part) => part.enabled)
      .map((part) => {
        switch (part.type) {
          case "field":
            return placeholderData[part.id] || `[${part.label}]`;
          case "static":
            return part.value || "";
          case "datetime":
            return formattedDateTime;
          default:
            return "";
        }
      })
      .join("");
  }, [currentModuleConfig]);

  if (!isOpen) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = itemIds.indexOf(active.id as string);
      const newIndex = itemIds.indexOf(over.id as string);
      const newOrderedConfig = arrayMove(
        currentModuleConfig,
        oldIndex,
        newIndex
      );
      setInternalConfig((prev) => ({
        ...prev,
        [selectedModule]: newOrderedConfig,
      }));
    }
  };

  const handlePartChange = (partId: string, newPart: Partial<CopyPart>) => {
    const newModuleConfig = currentModuleConfig.map((p) =>
      p.id === partId ? { ...p, ...newPart } : p
    );
    setInternalConfig({
      ...internalConfig,
      [selectedModule]: newModuleConfig,
    });
  };

  const handleAddPart = () => {
    if (!partToAdd) return;
    let newPart: CopyPart | undefined;

    if (partToAdd === "static") {
      newPart = {
        id: `static-${Date.now()}`,
        label: "Static Text",
        type: "static",
        value: " ",
        enabled: true,
      };
    } else {
      const partTemplate = allModuleParts[partToAdd];
      if (partTemplate) {
        newPart = { ...partTemplate };
      }
    }

    if (newPart) {
      setInternalConfig((prev) => ({
        ...prev,
        [selectedModule]: [...(prev[selectedModule] || []), newPart],
      }));
    }
  };

  const handleDeletePart = (partId: string) => {
    setInternalConfig((prev) => ({
      ...prev,
      [selectedModule]: (prev[selectedModule] || []).filter(
        (p) => p.id !== partId
      ),
    }));
  };

  const handleSave = () => {
    onSave(internalConfig);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Settings</h2>

        <div className="settings-section">
          <h4>Configure Copy Templates</h4>
          <select
            value={selectedModule}
            onChange={(e) =>
              setSelectedModule(e.target.value as keyof CopyConfig)
            }
          >
            {Object.keys(moduleNames).map((key) => (
              <option key={key} value={key}>
                {moduleNames[key]}
              </option>
            ))}
          </select>

          <div className="settings-preview">
            <label>Live Preview</label>
            <textarea value={previewText} readOnly rows={2}></textarea>
          </div>
        </div>

        <div className="settings-rows-container">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={itemIds}
              strategy={verticalListSortingStrategy}
            >
              {currentModuleConfig.map((part) => (
                <SortableItem
                  key={part.id}
                  part={part}
                  onPartChange={(changedPart) =>
                    handlePartChange(part.id, changedPart)
                  }
                  onDelete={handleDeletePart}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div className="add-part-controls">
          <select
            value={partToAdd}
            onChange={(e) => setPartToAdd(e.target.value)}
          >
            <option value="static">Static Text</option>
            {availablePartsToAdd.map((part) => (
              <option key={part.id} value={part.id}>
                {part.label}
              </option>
            ))}
          </select>
          <button onClick={handleAddPart}>Add</button>
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave}>Save & Close</button>
        </div>
      </div>
    </div>
  );
}
