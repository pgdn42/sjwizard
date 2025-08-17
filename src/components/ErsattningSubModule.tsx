import { useState } from "react";
import { FloatingLabel } from "./FloatingLabel";
import type { ErsattningData } from "../types";
import ChevronIcon from "../assets/ChevronIcon.tsx"; // Import the new icon

// A simple delete icon for the button
const DeleteIcon = () => (
  <span style={{ fontWeight: "bold", fontSize: "1.2em" }}>&#x2715;</span>
);

interface ErsattningSubModuleProps {
  subCase: ErsattningData;
  onSubCaseChange: (field: keyof ErsattningData, value: string) => void;
  onDelete: () => void; // New prop for deleting
}

export function ErsattningSubModule({
  subCase,
  onSubCaseChange,
  onDelete,
}: ErsattningSubModuleProps) {
  // Join merged case numbers for the title
  const [isCollapsed, setIsCollapsed] = useState(false); // Add state for collapsing
  const title = `Underärende ${subCase.caseNumbers?.join(", ")}`;

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
      {/* Add all fields */}
      {!isCollapsed && (
        <>
          <div className="ersattning-input-group">
            <FloatingLabel label="Beslut" className="width-small">
              <select
                required
                value={subCase.decision}
                onChange={(e) => onSubCaseChange("decision", e.target.value)}
              >
                <option value="AVSLAG">AVSLAG</option>
                <option value="25%">25%</option>
                <option value="50%">50%</option>
                <option value="75%">75%</option>
                <option value="100%">100%</option>
              </select>
            </FloatingLabel>
            <FloatingLabel label="Tågnummer" className="width-small">
              <input
                type="text"
                value={subCase.trainNumber}
                onChange={(e) => onSubCaseChange("trainNumber", e.target.value)}
              />
            </FloatingLabel>
            <FloatingLabel label="Avgångsdatum" className="width-small-medium">
              <input
                type="datetime-local"
                value={subCase.departureDate}
                onChange={(e) =>
                  onSubCaseChange("departureDate", e.target.value)
                }
              />
            </FloatingLabel>
          </div>
          <div className="ersattning-input-group">
            <FloatingLabel label="Avgångsstation" className="width-large">
              <input
                type="text"
                value={subCase.departureStation}
                onChange={(e) =>
                  onSubCaseChange("departureStation", e.target.value)
                }
              />
            </FloatingLabel>
            <FloatingLabel label="Ankomststation" className="width-large">
              <input
                type="text"
                value={subCase.arrivalStation}
                onChange={(e) =>
                  onSubCaseChange("arrivalStation", e.target.value)
                }
              />
            </FloatingLabel>
            <FloatingLabel label="Försening" className="width-small-medium">
              <input
                type="number"
                value={subCase.delay}
                onChange={(e) => onSubCaseChange("delay", e.target.value)}
              />
            </FloatingLabel>
          </div>
        </>
      )}
    </div>
  );
}
