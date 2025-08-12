import React from "react";

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
        <input
          className="width-large"
          type="text"
          placeholder="Ärendenummer"
          value={data.caseNumber}
          onChange={(e) => onChange("caseNumber", e.target.value)}
        />
        <input
          className="width-small"
          type="text"
          placeholder="Beslut"
          value={data.decision}
          onChange={(e) => onChange("decision", e.target.value)}
        />
        <input
          className="width-small"
          type="text"
          placeholder="Tågnummer"
          value={data.trainNumber}
          onChange={(e) => onChange("trainNumber", e.target.value)}
        />
        <input
          className="width-large"
          type="date"
          value={data.departureDate}
          onChange={(e) => onChange("departureDate", e.target.value)}
        />
      </div>
      <div className="ersattning-input-group">
        <input
          className="width-large"
          type="text"
          placeholder="Avgångsstation"
          value={data.departureStation}
          onChange={(e) => onChange("departureStation", e.target.value)}
        />
        <input
          className="width-large"
          type="text"
          placeholder="Ankomststation"
          value={data.arrivalStation}
          onChange={(e) => onChange("arrivalStation", e.target.value)}
        />
      </div>
    </div>
  );
}
