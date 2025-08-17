import { useState } from "react";
import { FloatingLabel } from "./FloatingLabel";
import type { MerkostnadData } from "../types";
import ChevronIcon from "../assets/ChevronIcon";

const DeleteIcon = () => (
  <span style={{ fontWeight: "bold", fontSize: "1.2em" }}>&#x2715;</span>
);

interface MerkostnadSubModuleProps {
  subCase: MerkostnadData;
  onSubCaseChange: (field: keyof MerkostnadData, value: string) => void;
  onDelete: () => void;
}

export function MerkostnadSubModule({
  subCase,
  onSubCaseChange,
  onDelete,
}: MerkostnadSubModuleProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const title = `Underärende ${subCase.caseNumber}`;

  return (
    <div className="sub-module-container">
      <div className="section-header">
        <button
          className="button-svg"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          <ChevronIcon isCollapsed={isCollapsed} />
        </button>
        <span className="section-title sub-title">{title}</span>
        <button
          className="delete-button"
          title="Delete this sub-case"
          onClick={onDelete}
          style={{ marginLeft: "auto" }}
        >
          <DeleteIcon />
        </button>
      </div>

      {!isCollapsed && (
        <div className="merkostnader-input-group">
          <FloatingLabel label="Beslut" className="width-medium">
            <select
              required
              value={subCase.decision}
              onChange={(e) => onSubCaseChange("decision", e.target.value)}
            >
              <option value="approved">Godkänd</option>
              <option value="denied">Nekad</option>
            </select>
          </FloatingLabel>
          <FloatingLabel label="Kategori" className="width-medium">
            <select
              required
              value={subCase.category}
              onChange={(e) => onSubCaseChange("category", e.target.value)}
            >
              <option value="Mat">Mat</option>
              <option value="Transport">Transport</option>
              <option value="Hotel">Hotel</option>
            </select>
          </FloatingLabel>
          <FloatingLabel label="Ersättning" className="width-medium">
            <input
              type="text"
              value={subCase.compensation}
              onChange={(e) => onSubCaseChange("compensation", e.target.value)}
            />
          </FloatingLabel>
        </div>
      )}
    </div>
  );
}
