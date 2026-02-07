import { useState, useMemo, useEffect, useRef } from "react";
import type { User } from "firebase/auth";
import type { CopyConfig, FormData } from "../types";
import type { UserSettings } from "../App";
import { buildStringFromTemplate, getCaretCoordinates } from "../utils";
import { ManageButtonsTab } from "./ManageButtonsTab";
import { moduleNames, allModuleParts } from "../data/templateFields";
import { FieldPickerPopover } from "./FieldPickerPopover";

// --- Placeholder Data for Live Preview ---
const placeholderData: FormData = {
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
      { 
        id: "sc-1",
        caseNumbers: ["SC-1"], 
        decision: "50%", 
        delay: "65", 
        trainNumber: "99", 
        departureDate: "2025-08-17T14:30", 
        departureStation: "Stockholm C", 
        arrivalStation: "Uppsala C", 
        producer: "SJ",
        caseNumber: "SC-1"
      },
      { 
        id: "sc-2",
        caseNumbers: ["SC-2"], 
        decision: "100%", 
        delay: "125", 
        trainNumber: "100", 
        departureDate: "2025-08-18T10:00", 
        departureStation: "Malmö C", 
        arrivalStation: "Lund C", 
        producer: "Öresundståg",
        caseNumber: "SC-2"
      },
    ],
  },
  merkostnader: {
    caseNumber: "1-98765432",
    category: "Mat",
    decision: "Godkänd",
    compensation: "150",
    subCases: [
      { id: "sc-m1", caseNumber: "SC-M1", compensation: "100", decision: "Godkänd", category: "Mat" },
      { id: "sc-m2", caseNumber: "SC-M2", compensation: "50", decision: "Godkänd", category: "Transport" },
    ],
  },
  ticket: { bookingNumber: "ABC1234", cardNumber: "1234", cost: "599" },
  notes: {
    bookingNumber: "XYZ987",
    newBookingNumber: "NEW567",
    extraNote: "Extra info",
    notesContent: "This is a note.",
  },
  train: {},
  templates: { selectedTemplate: "", templateContent: "" }
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
  const [previewMode, setPreviewMode] = useState<"multi" | "single">("multi");
  const [internalSettings, setInternalSettings] = useState<UserSettings>(userSettings);
  const [selectedModule, setSelectedModule] = useState<keyof CopyConfig>("ersattning");
  const [selectedButtonIndex, setSelectedButtonIndex] = useState(0);

  // Field Picker State
  const [isFieldPickerOpen, setFieldPickerOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [triggerPosition, setTriggerPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  
  // --- Flatten Options for the Picker ---
const allFieldsAsOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    
    // 1. Standard Fields
    for (const moduleId in allModuleParts) {
      const moduleName = moduleNames[moduleId] || "Unknown Module";
      const parts = allModuleParts[moduleId as keyof typeof allModuleParts];
      for (const fieldId in parts) {
        options.push({
          value: `${moduleId}.${fieldId}`,
          label: `${moduleName}: ${parts[fieldId].label}`,
        });
      }
    }
    
    // 2. Ersättning Underärende Fields
    const evfPrefix = "underarende.ersattning";
    options.push({ value: `${evfPrefix}.decision`, label: "Underärende (EVF): Beslut" });
    options.push({ value: `${evfPrefix}.trainNumber`, label: "Underärende (EVF): Tågnummer" });
    options.push({ value: `${evfPrefix}.delay`, label: "Underärende (EVF): Försening" });
    options.push({ value: `${evfPrefix}.departureDate`, label: "Underärende (EVF): Avgångsdatum" });
    options.push({ value: `${evfPrefix}.departureDateWithTime`, label: "Underärende (EVF): Avgångsdatum med tid" });
    options.push({ value: `${evfPrefix}.departureStation`, label: "Underärende (EVF): Från" });
    options.push({ value: `${evfPrefix}.arrivalStation`, label: "Underärende (EVF): Till" });

    // 3. Merkostnad Underärende Fields
    const mkPrefix = "underarende.merkostnader";
    options.push({ value: `${mkPrefix}.caseNumber`, label: "Underärende (MK): Ärendenummer" });
    options.push({ value: `${mkPrefix}.category`, label: "Underärende (MK): Kategori" });
    options.push({ value: `${mkPrefix}.decision`, label: "Underärende (MK): Beslut" });
    options.push({ value: `${mkPrefix}.compensation`, label: "Underärende (MK): Ersättning" });
    
    return options;
  }, []);

  useEffect(() => {
    if (isOpen) {
      setInternalSettings(userSettings);
    }
  }, [userSettings, isOpen]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(internalSettings) !== JSON.stringify(userSettings);
  }, [internalSettings, userSettings]);

  // Reset button selection when module changes
  useEffect(() => {
    setSelectedButtonIndex(0);
  }, [selectedModule]);

  const currentButtons = useMemo(
    () => internalSettings.copyConfig[selectedModule] || [],
    [internalSettings, selectedModule]
  );

  const editingButton = useMemo(
    () => currentButtons[selectedButtonIndex],
    [currentButtons, selectedButtonIndex]
  );

  // Safe fallback to empty string if template is undefined
  const currentTemplate = typeof editingButton?.template === 'string' ? editingButton.template : "";

