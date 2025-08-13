import React from "react";
import { FloatingLabel } from "./FloatingLabel";
import TrashcanIcon from "../assets/trashcanIcon";

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
        <button className="button-svg" title="Clear all fields">
          <TrashcanIcon />
        </button>
      </div>
      <div className="form-grid-single-col">
        <FloatingLabel label="Bokningsnummer">
          <input
            type="text"
            value={data.bookingNumber}
            onChange={(e) => onChange("bookingNumber", e.target.value)}
          />
        </FloatingLabel>
        <FloatingLabel label="Beställningsnummer">
          <input
            type="text"
            value={data.cost}
            onChange={(e) => onChange("cost", e.target.value)}
          />
        </FloatingLabel>
        <FloatingLabel label="Kortnummer">
          <input
            type="text"
            value={data.cardNumber}
            onChange={(e) => onChange("cardNumber", e.target.value)}
          />
        </FloatingLabel>
      </div>
    </div>
  );
}
