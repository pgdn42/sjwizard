import React from "react";
import { FloatingLabel } from "./FloatingLabel";

interface ErsattningProps {
  data: {
    caseNumber: string;
    decision: string;
    trainNumber: string;
    departureDate: string;
    departureStation: string;
    arrivalStation: string;
    delay: string;
    producer: string;
  };
  onChange: (field: string, value: string) => void;
}

export function ErsattningVidForsening({ data, onChange }: ErsattningProps) {
  return (
    <div className="section-container">
      <div className="section-header">
        <span>Ersättning vid försening</span>
      </div>
      <div className="ersattning-input-group">
        <FloatingLabel label="Ärendenummer" className="width-large">
          <input
            type="text"
            value={data.caseNumber}
            onChange={(e) => onChange("caseNumber", e.target.value)}
          />
        </FloatingLabel>
        <FloatingLabel label="Beslut" className="width-small">
          <input
            type="text"
            value={data.decision}
            onChange={(e) => onChange("decision", e.target.value)}
          />
        </FloatingLabel>
        <FloatingLabel label="Tågnummer" className="width-small">
          <input
            type="text"
            value={data.trainNumber}
            onChange={(e) => onChange("trainNumber", e.target.value)}
          />
        </FloatingLabel>
        <FloatingLabel label="Avgångsdatum" className="width-large">
          <input
            type="date"
            value={data.departureDate}
            onChange={(e) => onChange("departureDate", e.target.value)}
          />
        </FloatingLabel>
      </div>
      <div className="ersattning-input-group">
        <FloatingLabel label="Avgångsstation" className="width-large">
          <input
            type="text"
            value={data.departureStation}
            onChange={(e) => onChange("departureStation", e.target.value)}
          />
        </FloatingLabel>
        <FloatingLabel label="Ankomststation" className="width-large">
          <input
            type="text"
            value={data.arrivalStation}
            onChange={(e) => onChange("arrivalStation", e.target.value)}
          />
        </FloatingLabel>
      </div>
    </div>
  );
}
