// src/components/Notes.tsx

import { FloatingLabel } from "./FloatingLabel";
import TrashcanIcon from "../assets/trashcanIcon";
import type { FormData, ModuleCopyConfig } from "../types"; // <-- Import FormData
import { DynamicButtonRow } from "./DynamicButtonRow";

interface NotesProps {
  data: FormData;
  onChange: (field: string, value: string) => void;
  onClear: () => void;
  customButtons: ModuleCopyConfig;
}

export function Notes({ data, onChange, onClear, customButtons }: NotesProps) {
  return (
    <div className="section-container">
      <div className="section-header">
        <span className="section-title">Noteringar</span>
        <div>
          <DynamicButtonRow
            buttons={customButtons}
            formData={data}
            onClear={onClear}
          />
        </div>
      </div>
      <div className="notes-input-group">
        <FloatingLabel label="Bokningsnummer">
          <input
            type="text"
            value={data.notes.bookingNumber}
            onChange={(e) => onChange("bookingNumber", e.target.value)}
          />
        </FloatingLabel>
        <FloatingLabel label="Nytt bokningsnummer">
          <input
            type="text"
            value={data.notes.newBookingNumber}
            onChange={(e) => onChange("newBookingNumber", e.target.value)}
          />
        </FloatingLabel>
        <FloatingLabel label="Extra notering">
          <input
            type="text"
            value={data.notes.extraNote}
            onChange={(e) => onChange("extraNote", e.target.value)}
          />
        </FloatingLabel>
      </div>
      <FloatingLabel label="Anteckningar">
        <textarea
          rows={4}
          value={data.notes.notesContent}
          onChange={(e) => onChange("notesContent", e.target.value)}
        ></textarea>
      </FloatingLabel>
    </div>
  );
}
