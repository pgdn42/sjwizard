import React from "react";

interface TemplatesProps {
  data: {
    selectedTemplate: string;
    templateContent: string;
  };
  onChange: (field: string, value: string) => void;
}

export function Templates({ data, onChange }: TemplatesProps) {
  return (
    <div className="section-container">
      <div className="section-header">
        <span>Mallar</span>
        <button>Kopiera mall</button>
      </div>
      {/* Use the new class for the button group */}
      <div className="template-buttons">
        <select
          value={data.selectedTemplate}
          onChange={(e) => onChange("selectedTemplate", e.target.value)}
        >
          <option value="">Templates</option>
          <option value="delay_reason_1">Förseningsorsak 1</option>
          <option value="delay_reason_2">Förseningsorsak 2</option>
        </select>
        <button>Add</button>
        <button>Update</button>
        <button>Remove</button>
      </div>
      <textarea
        placeholder="Template"
        rows={4} /* Reduced row count */
        value={data.templateContent}
        onChange={(e) => onChange("templateContent", e.target.value)}
      ></textarea>
    </div>
  );
}
