import React from "react";

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
      </div>
      {/* Use the new three-column grid here */}
      <div className="form-grid-three-col">
        <input
          type="text"
          placeholder="Bokningsnummer"
          value={data.bookingNumber}
          onChange={(e) => onChange("bookingNumber", e.target.value)}
        />
        <input
          type="text"
          placeholder="Nytt bokningsnummer"
          value={data.newBookingNumber}
          onChange={(e) => onChange("newBookingNumber", e.target.value)}
        />
        <input
          type="text"
          placeholder="Extra notering"
          value={data.extraNote}
          onChange={(e) => onChange("extraNote", e.target.value)}
        />
      </div>
      <textarea
        placeholder="Anteckningar"
        rows={4} /* Reduced row count */
        style={{ marginTop: "0px" }}
        value={data.notesContent}
        onChange={(e) => onChange("notesContent", e.target.value)}
      ></textarea>
    </div>
  );
}
