import React from "react";
import { FloatingLabel } from "./FloatingLabel";

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
    <div className="section-container">
      <div className="section-header">
        <span>Biljett</span>
      </div>
      <div className="form-grid-single-col">
        <FloatingLabel label="Bokningsnummer">
          <input
            type="text"
            value={data.bookingNumber}
            onChange={(e) => onChange("bookingNumber", e.target.value)}
          />
        </FloatingLabel>
        <FloatingLabel label="Kortnummer">
          <input
            type="text"
            value={data.cardNumber}
            onChange={(e) => onChange("cardNumber", e.target.value)}
          />
        </FloatingLabel>
        <FloatingLabel label="Biljettkostnad">
          <input
            type="text"
            value={data.cost}
            onChange={(e) => onChange("cost", e.target.value)}
          />
        </FloatingLabel>
      </div>
    </div>
  );
}
