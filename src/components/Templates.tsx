import React, { useState } from "react";
import CopyIcon from "../assets/copyIcon";

interface TemplatesProps {
  data: {
    selectedTemplate: string;
    templateContent: string;
  };
  onChange: (field: string, value: string) => void;
}

export function Templates({ data, onChange }: TemplatesProps) {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="section-container">
        <div className="section-header">
          <span>Mallar</span>
          <button className="button-svg" title="Kopiera mall">
            <CopyIcon />
          </button>
        </div>
        <div className="template-controls">
          <select
            value={data.selectedTemplate}
            onChange={(e) => onChange("selectedTemplate", e.target.value)}
            className="template-select"
          >
            <option value="">Välj en mall...</option>
            <option value="delay_reason_1">Förseningsorsak 1</option>
            <option value="delay_reason_2">Förseningsorsak 2</option>
          </select>
          <button
            onClick={() => setModalOpen(true)}
            className="button-fixed-width"
          >
            Add
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Redigera mall</h2>
            <textarea
              placeholder="Mallinnehåll"
              rows={6}
              value={data.templateContent}
              onChange={(e) => onChange("templateContent", e.target.value)}
            ></textarea>
            <div className="modal-actions">
              <button onClick={() => setModalOpen(false)}>Avbryt</button>
              <button onClick={() => setModalOpen(false)}>Spara</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
