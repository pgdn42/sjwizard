import React from "react";
import { FloatingLabel } from "./FloatingLabel";
import CopyIcon from "../assets/copyIcon";
import CopyCheckIcon from "../assets/copyCheckIcon";
import CopyCrossIcon from "../assets/copyCrossIcon";
import TrashcanIcon from "../assets/trashcanIcon";

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
        <div>
          <button className="button-svg">
            <CopyCrossIcon />
          </button>
          <button className="button-svg">
            <CopyCheckIcon />
          </button>
          <button className="button-svg">
            <CopyIcon />
          </button>
          <button className="button-svg" title="Clear all fields">
            <TrashcanIcon />
          </button>
        </div>
      </div>
      <div className="merkostnader-input-group">
        <FloatingLabel label="Ärendenummer" className="width-large">
          <input
            type="text"
            value={data.caseNumber}
            onChange={(e) => onChange("caseNumber", e.target.value)}
          />
        </FloatingLabel>

        <FloatingLabel label="Beslut" className="width-medium">
          <select
            required
            value={data.decision}
            onChange={(e) => onChange("decision", e.target.value)}
          >
            <option value="approved">Godkänd</option>
            <option value="denied">Nekad</option>
          </select>
        </FloatingLabel>
        <FloatingLabel label="Kategori" className="width-medium">
          <select
            required
            value={data.category}
            onChange={(e) => onChange("category", e.target.value)}
          >
            <option value="food">Mat</option>
            <option value="transport">Transport</option>
            <option value="accommodation">Boende</option>
          </select>
        </FloatingLabel>

        <FloatingLabel label="Ersättning" className="width-medium">
          <input
            type="text"
            value={data.compensation}
            onChange={(e) => onChange("compensation", e.target.value)}
          />
        </FloatingLabel>
      </div>
    </div>
  );
}
