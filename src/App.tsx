import { useState, useEffect, useMemo } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "./services/firebase";
import { ErsattningVidForsening } from "./components/ErsattningVidForsening";
import { Merkostnader } from "./components/Merkostnader";
import { Notes } from "./components/Notes";
import { Templates } from "./components/Templates";
import { Ticket } from "./components/Ticket";
import { Train } from "./components/Train";
import { Toolbar } from "./components/Toolbar";
import { SettingsModal } from "./components/SettingsModal";
import type { FormData, CopyConfig } from "./types";
import {
  onCollectionUpdate,
  getUserSettings,
  createUserSettings,
  updateUserSettings,
  addDocument,
} from "./services/firestoreService";
import { replaceTemplateVariables } from "./utils";
import "./components/modules.css";
import TrashcanIcon from "./assets/trashcanIcon";
import SettingsIcon from "./assets/settingsIcon";
import AddToListIcon from "./assets/addToListIcon";
import { Auth } from "./components/Auth";

// --- Interfaces ---
interface TemplateData {
  id: string;
  label: string;
  content: string;
}

interface TemplateOption {
  value: string;
  label: string;
}

export interface UserSettings {
  copyConfig: CopyConfig;
  // Add future settings here, e.g., theme?: "dark" | "light";
}
const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};
// --- Initial Data ---
const initialFormData: FormData = {
  ersattning: {
    caseNumber: "",
    decision: "AVSLAG",
    trainNumber: "",
    departureDate: getTodayString(),
    departureStation: "",
    arrivalStation: "",
    delay: "",
    producer: "",
  },
  ticket: { bookingNumber: "", cardNumber: "", cost: "" },
  merkostnader: {
    caseNumber: "",
    category: "",
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
  train: {},
};

const defaultUserSettings: UserSettings = {
  copyConfig: {
    ersattning: [
      {
        id: "btn_ersattning_default",
        label: "Default",
        icon: "CopyIcon",
        type: "copy",
        displayType: "icon",
        template: [
          {
            id: "caseNumber-1",
            fieldId: "caseNumber",
            moduleId: "ersattning",
            label: "Ärendenummer",
            type: "field",
            enabled: true,
          },
          {
            id: "static-1",
            label: "Static Text",
            type: "static",
            value: "EVF",
            enabled: true,
          },
          {
            id: "decision-1",
            fieldId: "decision",
            moduleId: "ersattning",
            label: "Beslut",
            type: "field",
            enabled: true,
          },
          {
            id: "static-2",
            label: "Static Text",
            type: "static",
            value: "TÅG",
            enabled: true,
          },
          {
            id: "trainNumber-1",
            fieldId: "trainNumber",
            moduleId: "ersattning",
            label: "Tågnummer",
            type: "field",
            enabled: true,
          },
          {
            id: "departureDate-1",
            fieldId: "departureDate",
            moduleId: "ersattning",
            label: "Avgångsdatum",
            type: "field",
            enabled: true,
          },
          {
            id: "static-4",
            label: "Static Text",
            type: "static",
            value: "[",
            enabled: true,
          },
          {
            id: "datetime-1",
            label: "Current Date/Time",
            type: "datetime",
            enabled: true,
          },
          {
            id: "static-5",
            label: "Static Text",
            type: "static",
            value: "]",
            enabled: true,
          },
        ],
      },
    ],
    merkostnader: [
      {
        id: "btn_merkostnader_approved",
        label: "Approved",
        icon: "CopyCheckIcon",
        type: "copy",
        displayType: "icon",
        template: [
          {
            id: "static-approved-1",
            label: "Static Text",
            type: "static",
            value: "Godkänt ärende:",
            enabled: true,
          },
          {
            id: "caseNumber-approved-1",
            fieldId: "caseNumber",
            moduleId: "merkostnader",
            label: "Ärendenummer",
            type: "field",
            enabled: true,
          },
        ],
      },
      {
        id: "btn_merkostnader_denied",
        label: "Denied",
        icon: "CopyCrossIcon",
        type: "copy",
        displayType: "icon",
        template: [
          {
            id: "static-denied-1",
            label: "Static Text",
            type: "static",
            value: "Nekat ärende:",
            enabled: true,
          },
          {
            id: "caseNumber-denied-1",
            fieldId: "caseNumber",
            moduleId: "merkostnader",
            label: "Ärendenummer",
            type: "field",
            enabled: true,
          },
        ],
      },
      {
        id: "btn_merkostnader_caseNote",
        label: "Case Note",
        icon: "CopyIcon",
        type: "copy",
        displayType: "icon",
        template: [
          {
            id: "static-note-1",
            label: "Static Text",
            type: "static",
            value: "Notering:",
            enabled: true,
          },
          {
            id: "caseNumber-note-1",
            fieldId: "caseNumber",
            moduleId: "merkostnader",
            label: "Ärendenummer",
            type: "field",
            enabled: true,
          },
        ],
      },
    ],
    notes: [
      {
        id: "btn_notes_trafikstorning",
        label: "Trafikstörning",
        icon: "CopyIcon",
        type: "copy",
        displayType: "icon",
        template: [
          {
            id: "static-trafik-1",
            label: "Static Text",
            type: "static",
            value: "Trafikstörning: Bknr",
            enabled: true,
          },
          {
            id: "bookingNumber-trafik-1",
            fieldId: "bookingNumber",
            moduleId: "notes",
            label: "Bokningsnummer",
            type: "field",
            enabled: true,
          },
        ],
      },
      {
        id: "btn_notes_byteAvAvgang",
        label: "Byte av avgång",
        icon: "CopyIcon",
        type: "copy",
        displayType: "icon",
        template: [
          {
            id: "static-byte-1",
            label: "Static Text",
            type: "static",
            value: "Byte av avgång: Gammalt bknr",
            enabled: true,
          },
          {
            id: "bookingNumber-byte-1",
            fieldId: "bookingNumber",
            moduleId: "notes",
            label: "Bokningsnummer",
            type: "field",
            enabled: true,
          },
          {
            id: "static-byte-2",
            label: "Static Text",
            type: "static",
            value: ", nytt bknr",
            enabled: true,
          },
          {
            id: "newBookingNumber-byte-1",
            fieldId: "newBookingNumber",
            moduleId: "notes",
            label: "Nytt bokningsnummer",
            type: "field",
            enabled: true,
          },
        ],
      },
      {
        id: "btn_notes_undantagsaterkop",
        label: "Undantagsåterköp",
        icon: "CopyIcon",
        type: "copy",
        displayType: "icon",
        template: [
          {
            id: "static-undantag-1",
            label: "Static Text",
            type: "static",
            value: "Undantagsåterköp: Bknr",
            enabled: true,
          },
          {
            id: "bookingNumber-undantag-1",
            fieldId: "bookingNumber",
            moduleId: "notes",
            label: "Bokningsnummer",
            type: "field",
            enabled: true,
          },
        ],
      },
    ],
    ticket: [
      {
        id: "btn_ticket_copy",
        label: "Copy Ticket",
        icon: "CopyIcon",
        type: "copy",
        displayType: "icon",
        template: [
          {
            id: "bookingNumber-ticket-1",
            fieldId: "bookingNumber",
            moduleId: "ticket",
            label: "Bokningsnummer",
            type: "field",
            enabled: true,
          },
          {
            id: "cardNumber-ticket-1",
            fieldId: "cardNumber",
            moduleId: "ticket",
            label: "Kortnummer",
            type: "field",
            enabled: true,
          },
          {
            id: "cost-ticket-1",
            fieldId: "cost",
            moduleId: "ticket",
            label: "Kostnad",
            type: "field",
            enabled: true,
          },
        ],
      },
    ],
    train: [],
  },
};

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [userSettings, setUserSettings] =
    useState<UserSettings>(defaultUserSettings);
  const [allTemplates, setAllTemplates] = useState<TemplateData[]>([]);

  // Effect to listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Effect to load all user data (templates and settings)
  useEffect(() => {
    if (!currentUser) {
      setAllTemplates([]);
      setUserSettings(defaultUserSettings); // Reset to default on logout
      setIsLoading(false);
      return;
    }

    const unsubscribeTemplates = onCollectionUpdate(
      "templates",
      currentUser.uid,
      (fetchedTemplates) => {
        const templates = fetchedTemplates.map((t) => ({
          id: t.id,
          label: t.label || "Untitled",
          content: t.content || "",
        }));
        setAllTemplates(templates);
      }
    );

    const loadUserSettings = async () => {
      const settings = (await getUserSettings(
        currentUser.uid
      )) as UserSettings | null;
      if (settings) {
        setUserSettings(settings);
      } else {
        await createUserSettings(currentUser.uid, defaultUserSettings);
        setUserSettings(defaultUserSettings);
      }
      setIsLoading(false);
    };

    loadUserSettings();

    return () => unsubscribeTemplates();
  }, [currentUser]);

  const templateOptions: TemplateOption[] = useMemo(() => {
    return allTemplates.map((template) => ({
      value: template.id,
      label: template.label,
    }));
  }, [allTemplates]);

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

  const handleClear = (section?: keyof FormData) => {
    if (section) {
      setFormData((prevData) => ({
        ...prevData,
        [section]: initialFormData[section],
      }));
    } else {
      setFormData(initialFormData);
    }
  };

  const handleClearAndSaveTrain = async () => {
    if (!currentUser) return; // Make sure user is logged in

    const {
      trainNumber,
      departureStation,
      arrivalStation,
      delay,
      departureDate,
    } = formData.ersattning;

    // Basic validation: ensure we have at least a train number and delay
    if (!trainNumber.trim() || !delay.trim()) {
      alert("Please enter at least a train number and delay before saving.");
      return;
    }

    const trainData = {
      trainNumber,
      departureStation,
      arrivalStation,
      delay: parseInt(delay, 10) || 0, // Store delay as a number
      departureDate,
      ownerId: currentUser.uid,
      createdAt: new Date().toISOString(),
    };

    try {
      await addDocument("delayedTrains", trainData);
      handleClear(); // Clear all fields after successful save
    } catch (error) {
      console.error("Error saving train data:", error);
      alert("Failed to save train data. Please try again.");
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const selected = allTemplates.find((t) => t.id === templateId);
    if (selected) {
      const processedContent = replaceTemplateVariables(
        selected.content,
        formData
      );
      navigator.clipboard.writeText(processedContent);
      setFormData((prev) => ({
        ...prev,
        templates: {
          selectedTemplate: templateId,
          templateContent: selected.content,
        },
      }));
    }
  };

  const handleLogout = () => {
    signOut(auth).catch((error) => console.error("Logout Error:", error));
  };

  const handleSettingsSave = async (newSettings: UserSettings) => {
    if (!currentUser) return;
    setUserSettings(newSettings);
    await updateUserSettings(currentUser.uid, newSettings);
  };

  if (isLoading) {
    return <div className="app-container">Loading...</div>;
  }

  if (!currentUser) {
    return <Auth />;
  }

  return (
    <div className="app-container">
      <Toolbar>
        <button
          className="button-svg"
          title="Settings"
          onClick={() => setSettingsOpen(true)}
        >
          <SettingsIcon />
        </button>
        <button
          className="button-svg"
          title="Save train info and clear all fields"
          onClick={handleClearAndSaveTrain}
        >
          <AddToListIcon />
        </button>
        <button
          className="button-svg"
          title="Clear all fields"
          onClick={() => handleClear()}
        >
          <TrashcanIcon />
        </button>
      </Toolbar>
      <ErsattningVidForsening
        data={formData}
        onChange={(field, value) =>
          handleDataChange("ersattning", field, value)
        }
        onClear={() => handleClear("ersattning")}
        customButtons={userSettings.copyConfig.ersattning || []}
      />
      <Merkostnader
        data={formData}
        onChange={(field, value) =>
          handleDataChange("merkostnader", field, value)
        }
        onClear={() => handleClear("merkostnader")}
        customButtons={userSettings.copyConfig.merkostnader || []}
      />
      <div className="row-container">
        <div className="ticket-container">
          <Ticket
            data={formData}
            onChange={(field, value) =>
              handleDataChange("ticket", field, value)
            }
            onClear={() => handleClear("ticket")}
            customButtons={userSettings.copyConfig.ticket || []}
          />
        </div>
        <div className="train-container">
          <Train
            data={formData}
            customButtons={userSettings.copyConfig.train || []}
            userId={currentUser.uid}
          />
        </div>
      </div>
      <Templates
        selectedTemplateId={formData.templates.selectedTemplate}
        onSelectTemplate={handleTemplateSelect}
        allTemplates={allTemplates}
        templateOptions={templateOptions}
        userId={currentUser.uid}
        data={formData}
        customButtons={userSettings.copyConfig.templates || []}
      />
      <Notes
        data={formData}
        onChange={(field, value) => handleDataChange("notes", field, value)}
        onClear={() => handleClear("notes")}
        customButtons={userSettings.copyConfig.notes || []}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
        userSettings={userSettings}
        onSave={handleSettingsSave}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;
