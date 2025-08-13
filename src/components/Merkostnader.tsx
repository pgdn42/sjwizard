import { FloatingLabel } from "./FloatingLabel";
import CopyIcon from "../assets/copyIcon";
import CopyCheckIcon from "../assets/copyCheckIcon";
import CopyCrossIcon from "../assets/copyCrossIcon";
import TrashcanIcon from "../assets/trashcanIcon";
import type { ModuleCopyConfig, CopyPart } from "../types";

interface MerkostnaderProps {
  data: {
    caseNumber: string;
    category: string;
    decision: string;
    compensation: string;
  };
  onChange: (field: string, value: string) => void;
  onClear: () => void;
  copyConfig: ModuleCopyConfig;
}

function generateCopyText(
  template: CopyPart[],
  data: MerkostnaderProps["data"]
): string {
  const now = new Date();
  const formattedDateTime = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")} ${now
    .getHours()
    .toString()
    .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  return template
    .filter((part) => part.enabled)
    .map((part) => {
      switch (part.type) {
        case "field":
          const fieldKey = part.fieldId || part.id;
          return data[fieldKey as keyof typeof data] || "";
        case "static":
          return part.value || "";
        case "datetime":
          return formattedDateTime;
        default:
          return "";
      }
    })
    .join("");
}

export function Merkostnader({
  data,
  onChange,
  onClear,
  copyConfig,
}: MerkostnaderProps) {
  const handleCopy = (templateName: keyof ModuleCopyConfig) => {
    const template = copyConfig[templateName];
    if (!template) return;

    const textToCopy = generateCopyText(template, data);
    navigator.clipboard.writeText(textToCopy);
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <span>Merkostnader</span>
        <div>
          {data.decision === "denied" ? (
            <button
              className="button-svg"
              title="Copy Denied"
              onClick={() => handleCopy("denied")}
            >
              <CopyCrossIcon />
            </button>
          ) : (
            <button
              className="button-svg"
              title="Copy Approved"
              onClick={() => handleCopy("approved")}
            >
              <CopyCheckIcon />
            </button>
          )}
          <button
            className="button-svg"
            title="Copy Case Note"
            onClick={() => handleCopy("caseNote")}
          >
            <CopyIcon />
          </button>
          <button
            className="button-svg"
            title="Clear all fields"
            onClick={onClear}
          >
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
