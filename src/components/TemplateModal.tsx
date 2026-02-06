// src/components/TemplateModal.tsx
import { useState, useEffect, useRef, useMemo } from "react";
import { 
  addDocument, 
  updateDocument, 
  deleteDocument 
} from "../services/firestoreService";
import { FieldPickerPopover } from "./FieldPickerPopover";
import { moduleNames, allModuleParts } from "../data/templateFields";
import { getCaretCoordinates } from "../utils"; 

// --- Flag Icons ---
const FlagSE = () => (
  <svg viewBox="0 0 16 10" className="flag-icon" xmlns="http://www.w3.org/2000/svg">
    <rect width="16" height="10" fill="#006aa7" />
    <rect width="2" height="10" x="5" fill="#fecc00" />
    <rect width="16" height="2" y="4" fill="#fecc00" />
  </svg>
);

const FlagGB = () => (
  <svg viewBox="0 0 60 30" className="flag-icon" xmlns="http://www.w3.org/2000/svg">
    <rect width="60" height="30" fill="#012169" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" />
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
  </svg>
);

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateToEdit: any | null; 
  userId: string;
}

export function TemplateModal({
  isOpen,
  onClose,
  templateToEdit,
  userId,
}: TemplateModalProps) {
  const [formData, setFormData] = useState({
    labelSE: "",
    contentSE: "",
    labelEN: "",
    contentEN: "",
    visibility: "private",
    ownerId: userId,
  });

  const [isFieldPickerOpen, setFieldPickerOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [triggerPosition, setTriggerPosition] = useState(0);
  const [activeLang, setActiveLang] = useState<"SE" | "EN" | null>(null);

  const textareaSERef = useRef<HTMLTextAreaElement>(null);
  const textareaENRef = useRef<HTMLTextAreaElement>(null);

  const allFieldsAsOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    for (const moduleId in allModuleParts) {
      const moduleName = moduleNames[moduleId as keyof typeof moduleNames] || "Unknown Module";
      const parts = allModuleParts[moduleId as keyof typeof allModuleParts];
      for (const fieldId in parts) {
        options.push({
          value: `${moduleId}.${fieldId}`,
          label: `${moduleName}: ${parts[fieldId].label}`,
        });
      }
    }
    // Loop Helper Fields
    options.push({ value: "decision", label: "Loop: Decision" });
    options.push({ value: "trainNumber", label: "Loop: Train Number" });
    options.push({ value: "delay", label: "Loop: Delay" });
    options.push({ value: "compensation", label: "Loop: Compensation" });
    options.push({ value: "category", label: "Loop: Category" });
    options.push({ value: "caseNumber", label: "Loop: Case Number" });
    return options;
  }, []);

  useEffect(() => {
    if (templateToEdit) {
      setFormData({
        labelSE: templateToEdit.labelSE || templateToEdit.label || "",
        contentSE: templateToEdit.contentSE || templateToEdit.content || "",
        labelEN: templateToEdit.labelEN || "",
        contentEN: templateToEdit.contentEN || "",
        visibility: templateToEdit.visibility || "private",
        ownerId: templateToEdit.ownerId || userId,
      });
    } else {
      setFormData({
        labelSE: "",
        contentSE: "",
        labelEN: "",
        contentEN: "",
        visibility: "private",
        ownerId: userId,
      });
    }
  }, [templateToEdit, userId, isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContentChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    lang: "SE" | "EN"
  ) => {
    const value = e.target.value;
    const field = lang === "SE" ? "contentSE" : "contentEN";
    handleChange(field, value);

    const textarea = e.target;
    const cursorPos = textarea.selectionStart;
    const lastChar = value[cursorPos - 1];

    if (lastChar === "@") {
      setTriggerPosition(cursorPos);
      setActiveLang(lang);
      
      // --- FIXED POSITIONING LOGIC ---
      // 1. Get caret coordinates relative to the top-left of the TEXTAREA content.
      const coords = getCaretCoordinates(textarea, cursorPos);
      
      // 2. Adjust 'top' by subtracting scrollTop (so it follows scrolling) 
      //    and adding a small buffer (e.g., 20px) so it appears below the line.
      // 3. 'left' is just coords.left.
      // We do NOT add textarea.getBoundingClientRect().top because we are rendering 
      // absolute inside the relative container that holds the textarea.
      
      // Note: We add a small buffer (e.g., +24px) for the input header/padding offset if needed,
      // but usually coords.top is relative to the input box itself.
      // If your textarea has padding, getCaretCoordinates usually accounts for it.
      // We add ~20px for the line height.
      
      const topOffset = coords.top - textarea.scrollTop + 20; 
      const leftOffset = coords.left;

      setPopoverPosition({ top: topOffset, left: leftOffset });
      setFieldPickerOpen(true);
    } 
  };

  const handleFieldSelect = (selectedValue: string) => {
    if (!activeLang) return;
    const isSE = activeLang === "SE";
    const textarea = isSE ? textareaSERef.current : textareaENRef.current;
    if (!textarea) return;

    const originalContent = isSE ? formData.contentSE : formData.contentEN;
    const placeholder = `{${selectedValue}}`;
    const newContent =
      originalContent.slice(0, triggerPosition - 1) +
      placeholder +
      originalContent.slice(triggerPosition);

    handleChange(isSE ? "contentSE" : "contentEN", newContent);
    setFieldPickerOpen(false);
    setActiveLang(null);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = triggerPosition - 1 + placeholder.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSave = async () => {
    if (!formData.labelSE) {
      alert("Swedish label is required.");
      return;
    }
    const dataToSave = {
      ...formData,
      label: formData.labelSE, 
      content: formData.contentSE,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (templateToEdit && templateToEdit.id) {
        await updateDocument("templates", templateToEdit.id, dataToSave);
      } else {
        await addDocument("templates", {
          ...dataToSave,
          createdAt: new Date().toISOString(),
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template.");
    }
  };

  const handleDelete = async () => {
    if (templateToEdit?.id && window.confirm("Delete this template?")) {
        await deleteDocument("templates", templateToEdit.id);
        onClose();
    }
  }

  // --- Helper to render the popover INSIDE the active container ---
  const renderPopoverIfActive = (lang: "SE" | "EN") => {
    if (isFieldPickerOpen && activeLang === lang) {
      return (
        <div 
          style={{
            position: 'fixed',
            top: popoverPosition.top,
            left: popoverPosition.left,
            zIndex: 3000 // Ensure it's above everything else in the card
          }}
        >
          <FieldPickerPopover
            fields={allFieldsAsOptions}
            onSelect={handleFieldSelect}
            onClose={() => setFieldPickerOpen(false)}
          />
        </div>
      );
    }
    return null;
  };

  if (!isOpen) return null;
  const isOwner = templateToEdit ? templateToEdit.ownerId === userId : true;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
          <h2>{templateToEdit ? "Edit Template" : "New Template"}</h2>
          <div className="modal-form" style={{ gap: '15px' }}>
            <div style={{display:'flex', justifyContent:'flex-end'}}>
               <select 
                  value={formData.visibility}
                  onChange={(e) => handleChange("visibility", e.target.value as "public"|"private")}
                  disabled={!isOwner}
               >
                   <option value="private">Private</option>
                   <option value="public">Public</option>
               </select>
            </div>
            
            {/* SWEDISH CONTAINER */}
            <div style={{
              border:'1px solid var(--color-border)', 
              padding:'10px', 
              borderRadius:'var(--border-radius)', 
              backgroundColor: 'var(--color-containerbg2)',
              position: 'relative' // Vital for absolute positioning
            }}>
               <h4 style={{marginTop:0, marginBottom:'10px', color: 'var(--color-primary)', display:'flex', alignItems:'center', gap:'8px'}}>
                 <FlagSE /> Svenska
               </h4>
               <input
                 type="text"
                 placeholder="Label (t.ex. 'Tågförsening')"
                 value={formData.labelSE}
                 onChange={(e) => handleChange("labelSE", e.target.value)}
                 disabled={!isOwner}
                 style={{marginBottom: '10px'}}
               />
               <textarea
                 ref={textareaSERef}
                 placeholder="Content... type @ to insert a field"
                 rows={5}
                 value={formData.contentSE}
                 onChange={(e) => handleContentChange(e, "SE")}
                 disabled={!isOwner}
                 style={{fontFamily: 'monospace'}}
               />
               {/* Render Popover Here */}
               {renderPopoverIfActive("SE")}
            </div>

            {/* ENGLISH CONTAINER */}
            <div style={{
              border:'1px solid var(--color-border)', 
              padding:'10px', 
              borderRadius:'var(--border-radius)', 
              backgroundColor: 'var(--color-containerbg2)',
              position: 'relative' // Vital for absolute positioning
            }}>
               <h4 style={{marginTop:0, marginBottom:'10px', color: 'var(--color-primary)', display:'flex', alignItems:'center', gap:'8px'}}>
                 <FlagGB /> English
               </h4>
               <input
                 type="text"
                 placeholder="Label (e.g., 'Train Delay')"
                 value={formData.labelEN}
                 onChange={(e) => handleChange("labelEN", e.target.value)}
                 disabled={!isOwner}
                 style={{marginBottom: '10px'}}
               />
               <textarea
                 ref={textareaENRef}
                 placeholder="Content... type @ to insert a field"
                 rows={5}
                 value={formData.contentEN}
                 onChange={(e) => handleContentChange(e, "EN")}
                 disabled={!isOwner}
                 style={{fontFamily: 'monospace'}}
               />
               {/* Render Popover Here */}
               {renderPopoverIfActive("EN")}
            </div>
          </div>
          <div className="modal-actions">
            <div className="modal-actions-left">
              {isOwner && <button onClick={handleSave}>Save</button>}
              {isOwner && templateToEdit && <button onClick={handleDelete} className="button-logout">Delete</button>}
            </div>
            <button onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
}