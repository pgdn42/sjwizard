import { FloatingLabel } from "./FloatingLabel";
import type { FormData, ModuleCopyConfig } from "../types";
import { DynamicButtonRow } from "./DynamicButtonRow";
import { MerkostnadSubModule } from "./MerkostnadSubModule";

interface MerkostnaderProps {
  data: FormData; // <-- UPDATED: Expect the full FormData object
  onChange: (field: string, value: string) => void;
  onClear: () => void;
  customButtons: ModuleCopyConfig;
  onSubCaseChange: (subCaseId: string, field: string, value: string) => void;
  onDeleteSubCase: (subCaseId: string) => void;
}

export function Merkostnader({
  data,
  onChange,
  onClear,
  customButtons,
  onSubCaseChange,
  onDeleteSubCase,
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
            <option value="Mat">Mat</option>
            <option value="Transport">Transport</option>
            <option value="Hotel">Hotel</option>
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
      {data.merkostnader.subCases.map((subCase) => (
        <MerkostnadSubModule
          key={subCase.id}
          subCase={subCase}
          onSubCaseChange={(field, value) =>
            onSubCaseChange(subCase.id!, field, value)
          }
          onDelete={() => onDeleteSubCase(subCase.id!)}
        />
      ))}
    </div>
  );
}
