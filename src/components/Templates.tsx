import { useState, useMemo, useRef } from "react";
import { SearchableSelect } from "./SearchableSelect";
import PencilIcon from "../assets/PencilIcon";
import {
  addDocument,
  updateDocument,
  deleteDocument,
} from "../services/firestoreService";
import { DynamicButtonRow } from "./DynamicButtonRow";
import type { ModuleCopyConfig } from "../types";
import { allFieldsAsOptions } from "../data/templateFields";
import { FieldPickerPopover } from "./FieldPickerPopover";
import { getCaretCoordinates } from "../utils"; // We will add this utility function next

// Define the shape of a template object
interface TemplateData {
  id: string;
  label: string;
  content: string;
}

// Define the shape of the props coming into this component
interface TemplatesProps {
  selectedTemplateId: string;
  onSelectTemplate: (id: string) => void;
  allTemplates: TemplateData[];
  templateOptions: { value: string; label: string }[];
  userId: string;
  customButtons: ModuleCopyConfig;
  data: {
    ersattning: any;
    ticket: {
      bookingNumber: string;
      cost: string;
      cardNumber: string;
    };
    merkostnader: any;
    templates: any;
    notes: any;
    train: any;
  };
}

export function Templates({
  selectedTemplateId,
  onSelectTemplate,
  allTemplates,
  templateOptions,
  userId,
  customButtons,
  data,
}: TemplatesProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<TemplateData | null>(
    null
  );
  // State to store the original template for change detection
  const [originalTemplate, setOriginalTemplate] = useState<TemplateData | null>(
    null
  );

  const [isFieldPickerOpen, setFieldPickerOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [triggerPosition, setTriggerPosition] = useState(0);

  const openModal = () => {
    const selected = allTemplates.find((t) => t.id === selectedTemplateId);
    const templateToEdit = selected || { id: "", label: "", content: "" };
    setActiveTemplate(templateToEdit);
    setOriginalTemplate(templateToEdit); // Store the original state at modal open
    setModalOpen(true);
  };

  const handleModalSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    if (templateId === "") {
      const blankTemplate = { id: "", label: "", content: "" };
      setActiveTemplate(blankTemplate);
      setOriginalTemplate(blankTemplate);
    } else {
      const selected = allTemplates.find((t) => t.id === templateId);
      if (selected) {
        setActiveTemplate(selected);
        setOriginalTemplate(selected); // Update original state when selection changes
      }
    }
  };

  const handleFieldChange = (field: "label" | "content", value: string) => {
    const current = activeTemplate || { id: "", label: "", content: "" };
    setActiveTemplate({ ...current, [field]: value });

    // --- NEW: Trigger logic ---
    if (field === "content" && contentTextareaRef.current) {
      const textarea = contentTextareaRef.current;
      const cursorPos = textarea.selectionStart;
      const lastChar = value[cursorPos - 1];

      if (lastChar === "@") {
        setTriggerPosition(cursorPos); // Save where the '@' was typed
        const coords = getCaretCoordinates(textarea, cursorPos);
        setPopoverPosition({ top: coords.top + 20, left: coords.left });
        setFieldPickerOpen(true);
      }
    }
  };

  // --- NEW: Handler for when a field is selected from the popover ---
  const handleFieldSelect = (selectedValue: string) => {
    if (!contentTextareaRef.current || !activeTemplate) return;

    const textarea = contentTextareaRef.current;
    const originalContent = activeTemplate.content;
    const placeholder = `{${selectedValue}}`;

    // Replace the '@' at the trigger position with the full placeholder
    const newContent =
      originalContent.slice(0, triggerPosition - 1) +
      placeholder +
      originalContent.slice(triggerPosition);

    // Update state
    handleFieldChange("content", newContent);

    // Close the picker
    setFieldPickerOpen(false);

    // Set focus back to the textarea and move cursor to the end of the inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = triggerPosition - 1 + placeholder.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // --- Modal Action Handlers ---
  const handleSave = async () => {
    if (!activeTemplate || !activeTemplate.id) {
      alert("No template selected to save.");
      return;
    }
    if (!activeTemplate.label.trim()) {
      alert("Label cannot be empty.");
      return;
    }
    const updates = {
      label: activeTemplate.label,
      content: activeTemplate.content,
      updatedAt: new Date().toISOString(),
    };
    await updateDocument("templates", activeTemplate.id, updates);
    setModalOpen(false);
  };

  const handleSaveAsNew = async () => {
    if (!activeTemplate || !activeTemplate.label.trim()) {
      alert("Label cannot be empty to save as new.");
      return;
    }
    const newTemplateData = {
      label: activeTemplate.label,
      content: activeTemplate.content,
      visibility: "private", // Default new templates to private
      ownerId: userId, // <-- Use the actual user's ID here
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await addDocument("templates", newTemplateData);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!activeTemplate || !activeTemplate.id) return;
    if (
      window.confirm(
        `Are you sure you want to delete "${activeTemplate.label}"?`
      )
    ) {
      await deleteDocument("templates", activeTemplate.id);
      setModalOpen(false);
    }
  };

  // --- Logic to determine if buttons should be disabled ---
  const hasChanges = useMemo(() => {
    if (!activeTemplate || !originalTemplate) return false;
    // No changes if the active template has no ID (it's a new one)
    if (!activeTemplate.id) return false;
    return (
      activeTemplate.label !== originalTemplate.label ||
      activeTemplate.content !== originalTemplate.content
    );
  }, [activeTemplate, originalTemplate]);

  const canSaveAsNew = useMemo(() => {
    // Label cannot be empty
    if (!activeTemplate?.label.trim()) {
      return false;
    }
    // If it's a brand new template (no original ID), it can be saved.
    if (!originalTemplate?.id) {
      return true;
    }
    // If editing an existing template, the label must be different to "Save as New".
    return activeTemplate.label !== originalTemplate.label;
  }, [activeTemplate, originalTemplate]);

  return (
    <>
      <div className="section-container">
        <div className="section-header">
          <span className="section-title">Templates</span>
          <div className="buttons-wrapper">
            <DynamicButtonRow buttons={customButtons} formData={data} />
          </div>
        </div>
        <div className="template-controls">
          <SearchableSelect
            options={templateOptions}
            onEnter={onSelectTemplate}
          />
          <button
            className="button-svg"
            title="Edit Templates"
            onClick={openModal}
          >
            <PencilIcon />
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Templates</h2>
            <div className="modal-form">
              <label>Select Template to Edit</label>
              <select
                value={activeTemplate?.id || ""}
                onChange={handleModalSelectChange}
              >
                <option value="">-- New Template --</option>
                {templateOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <label>Label</label>
              <input
                type="text"
                placeholder="Template label..."
                value={activeTemplate?.label || ""}
                onChange={(e) => handleFieldChange("label", e.target.value)}
              />

              <label>Content</label>
              <textarea
                ref={contentTextareaRef}
                placeholder="Template content... type @ to insert a field"
                rows={8}
                value={activeTemplate?.content || ""}
                onChange={(e) => handleFieldChange("content", e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button
                onClick={handleSave}
                disabled={
                  !activeTemplate?.id ||
                  !hasChanges ||
                  !activeTemplate.label.trim()
                }
              >
                Save Changes
              </button>
              <button onClick={handleSaveAsNew} disabled={!canSaveAsNew}>
                Save as New
              </button>
              <button onClick={handleDelete} disabled={!activeTemplate?.id}>
                Delete
              </button>
              <button onClick={() => setModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {isFieldPickerOpen && (
        <div
          style={{
            position: "fixed",
            top: popoverPosition.top,
            left: popoverPosition.left,
            zIndex: 1002,
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
