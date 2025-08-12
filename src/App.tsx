import React, { useState } from "react";
import { ErsattningVidForsening } from "./components/ErsattningVidForsening";
import { Merkostnader } from "./components/Merkostnader";
import { Notes } from "./components/Notes";
import { Templates } from "./components/Templates";
import { Ticket } from "./components/Ticket";
import { Train } from "./components/Train";
import "./components/modules.css";

// The FormData interface remains the same
export interface FormData {
  ersattning: {
    caseNumber: string;
    decision: string;
    trainNumber: string;
    departureDate: string;
    departureStation: string;
    arrivalStation: string;
    delay: string;
    producer: string;
  };
  ticket: { bookingNumber: string; cardNumber: string; cost: string };
  merkostnader: {
    caseNumber: string;
    category: string;
    decision: string;
    compensation: string;
  };
  templates: { selectedTemplate: string; templateContent: string };
  notes: {
    bookingNumber: string;
    newBookingNumber: string;
    extraNote: string;
    notesContent: string;
  };
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    ersattning: {
      caseNumber: "",
      decision: "",
      trainNumber: "",
      departureDate: "2025-08-12",
      departureStation: "",
      arrivalStation: "",
      delay: "",
      producer: "",
    },
    ticket: { bookingNumber: "", cardNumber: "", cost: "" },
    merkostnader: {
      caseNumber: "",
      category: "",
      decision: "",
      compensation: "",
    },
    templates: { selectedTemplate: "", templateContent: "" },
    notes: {
      bookingNumber: "",
      newBookingNumber: "",
      extraNote: "",
      notesContent: "",
    },
  });

  const handleDataChange = (
    section: keyof FormData,
    field: string,
    value: string
  ) => {
    setFormData((prevData) => ({
      ...prevData,
      [section]: { ...prevData[section], [field]: value },
    }));
  };

  return (
    <div className="app-container">
      {/* The entire app is a two-column layout */}
      <ErsattningVidForsening
        data={formData.ersattning}
        onChange={(field, value) =>
          handleDataChange("ersattning", field, value)
        }
      />
      <Merkostnader
        data={formData.merkostnader}
        onChange={(field, value) =>
          handleDataChange("merkostnader", field, value)
        }
      />
      <Ticket
        data={formData.ticket}
        onChange={(field, value) => handleDataChange("ticket", field, value)}
      />
      <Train />
      <Templates
        data={formData.templates}
        onChange={(field, value) => handleDataChange("templates", field, value)}
      />
      <Notes
        data={formData.notes}
        onChange={(field, value) => handleDataChange("notes", field, value)}
      />
    </div>
  );
}

export default App;