const activePlaceholderData = useMemo(() => {
    if (previewMode === "multi") {
      return placeholderData;
    } else {
      // Create a deep copy and empty the subcases to simulate "Single Case" mode
      const singleData = JSON.parse(JSON.stringify(placeholderData));
      singleData.ersattning.subCases = [];
      singleData.merkostnader.subCases = [];
      return singleData;
    }
  }, [previewMode]);

    // Live Preview
  const previewText = useMemo(() => {
    return buildStringFromTemplate(
      currentTemplate,
      activePlaceholderData as FormData // Use the toggled data here
    );
  }, [currentTemplate, activePlaceholderData]);

  if (!isOpen) return null;

  // --- Handlers ---

  const handleTemplateChange = (newText: string) => {
    const newButtons = [...currentButtons];
    if (newButtons[selectedButtonIndex]) {
      newButtons[selectedButtonIndex] = {
        ...newButtons[selectedButtonIndex],
        template: newText,
      };
    }

    setInternalSettings((prev) => ({
      ...prev,
      copyConfig: {
        ...prev.copyConfig,
        [selectedModule]: newButtons,
      },
    }));

    // Trigger Logic for '@'
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const cursorPos = textarea.selectionStart;
      const lastChar = newText[cursorPos - 1];

      if (lastChar === "@") {
        setTriggerPosition(cursorPos);
        const coords = getCaretCoordinates(textarea, cursorPos);
        // Position relative to viewport (since modal is fixed)
        // Adjust the 'top' slightly to appear below the cursor line
        setPopoverPosition({ top: coords.top + 20, left: coords.left }); 
        setFieldPickerOpen(true);
      }
    }
  };

  const handleFieldSelect = (selectedValue: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const originalContent = currentTemplate;
    const placeholder = `{${selectedValue}}`;

    // Replace the '@' with the placeholder
    const newContent =
      originalContent.slice(0, triggerPosition - 1) +
      placeholder +
      originalContent.slice(triggerPosition);

    handleTemplateChange(newContent);
    setFieldPickerOpen(false);

    // Reset focus and cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = triggerPosition - 1 + placeholder.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

const insertLoop = (type: "ersattning" | "merkostnader") => {
    // Inserts a pre-formatted loop block with the new explicit syntax
    let content = "";
    if (type === "ersattning") {
        content = `\n{{#loop_ersattning}}\n{loop.ersattning.decision} ({loop.ersattning.trainNumber})\n{{/loop}}\n`;
    } else {
        content = `\n{{#loop_merkostnader}}\n{loop.merkostnader.category}: {loop.merkostnader.compensation}\n{{/loop}}\n`;
    }
    handleTemplateChange(currentTemplate + content);
  };
  const insertIfBlock = () => {
    const content = `{{#if_has_subcases}}\n...\n{{else}}\n...\n{{/if}}\n`;
    handleTemplateChange(currentTemplate + content);
  };

  const handleSave = () => onSave(internalSettings);
  const handleSaveAndClose = () => { onSave(internalSettings); onClose(); };
  const handleClose = () => {
    if (hasChanges && window.confirm("Unsaved changes. Close?")) onClose();
    else if (!hasChanges) onClose();
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>Settings</h2>

          <div className="modal-tabs">
            <button className={`tab-button ${activeTab === "account" ? "active" : ""}`} onClick={() => setActiveTab("account")}>Account</button>
            <button className={`tab-button ${activeTab === "templates" ? "active" : ""}`} onClick={() => setActiveTab("templates")}>Copy Templates</button>
            <button className={`tab-button ${activeTab === "buttons" ? "active" : ""}`} onClick={() => setActiveTab("buttons")}>Manage Buttons</button>
          </div>

          <div className="modal-tab-content">
            {activeTab === "account" && (
              <div className="account-tab">
                <p><strong>Logged in as:</strong> {currentUser?.email}</p>
                <button onClick={() => { onLogout(); onClose(); }} className="button-logout">Logout</button>
              </div>
            )}

            {activeTab === "templates" && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
                {/* Selectors */}
                <div style={{ display: "flex", gap: "10px" }}>
                  <select style={{ flex: 1 }} value={selectedModule} onChange={(e) => setSelectedModule(e.target.value as keyof CopyConfig)}>
                    {Object.keys(moduleNames).map((key) => <option key={key} value={key}>{moduleNames[key]}</option>)}
                  </select>
                  
                  {currentButtons.length > 0 ? (
                    <select style={{ flex: 1 }} value={selectedButtonIndex} onChange={(e) => setSelectedButtonIndex(parseInt(e.target.value, 10))}>
                      {currentButtons.map((button, index) => <option key={button.id} value={index}>{button.label}</option>)}
                    </select>
                  ) : (
                    <div style={{ flex: 1, color: "var(--color-placeholder)", fontStyle: "italic", display: "flex", alignItems: "center" }}>
                      No buttons in this module
                    </div>
                  )}
                </div>

                {/* Editor Area (Only show if buttons exist) */}
                {currentButtons.length > 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9em', color: '#888' }}>Type <strong>@</strong> to insert field</span>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '5px'}}>
                        <button type="button" className="button-text-small" onClick={insertIfBlock}>+ Huvud/Underärende (If/Else)</button>
                          <button type="button" className="button-text-small" onClick={() => insertLoop("ersattning")}>+ Ersättning Loop</button>
                          <button type="button" className="button-text-small" onClick={() => insertLoop("merkostnader")}>+ Merkostnad Loop</button>
                      </div>
                    </div>
                    
                    <textarea
                      ref={textareaRef}
                      value={currentTemplate}
                      onChange={(e) => handleTemplateChange(e.target.value)}
                      placeholder="Enter template text here... e.g., 'The case number is {ersattning.caseNumber}'"
                      style={{ 
                        flex: 1, 
                        resize: 'none', 
                        fontFamily: 'monospace', 
                        fontSize: '13px', 
                        padding: '10px', 
                        lineHeight: '1.4' 
                      }}
                    />

                    {/* Preview Area */}
<div className="settings-preview" style={{ height: '35%', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                        <label style={{ fontSize: '0.9em', fontWeight: 'bold', margin: 0 }}>Preview</label>
                        
                        {/* THE NEW TOGGLE SWITCH */}
                        <div style={{ display: "flex", gap: "5px", fontSize: "0.8em" }}>
                           <button 
                             className={`button-text-small ${previewMode === "multi" ? "active" : ""}`}
                             style={{ 
                               backgroundColor: previewMode === "multi" ? "var(--color-primary)" : "transparent",
                               color: previewMode === "multi" ? "white" : "var(--color-text)",
                               border: "1px solid var(--color-primary)",
                               cursor: "pointer"
                             }}
                             onClick={() => setPreviewMode("multi")}
                           >
                             Med Underärenden
                           </button>
                           <button 
                             className={`button-text-small ${previewMode === "single" ? "active" : ""}`}
                             style={{ 
                               backgroundColor: previewMode === "single" ? "var(--color-primary)" : "transparent",
                               color: previewMode === "single" ? "white" : "var(--color-text)",
                               border: "1px solid var(--color-primary)",
                               cursor: "pointer"
                             }}
                             onClick={() => setPreviewMode("single")}
                           >
                             Utan Underärenden
                           </button>
                        </div>
                      </div>
                      
                      <textarea 
                        value={previewText} 
                        readOnly 
                        style={{ 
                          flex: 1, 
                          resize: 'none', 
                          backgroundColor: '#f5f5f5', 
                          color: '#333', 
                          fontSize: '13px',
                          border: '1px solid #ccc' 
                        }} 
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, border: "1px dashed var(--color-border)" }}>
                    <p>Go to "Manage Buttons" to add buttons first.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "buttons" && (
              <ManageButtonsTab internalSettings={internalSettings} setInternalSettings={setInternalSettings} />
            )}
          </div>

          <div className="modal-actions">
            <div className="modal-actions-left">
              <button onClick={handleSave} disabled={!hasChanges}>Save</button>
              <button onClick={handleSaveAndClose} disabled={!hasChanges}>Save & Close</button>
            </div>
            <button onClick={handleClose}>Close</button>
          </div>
        </div>
      </div>

      {isFieldPickerOpen && (
        <div
          style={{
            position: "fixed",
            top: popoverPosition.top,
            left: popoverPosition.left,
            zIndex: 10000,
          }}
        >
          <FieldPickerPopover
            fields={allFieldsAsOptions}
            onSelect={handleFieldSelect}
            onClose={() => setFieldPickerOpen(false)}
          />
        </div>
      )}
    </>
  );
}