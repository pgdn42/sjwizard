// src/components/ChatTemplateModal.tsx
import { useState, useEffect } from "react";
import type { ChatTemplateData } from "../types";
import { 
  addDocument, 
  updateDocument, 
  deleteDocument 
} from "../services/firestoreService"; // Using your service

interface ChatTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateToEdit: ChatTemplateData | null;
  userId: string;
}

export function ChatTemplateModal({
  isOpen,
  onClose,
  templateToEdit,
  userId,
}: ChatTemplateModalProps) {
  const [formData, setFormData] = useState<ChatTemplateData>({
    labelSE: "",
    contentSE: "",
    labelEN: "",
    contentEN: "",
    visibility: "private",
    ownerId: userId,
  });

  useEffect(() => {
    if (templateToEdit) {
      setFormData(templateToEdit);
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

  const handleChange = (field: keyof ChatTemplateData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.labelSE || !formData.contentSE) {
      alert("Swedish label and content are required.");
      return;
    }

    try {
      if (templateToEdit && templateToEdit.id) {
        await updateDocument("chatTemplates", templateToEdit.id, formData);
      } else {
        await addDocument("chatTemplates", {
          ...formData,
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
        await deleteDocument("chatTemplates", templateToEdit.id);
        onClose();
    }
  }

  if (!isOpen) return null;

  const isOwner = templateToEdit ? templateToEdit.ownerId === userId : true;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
        <h2>{templateToEdit ? "Edit Chat Template" : "New Chat Template"}</h2>

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

          <div style={{border:'1px solid var(--color-border)', padding:'10px', borderRadius:'var(--border-radius)', backgroundColor: 'var(--color-containerbg2)'}}>
             <h4 style={{marginTop:0, marginBottom:'10px', color: 'var(--color-primary)'}}>🇸🇪 Svenska</h4>
             <input
               type="text"
               placeholder="Label (t.ex. 'Hej')"
               value={formData.labelSE}
               onChange={(e) => handleChange("labelSE", e.target.value)}
               disabled={!isOwner}
               style={{marginBottom: '10px'}}
             />
             <textarea
               placeholder="Content..."
               rows={3}
               value={formData.contentSE}
               onChange={(e) => handleChange("contentSE", e.target.value)}
               disabled={!isOwner}
               style={{fontFamily: 'monospace'}}
             />
          </div>

          <div style={{border:'1px solid var(--color-border)', padding:'10px', borderRadius:'var(--border-radius)', backgroundColor: 'var(--color-containerbg2)'}}>
             <h4 style={{marginTop:0, marginBottom:'10px', color: 'var(--color-primary)'}}>🇬🇧 English</h4>
             <input
               type="text"
               placeholder="Label (e.g., 'Hello')"
               value={formData.labelEN}
               onChange={(e) => handleChange("labelEN", e.target.value)}
               disabled={!isOwner}
               style={{marginBottom: '10px'}}
             />
             <textarea
               placeholder="Content..."
               rows={3}
               value={formData.contentEN}
               onChange={(e) => handleChange("contentEN", e.target.value)}
               disabled={!isOwner}
               style={{fontFamily: 'monospace'}}
             />
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
  );
}