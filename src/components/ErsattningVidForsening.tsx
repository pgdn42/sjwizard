import { FloatingLabel } from "./FloatingLabel";
import type { FormData, ModuleCopyConfig } from "../types";
import { DynamicButtonRow } from "./DynamicButtonRow";
import { ErsattningSubModule } from "./ErsattningSubModule";

interface ErsattningProps {
  data: FormData;
  onChange: (field: string, value: string) => void;
  onSubCaseChange: (subCaseId: string, field: string, value: string) => void;
  onDeleteSubCase: (subCaseId: string) => void; // Add delete prop
  onClear: () => void;
  customButtons: ModuleCopyConfig;
}

export function ErsattningVidForsening({
  data,
  onChange,
  onSubCaseChange,
  onDeleteSubCase,
  onClear,
  customButtons,
}: ErsattningProps) {
  return (
    <div className="section-container">
      <div className="section-header">
        <span className="section-title">Ersättning vid försening</span>
        <div className="buttons-wrapper">
          <DynamicButtonRow
            buttons={customButtons}
            formData={data}
            onClear={onClear}
          />
        </div>
      </div>
      <div className="ersattning-input-group">
        <FloatingLabel label="Ärendenummer" className="width-small-medium">
          <input
            type="text"
            value={data.ersattning.caseNumber}
            onChange={(e) => onChange("caseNumber", e.target.value)}
          />
        </FloatingLabel>
        <FloatingLabel label="Beslut" className="width-small">
          <select
            required
            value={data.ersattning.decision}
            onChange={(e) => onChange("decision", e.target.value)}
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
            value={data.ersattning.trainNumber}
            onChange={(e) => onChange("trainNumber", e.target.value)}
          />
        </FloatingLabel>
        <FloatingLabel label="Avgångsdatum" className="width-small-medium">
          <input
            type="datetime-local"
            value={data.ersattning.departureDate}
            onChange={(e) => onChange("departureDate", e.target.value)}
          />
        </FloatingLabel>
      </div>
      <div className="ersattning-input-group">
        <FloatingLabel label="Avgångsstation" className="width-large">
          <input
            type="text"
            value={data.ersattning.departureStation}
            onChange={(e) => onChange("departureStation", e.target.value)}
          />
        </FloatingLabel>
        <FloatingLabel label="Ankomststation" className="width-large">
          <input
            type="text"
            value={data.ersattning.arrivalStation}
            onChange={(e) => onChange("arrivalStation", e.target.value)}
          />
        </FloatingLabel>
        <FloatingLabel label="Försening" className="width-small-medium">
          <input
            type="number"
            value={data.ersattning.delay}
            onChange={(e) => onChange("delay", e.target.value)}
          />
        </FloatingLabel>
      </div>
      {data.ersattning.subCases.map((subCase) => (
        <ErsattningSubModule
          key={subCase.id}
          subCase={subCase}
          onSubCaseChange={(field, value) =>
            onSubCaseChange(subCase.id!, field, value)
          }
          onDelete={() => onDeleteSubCase(subCase.id!)} // Wire up the delete handler
        />
      ))}
    </div>
  );
}
