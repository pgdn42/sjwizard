import { FloatingLabel } from "./FloatingLabel";
import type { FormData, ModuleCopyConfig } from "../types";
import { DynamicButtonRow } from "./DynamicButtonRow";

interface MerkostnaderProps {
  data: FormData; // <-- UPDATED: Expect the full FormData object
  onChange: (field: string, value: string) => void;
  onClear: () => void;
  customButtons: ModuleCopyConfig;
}

export function Merkostnader({
  data,
  onChange,
  onClear,
  customButtons,
}: MerkostnaderProps) {
  return (
    <div className="section-container">
      <div className="section-header">
        <span className="section-title">Merkostnader</span>
        <div className="buttons-wrapper">
          <DynamicButtonRow
            buttons={customButtons}
            formData={data}
            onClear={onClear}
          />
        </div>
      </div>
      <div className="merkostnader-input-group">
        <FloatingLabel label="Ärendenummer" className="width-large">
          <input
            type="text"
            value={data.merkostnader.caseNumber} // <-- UPDATED
            onChange={(e) => onChange("caseNumber", e.target.value)}
          />
        </FloatingLabel>

        <FloatingLabel label="Beslut" className="width-medium">
          <select
            required
            value={data.merkostnader.decision} // <-- UPDATED
            onChange={(e) => onChange("decision", e.target.value)}
          >
            <option value="approved">Godkänd</option>
            <option value="denied">Nekad</option>
          </select>
        </FloatingLabel>
        <FloatingLabel label="Kategori" className="width-medium">
          <select
            required
            value={data.merkostnader.category} // <-- UPDATED
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
            value={data.merkostnader.compensation} // <-- UPDATED
            onChange={(e) => onChange("compensation", e.target.value)}
          />
        </FloatingLabel>
      </div>
    </div>
  );
}
