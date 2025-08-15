import { FloatingLabel } from "./FloatingLabel";
import { DynamicButtonRow } from "./DynamicButtonRow";
import type { ModuleCopyConfig } from "../types";

interface TicketProps {
  data: {
    ersattning: any;
    ticket: {
      bookingNumber: string;
      cost: string;
      cardNumber: string;
    };
    merkostnader: any;
    templates: any;
    notes: any;
    train: any;
  };
  customButtons: ModuleCopyConfig;
  onChange: (field: string, value: string) => void;
  onClear: () => void;
}

export function Ticket({
  data,
  onChange,
  onClear,
  customButtons,
}: TicketProps) {
  return (
    <div className="section-container">
      <div className="section-header">
        <span className="section-title">Biljett</span>
        <div className="buttons-wrapper">
          <DynamicButtonRow
            buttons={customButtons}
            formData={data}
            onClear={onClear}
          />
        </div>
      </div>
      <div className="form-grid-single-col">
        <FloatingLabel label="Bokningsnummer">
          <input
            type="text"
            value={data.ticket.bookingNumber}
            onChange={(e) => onChange("bookingNumber", e.target.value)}
          />
        </FloatingLabel>
        <FloatingLabel label="Beställningsnummer">
          <input
            type="text"
            value={data.ticket.cost}
            onChange={(e) => onChange("cost", e.target.value)}
          />
        </FloatingLabel>
        <FloatingLabel label="Kortnummer">
          <input
            type="text"
            value={data.ticket.cardNumber}
            onChange={(e) => onChange("cardNumber", e.target.value)}
          />
        </FloatingLabel>
      </div>
    </div>
  );
}
