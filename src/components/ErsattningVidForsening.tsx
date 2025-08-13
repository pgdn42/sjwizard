import React from "react";
import { FloatingLabel } from "./FloatingLabel";
import CopyIcon from "../assets/copyIcon";
import CopyCheckIcon from "../assets/copyCheckIcon";
import CopyCrossIcon from "../assets/copyCrossIcon";

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
        <button className="button-svg" title="Kopiera försening mall">
          <CopyIcon />
        </button>
      </div>
      <div className="ersattning-input-group">
        <FloatingLabel label="Ärendenummer" className="width-small-medium">
          <input
            type="text"
            value={data.caseNumber}
            onChange={(e) => onChange("caseNumber", e.target.value)}
          />
        </FloatingLabel>
        <FloatingLabel label="Beslut" className="width-small">
          <select
            required
            value={data.decision}
            onChange={(e) => onChange("decision", e.target.value)}
          >
            <option value="denied">AVSLAG</option>
            <option value="25">25%</option>
            <option value="50">50%</option>
            <option value="75">75%</option>
            <option value="100">100%</option>
          </select>
        </FloatingLabel>
        <FloatingLabel label="Tågnummer" className="width-small">
          <input
            type="text"
            value={data.trainNumber}
            onChange={(e) => onChange("trainNumber", e.target.value)}
          />
        </FloatingLabel>
        <FloatingLabel label="Avgångsdatum" className="width-small-medium">
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
        <FloatingLabel label="Försening" className="width-small">
          <input
            type="number"
            value={data.delay}
            onChange={(e) => onChange("delay", e.target.value)}
          />
        </FloatingLabel>
      </div>
    </div>
  );
}
