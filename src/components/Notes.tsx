// pgdn42/sjwizard/sjwizard-6e1aed39b92e05964281326e206ce3cd9e5a1a89/src/components/Notes.tsx

import { FloatingLabel } from "./FloatingLabel";
import CopyIcon from "../assets/copyIcon";
import TrashcanIcon from "../assets/trashcanIcon";
import type { ModuleCopyConfig, CopyPart } from "../types";

interface NotesProps {
  data: {
    bookingNumber: string;
    newBookingNumber: string;
    extraNote: string;
    notesContent: string;
  };
  onChange: (field: string, value: string) => void;
  onClear: () => void;
  copyConfig: ModuleCopyConfig;
}

function generateCopyText(
  template: CopyPart[],
  data: NotesProps["data"]
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

export function Notes({ data, onChange, onClear, copyConfig }: NotesProps) {
  const handleCopy = (templateName: keyof ModuleCopyConfig) => {
    const template = copyConfig[templateName];
    if (!template) return;

    const textToCopy = generateCopyText(template, data);
    navigator.clipboard.writeText(textToCopy);
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <span>Noteringar</span>
        <div>
          <button
            className="button-svg"
            title="Kopiera trafikstörning"
            onClick={() => handleCopy("trafikstorning")}
          >
            Trafikstörning
            <CopyIcon />
          </button>
          <button
            className="button-svg"
            title="Kopiera byte av avgång"
            onClick={() => handleCopy("byteAvAvgang")}
          >
            Byte av avgång
            <CopyIcon />
          </button>
          <button
            className="button-svg"
            title="Kopiera undantag"
            onClick={() => handleCopy("undantagsaterkop")}
          >
            Undantagsåterköp
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
      <div className="notes-input-group">
        <FloatingLabel label="Bokningsnummer">
          <input
            type="text"
            value={data.bookingNumber}
            onChange={(e) => onChange("bookingNumber", e.target.value)}
          />
        </FloatingLabel>
        <FloatingLabel label="Nytt bokningsnummer">
          <input
            type="text"
            value={data.newBookingNumber}
            onChange={(e) => onChange("newBookingNumber", e.target.value)}
          />
        </FloatingLabel>
        <FloatingLabel label="Extra notering">
          <input
            type="text"
            value={data.extraNote}
            onChange={(e) => onChange("extraNote", e.target.value)}
          />
        </FloatingLabel>
      </div>
      <FloatingLabel label="Anteckningar">
        <textarea
          rows={4}
          value={data.notesContent}
          onChange={(e) => onChange("notesContent", e.target.value)}
        ></textarea>
      </FloatingLabel>
    </div>
  );
}
