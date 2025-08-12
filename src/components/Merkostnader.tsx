import React from "react";

interface MerkostnaderProps {
  data: {
    caseNumber: string;
    category: string;
    decision: string;
    compensation: string;
  };
  onChange: (field: string, value: string) => void;
}

export function Merkostnader({ data, onChange }: MerkostnaderProps) {
  return (
    <div className="section-container">
      <div className="section-header">
        <span>Merkostnader</span>
        <button>KOPIERA MK MALL</button>
      </div>
      <div className="merkostnader-input-group">
        <input
          type="text"
          className="width-medium"
          placeholder="Ärendenummer"
          value={data.caseNumber}
          onChange={(e) => onChange("caseNumber", e.target.value)}
        />
        <select
          className="width-medium"
          value={data.category}
          onChange={(e) => onChange("category", e.target.value)}
        >
          <option value="">Kategori</option>
          <option value="taxi">Taxi</option>
          <option value="hotel">Hotell</option>
        </select>
        <select
          className="width-medium"
          value={data.decision}
          onChange={(e) => onChange("decision", e.target.value)}
        >
          <option value="">Beslut</option>
          <option value="approved">Godkänd</option>
          <option value="denied">Nekad</option>
        </select>
        <select
          className="width-medium"
          value={data.compensation}
          onChange={(e) => onChange("compensation", e.target.value)}
        >
          <option value="">Ersättning</option>
          <option value="full">Full</option>
          <option value="partial">Delvis</option>
        </select>
      </div>
    </div>
  );
}
