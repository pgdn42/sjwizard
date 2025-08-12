import React from "react";

interface TicketProps {
  data: {
    bookingNumber: string;
    cardNumber: string;
    cost: string;
  };
  onChange: (field: string, value: string) => void;
}

export function Ticket({ data, onChange }: TicketProps) {
  return (
    <div className="section-container" style={{ maxWidth: "150px" }}>
      <div className="section-header">
        <span>Biljett</span>
      </div>
      <div className="form-grid-single-col">
        <input
          type="text"
          placeholder="Bokningsnummer"
          value={data.bookingNumber}
          onChange={(e) => onChange("bookingNumber", e.target.value)}
        />
        <input
          type="text"
          placeholder="Kortnummer"
          value={data.cardNumber}
          onChange={(e) => onChange("cardNumber", e.target.value)}
        />
        <input
          type="text"
          placeholder="Biljett kostnad"
          value={data.cost}
          onChange={(e) => onChange("cost", e.target.value)}
        />
      </div>
    </div>
  );
}
