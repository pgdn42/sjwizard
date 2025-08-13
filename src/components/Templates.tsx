import { useState, useMemo } from "react";
import { SearchableSelect } from "./SearchableSelect";
import PencilIcon from "../assets/PencilIcon";
import {
  addDocument,
  updateDocument,
  deleteDocument,
} from "../services/firestoreService";

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
}

export function Templates({
  selectedTemplateId,
  onSelectTemplate,
  allTemplates,
  templateOptions,
}: TemplatesProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<TemplateData | null>(
    null
  );
  // State to store the original template for change detection
  const [originalTemplate, setOriginalTemplate] = useState<TemplateData | null>(
    null
  );

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
      visibility: "private",
      ownerId: "temp-user-id", // Will be replaced by real auth
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
    return activeTemplate?.label.trim() !== "";
  }, [activeTemplate]);

  return (
    <>
      <div className="section-container">
        <div className="section-header">
          <span>Templates</span>
          <button
            className="button-svg"
            title="Edit Templates"
            onClick={openModal}
          >
            <PencilIcon />
          </button>
        </div>
        <div className="template-controls">
          <SearchableSelect
            options={templateOptions}
            onEnter={onSelectTemplate}
          />
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
                placeholder="Template content with {placeholders}..."
                rows={8}
                value={activeTemplate?.content || ""}
                onChange={(e) => handleFieldChange("content", e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button
                onClick={handleSave}
                disabled={!activeTemplate?.id || !hasChanges}
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
    </>
  );
}
