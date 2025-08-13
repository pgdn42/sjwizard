import { useState, useMemo, useEffect } from "react";
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
  merkostnader: "Merkostnader",
  ticket: "Biljett",
  notes: "Noteringar",
};

const templateNamesByModule: { [key: string]: { [key: string]: string } } = {
  ersattning: {
    default: "Default",
  },
  merkostnader: {
    approved: "Approved Claim",
    denied: "Denied Claim",
    caseNote: "Case Note",
  },
  ticket: {
    default: "Default",
  },
  notes: {
    trafikstorning: "Trafikstörning",
    byteAvAvgang: "Byte av avgång",
    undantagsaterkop: "Undantagsåterköp",
  },
};

const placeholderData: { [key: string]: any } = {
  ersattning: {
    caseNumber: "1-23456789",
    decision: "50%",
    trainNumber: "42",
    departureDate: "2025-08-13",
    departureStation: "Stockholm C",
    arrivalStation: "Göteborg C",
    delay: "65",
    producer: "SJ",
  },
  merkostnader: {
    caseNumber: "1-98765432",
    category: "Mat",
    decision: "Godkänd",
    compensation: "150",
  },
  ticket: {
    bookingNumber: "ABC1234",
    cardNumber: "1234",
    cost: "599",
  },
  notes: {
    bookingNumber: "XYZ987",
    newBookingNumber: "NEW567",
    extraNote: "Extra info",
    notesContent: "This is a note.",
  },
};

const allModuleParts: { [key: string]: { [id: string]: CopyPart } } = {
  ersattning: {
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
    departureStation: {
      id: "departureStation",
      label: "Avgångsstation",
      type: "field",
      enabled: true,
    },
    arrivalStation: {
      id: "arrivalStation",
      label: "Ankomststation",
      type: "field",
      enabled: true,
    },
    delay: { id: "delay", label: "Försening", type: "field", enabled: true },
    producer: {
      id: "producer",
      label: "Producent",
      type: "field",
      enabled: true,
    },
    datetime: {
      id: "datetime",
      label: "Current Date/Time",
      type: "datetime",
      enabled: true,
    },
  },
  merkostnader: {
    caseNumber: {
      id: "caseNumber",
      label: "Ärendenummer",
      type: "field",
      enabled: true,
    },
    category: {
      id: "category",
      label: "Kategori",
      type: "field",
      enabled: true,
    },
    decision: { id: "decision", label: "Beslut", type: "field", enabled: true },
    compensation: {
      id: "compensation",
      label: "Ersättning",
      type: "field",
      enabled: true,
    },
  },
  ticket: {
    bookingNumber: {
      id: "bookingNumber",
      label: "Bokningsnummer",
      type: "field",
      enabled: true,
    },
    cardNumber: {
      id: "cardNumber",
      label: "Kortnummer",
      type: "field",
      enabled: true,
    },
    cost: {
      id: "cost",
      label: "Beställningsnummer",
      type: "field",
      enabled: true,
    },
  },
  notes: {
    bookingNumber: {
      id: "bookingNumber",
      label: "Bokningsnummer",
      type: "field",
      enabled: true,
    },
    newBookingNumber: {
      id: "newBookingNumber",
      label: "Nytt bokningsnummer",
      type: "field",
      enabled: true,
    },
    extraNote: {
      id: "extraNote",
      label: "Extra notering",
      type: "field",
      enabled: true,
    },
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
  const [selectedTemplate, setSelectedTemplate] = useState("default");
  const [partToAdd, setPartToAdd] = useState<string>("static");

  // FIX: Sync internal state with props when the modal is opened
  useEffect(() => {
    if (isOpen) {
      setInternalConfig(copyConfig);
    }
  }, [copyConfig, isOpen]);

  useEffect(() => {
    const availableTemplates = Object.keys(
      templateNamesByModule[selectedModule] || {}
    );
    setSelectedTemplate(availableTemplates[0] || "");
  }, [selectedModule]);

  const currentTemplateConfig = useMemo(
    () => internalConfig[selectedModule]?.[selectedTemplate] || [],
    [internalConfig, selectedModule, selectedTemplate]
  );

  const itemIds = useMemo(
    () => currentTemplateConfig.map((item) => item.id),
    [currentTemplateConfig]
  );

  const availablePartsToAdd = useMemo(() => {
    const partsForModule = allModuleParts[selectedModule] || {};
    return Object.values(partsForModule);
  }, [selectedModule]);

  const previewText = useMemo(() => {
    const now = new Date();
    const formattedDateTime = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")} ${now
      .getHours()
      .toString()
      .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const modulePlaceholders = placeholderData[selectedModule] || {};

    return currentTemplateConfig
      .filter((part) => part.enabled)
      .map((part) => {
        switch (part.type) {
          case "field":
            const fieldKey = part.fieldId || part.id;
            return (
              modulePlaceholders[fieldKey as keyof typeof modulePlaceholders] ||
              `[${part.label}]`
            );
          case "static":
            return part.value || "";
          case "datetime":
            return formattedDateTime;
          default:
            return "";
        }
      })
      .join("");
  }, [currentTemplateConfig, selectedModule]);

  if (!isOpen) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = itemIds.indexOf(active.id as string);
      const newIndex = itemIds.indexOf(over.id as string);
      const newOrderedConfig = arrayMove(
        currentTemplateConfig,
        oldIndex,
        newIndex
      );
      setInternalConfig((prev) => ({
        ...prev,
        [selectedModule]: {
          ...(prev[selectedModule] || {}),
          [selectedTemplate]: newOrderedConfig,
        },
      }));
    }
  };

  const handlePartChange = (partId: string, newPart: Partial<CopyPart>) => {
    const newModuleConfig = currentTemplateConfig.map((p) =>
      p.id === partId ? { ...p, ...newPart } : p
    );
    setInternalConfig({
      ...internalConfig,
      [selectedModule]: {
        ...(internalConfig[selectedModule] || {}),
        [selectedTemplate]: newModuleConfig,
      },
    });
  };

  const handleAddPart = () => {
    if (!partToAdd) return;
    let newPart: CopyPart | undefined;

    if (partToAdd === "static") {
      newPart = {
        id: `static-${Date.now()}`,
        fieldId: "static",
        label: "Static Text",
        type: "static",
        value: " ",
        enabled: true,
      };
    } else {
      const partTemplate = allModuleParts[selectedModule]?.[partToAdd];
      if (partTemplate) {
        newPart = {
          ...partTemplate,
          id: `${partTemplate.id}-${Date.now()}`,
          fieldId: partTemplate.id,
        };
      }
    }

    if (newPart) {
      setInternalConfig((prev) => ({
        ...prev,
        [selectedModule]: {
          ...(prev[selectedModule] || {}),
          [selectedTemplate]: [
            ...(prev[selectedModule]?.[selectedTemplate] || []),
            newPart,
          ],
        },
      }));
    }
  };

  const handleDeletePart = (partId: string) => {
    setInternalConfig((prev) => ({
      ...prev,
      [selectedModule]: {
        ...(prev[selectedModule] || {}),
        [selectedTemplate]: (
          prev[selectedModule]?.[selectedTemplate] || []
        ).filter((p) => p.id !== partId),
      },
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
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <select
              style={{ flex: 1 }}
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

            <select
              style={{ flex: 1 }}
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              {Object.entries(templateNamesByModule[selectedModule] || {}).map(
                ([key, name]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                )
              )}
            </select>
          </div>

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
              {currentTemplateConfig.map((part) => (
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
