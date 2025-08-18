import { useState, useMemo, useEffect } from "react";
import type { User } from "firebase/auth";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import { SortableLoopBlock } from "./SortableLoopBlock"; // Import the new component
import type { CopyConfig, CopyPart, FormData } from "../types";
import type { UserSettings } from "../App";
import { buildStringFromTemplate } from "../utils";
import { ManageButtonsTab } from "./ManageButtonsTab";
import { moduleNames, allModuleParts } from "../data/templateFields";

// --- Placeholder Data ---
const placeholderData: { [key: string]: any } = {
  ersattning: {
    caseNumber: "1-23456789",
    decision: "50%",
    trainNumber: "42",
    departureDate: "2025-08-17T20:12",
    departureStation: "Stockholm C",
    arrivalStation: "Göteborg C",
    delay: "65",
    producer: "SJ",
    subCases: [
      { caseNumbers: ["SC-1"], decision: "50%", delay: "65" },
      { caseNumbers: ["SC-2"], decision: "100%", delay: "125" },
    ],
  },
  merkostnader: {
    caseNumber: "1-98765432",
    category: "Mat",
    decision: "Godkänd",
    compensation: "150",
    subCases: [
      { caseNumber: "SC-M1", compensation: "100" },
      { caseNumber: "SC-M2", compensation: "50" },
    ],
  },
  ticket: { bookingNumber: "ABC1234", cardNumber: "1234", cost: "599" },
  notes: {
    bookingNumber: "XYZ987",
    newBookingNumber: "NEW567",
    extraNote: "Extra info",
    notesContent: "This is a note.",
  },
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSettings: UserSettings;
  onSave: (newSettings: UserSettings) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  userSettings,
  onSave,
  currentUser,
  onLogout,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState("account");
  const [internalSettings, setInternalSettings] =
    useState<UserSettings>(userSettings);
  const [selectedModule, setSelectedModule] =
    useState<keyof CopyConfig>("ersattning");
  const [selectedButtonIndex, setSelectedButtonIndex] = useState(0);
  const [partToAdd, setPartToAdd] = useState<string>("static");

  const allFieldsAsOptions = useMemo(() => {
    const options: {
      value: string;
      label: string;
      context?: "root" | "item";
    }[] = [];
    for (const moduleId in allModuleParts) {
      const moduleName = moduleNames[moduleId] || "Unknown Module";
      const parts = allModuleParts[moduleId as keyof typeof allModuleParts];
      for (const fieldId in parts) {
        const part = parts[fieldId];
        options.push({
          value: `${moduleId}.${fieldId}`,
          label: `${moduleName}: ${part.label}`,
        });
      }
    }
    return options;
  }, []);

  const subCaseFieldsAsOptions = useMemo(() => {
    return allFieldsAsOptions.map((opt) => ({
      ...opt,
      label: `Sub-Case ${opt.label}`,
    }));
  }, [allFieldsAsOptions]);

  useEffect(() => {
    if (isOpen) {
      setInternalSettings(userSettings);
    }
  }, [userSettings, isOpen]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(internalSettings) !== JSON.stringify(userSettings);
  }, [internalSettings, userSettings]);

  useEffect(() => {
    setSelectedButtonIndex(0);
  }, [selectedModule]);

  const currentButtons = useMemo(
    () => internalSettings.copyConfig[selectedModule] || [],
    [internalSettings, selectedModule]
  );

  const currentTemplateConfig = useMemo(
    () => currentButtons[selectedButtonIndex]?.template || [],
    [currentButtons, selectedButtonIndex]
  );

  const itemIds = useMemo(
    () => currentTemplateConfig.map((item) => item.id),
    [currentTemplateConfig]
  );

  // Add this new useMemo hook right above the `previewText` hook
  const editingButton = useMemo(
    () => currentButtons[selectedButtonIndex],
    [currentButtons, selectedButtonIndex]
  );

  // Now, modify the existing previewText hook like this
  const previewText = useMemo(() => {
    // Determine the separator based on the editing button's type
    const separator = editingButton?.type === "link" ? "" : " ";

    return buildStringFromTemplate(
      currentTemplateConfig,
      placeholderData as FormData,
      null,
      separator // Pass the correct separator here
    );
  }, [currentTemplateConfig, editingButton]); // Update the dependency array

  if (!isOpen) return null;

  const updateTemplateForSelectedButton = (newTemplate: CopyPart[]) => {
    const newButtons = [...currentButtons];
    if (newButtons[selectedButtonIndex]) {
      newButtons[selectedButtonIndex] = {
        ...newButtons[selectedButtonIndex],
        template: newTemplate,
      };
    }

    setInternalSettings((prev) => ({
      ...prev,
      copyConfig: {
        ...prev.copyConfig,
        [selectedModule]: newButtons,
      },
    }));
  };

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
      updateTemplateForSelectedButton(newOrderedConfig);
    }
  };

  const handlePartChange = (partId: string, newPart: Partial<CopyPart>) => {
    const newModuleConfig = currentTemplateConfig.map((p) =>
      p.id === partId ? { ...p, ...newPart } : p
    );
    updateTemplateForSelectedButton(newModuleConfig);
  };

  const handleAddPart = () => {
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
    } else if (partToAdd.startsWith("loop_")) {
      const source = partToAdd.split("_")[1] as keyof FormData;
      newPart = {
        id: `loop-${Date.now()}`,
        label: `Loop over ${moduleNames[source]} Sub-Cases`,
        type: "loop",
        enabled: true,
        loopSource: source,
        loopOver: "subCases",
        loopTemplate: [],
      };
    } else {
      const [moduleId, fieldId] = partToAdd.split(".");
      const partTemplate =
        allModuleParts[moduleId as keyof typeof allModuleParts]?.[fieldId];
      if (partTemplate) {
        newPart = {
          ...partTemplate,
          id: `${partToAdd}-${Date.now()}`,
          fieldId: fieldId,
          moduleId: moduleId as keyof FormData,
          context: "root",
        };
      }
    }

    if (newPart) {
      updateTemplateForSelectedButton([...currentTemplateConfig, newPart]);
    }
  };

  const handleDeletePart = (partId: string) => {
    const newTemplate = currentTemplateConfig.filter((p) => p.id !== partId);
    updateTemplateForSelectedButton(newTemplate);
  };

  const handleSave = () => onSave(internalSettings);
  const handleSaveAndClose = () => {
    onSave(internalSettings);
    onClose();
  };

  const handleClose = () => {
    if (
      hasChanges &&
      window.confirm(
        "You have unsaved changes. Are you sure you want to close?"
      )
    ) {
      onClose();
    } else if (!hasChanges) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Settings</h2>

        <div className="modal-tabs">
          <button
            className={`tab-button ${activeTab === "account" ? "active" : ""}`}
            onClick={() => setActiveTab("account")}
          >
            Account
          </button>
          <button
            className={`tab-button ${
              activeTab === "templates" ? "active" : ""
            }`}
            onClick={() => setActiveTab("templates")}
          >
            Copy Templates
          </button>
          <button
            className={`tab-button ${activeTab === "buttons" ? "active" : ""}`}
            onClick={() => setActiveTab("buttons")}
          >
            Manage Buttons
          </button>
        </div>

        <div className="modal-tab-content">
          {activeTab === "account" && (
            <div className="account-tab">
              <p>
                <strong>Logged in as:</strong> {currentUser?.email}
              </p>
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="button-logout"
              >
                Logout
              </button>
            </div>
          )}

          {activeTab === "templates" && (
            <>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
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
                  value={selectedButtonIndex}
                  onChange={(e) =>
                    setSelectedButtonIndex(parseInt(e.target.value, 10))
                  }
                >
                  {currentButtons.map((button, index) => (
                    <option key={button.id} value={index}>
                      {button.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="settings-preview">
                <label>Live Preview</label>
                <textarea value={previewText} readOnly rows={4}></textarea>
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
                    {currentTemplateConfig.map((part) =>
                      part.type === "loop" ? (
                        <SortableLoopBlock
                          key={part.id}
                          part={part}
                          onUpdate={(updatedPart) =>
                            handlePartChange(part.id, updatedPart)
                          }
                          onDelete={() => handleDeletePart(part.id)}
                          allFieldsAsOptions={allFieldsAsOptions}
                          subCaseFieldsAsOptions={subCaseFieldsAsOptions}
                        />
                      ) : (
                        <SortableItem
                          key={part.id}
                          part={part}
                          onPartChange={(changedPart) =>
                            handlePartChange(part.id, changedPart)
                          }
                          onDelete={() => handleDeletePart(part.id)}
                        />
                      )
                    )}
                  </SortableContext>
                </DndContext>
              </div>
              <div className="add-part-controls">
                <select
                  value={partToAdd}
                  onChange={(e) => setPartToAdd(e.target.value)}
                >
                  <optgroup label="Structure">
                    <option value="loop_ersattning">
                      Ersättning Sub-Case Loop
                    </option>
                    <option value="loop_merkostnader">
                      Merkostnad Sub-Case Loop
                    </option>
                  </optgroup>
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
                </select>
                <button onClick={handleAddPart}>Add</button>
              </div>
            </>
          )}

          {activeTab === "buttons" && (
            <ManageButtonsTab
              internalSettings={internalSettings}
              setInternalSettings={setInternalSettings}
            />
          )}
        </div>

        <div className="modal-actions">
          <div className="modal-actions-left">
            <button onClick={handleSave} disabled={!hasChanges}>
              Save
            </button>
            <button onClick={handleSaveAndClose} disabled={!hasChanges}>
              Save & Close
            </button>
          </div>
          <button onClick={handleClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
