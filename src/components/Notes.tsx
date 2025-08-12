import React from "react";
import { FloatingLabel } from "./FloatingLabel";
import CopyIcon from "../assets/copyIcon";

interface NotesProps {
  data: {
    bookingNumber: string;
    newBookingNumber: string;
    extraNote: string;
    notesContent: string;
  };
  onChange: (field: string, value: string) => void;
}

export function Notes({ data, onChange }: NotesProps) {
  return (
    <div className="section-container">
      <div className="section-header">
        <span>Noteringar</span>
        <button className="button-svg" title="Kopiera trafikstörning">
          Trafikstörning
          <CopyIcon />
        </button>
        <button className="button-svg" title="Kopiera byte av avgång">
          Byte av avgång
          <CopyIcon />
        </button>
        <button className="button-svg" title="Kopiera undantag">
          Undantagsåterköp
          <CopyIcon />
        </button>
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
