import React, { useState } from "react";
import { ErsattningVidForsening } from "./components/ErsattningVidForsening";
import { Merkostnader } from "./components/Merkostnader";
import { Notes } from "./components/Notes";
import { Templates } from "./components/Templates";
import { Ticket } from "./components/Ticket";
import { Train } from "./components/Train";
import { Toolbar } from "./components/Toolbar";
import "./components/modules.css";

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
      category: "transport",
      decision: "approved",
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
    // A little logic to update the content when a template is selected
    if (section === "templates" && field === "selectedTemplate") {
      const newContent =
        value === "delay_reason_1"
          ? "Innehåll för förseningsorsak 1."
          : value === "delay_reason_2"
          ? "Innehåll för förseningsorsak 2."
          : "";
      setFormData((prevData) => ({
        ...prevData,
        templates: {
          ...prevData.templates,
          selectedTemplate: value,
          templateContent: newContent,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [section]: { ...prevData[section], [field]: value },
      }));
    }
  };

  return (
    <div className="app-container">
      <Toolbar>
        <button className="button-text">script</button>
        <button className="button-text">CHATT</button>
        <button className="button-text">SAMTAL</button>
        <button className="button-text">TCA</button>
        <button className="button-text">TRAFIKINFO</button>
      </Toolbar>
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
      <div className="row-container">
        <div className="ticket-container">
          <Ticket
            data={formData.ticket}
            onChange={(field, value) =>
              handleDataChange("ticket", field, value)
            }
          />
        </div>
        <div className="train-container">
          <Train />
        </div>
      </div>
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
