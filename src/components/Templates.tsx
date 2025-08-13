import React, { useState } from "react";
import CopyIcon from "../assets/copyIcon";
import { SearchableSelect } from "./SearchableSelect";
import TrashcanIcon from "../assets/trashcanIcon";

interface TemplatesProps {
  data: {
    selectedTemplate: string;
    templateContent: string;
  };
  onChange: (field: string, value: string) => void;
  templateOptions: { value: string; label: string }[];
}

export function Templates({ data, onChange, templateOptions }: TemplatesProps) {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.templateContent);
  };

  const handleTemplateSelect = (selectedValue: string) => {
    onChange("selectedTemplate", selectedValue);
    const selectedTemplate = templateOptions.find(
      (opt) => opt.value === selectedValue
    );
    if (selectedTemplate) {
      navigator.clipboard.writeText(`Innehåll för ${selectedTemplate.label}.`);
    }
  };

  return (
    <>
      <div className="section-container">
        <div className="section-header">
          <span>Mallar</span>
          <div>
            <button
              className="button-svg"
              title="Kopiera mall"
              onClick={handleCopy}
            >
              <CopyIcon />
            </button>
            <button className="button-svg" title="Clear all fields">
              <TrashcanIcon />
            </button>
          </div>
        </div>
        <div className="template-controls">
          <SearchableSelect
            options={templateOptions}
            value={data.selectedTemplate}
            onChange={(value) => onChange("selectedTemplate", value)}
            onEnter={handleTemplateSelect}
          />
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
