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
import type {
  FormData,
  CopyConfig,
  ErsattningData,
  MerkostnadData,
} from "./types";
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
import MagicWandIcon from "./assets/magicWandIcon";
import MagicWandIconFilled from "./assets/magicWandIconFilled";
import { Auth } from "./components/Auth";
import { defaultUserSettings } from "./data/defaultUserSettings";

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
}

// --- Helper to get today's date and time in YYYY-MM-DDTHH:MM format ---
const getTodayString = () => {
  const now = new Date();
  // Adjust for the local timezone offset
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  // Return the ISO string, sliced to the correct format for the input
  return now.toISOString().slice(0, 16);
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
    subCases: [],
  },
  ticket: { bookingNumber: "", cardNumber: "", cost: "" },
  merkostnader: {
    caseNumber: "",
    category: "",
    decision: "approved",
    compensation: "",
    subCases: [],
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

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [userSettings, setUserSettings] =
    useState<UserSettings>(defaultUserSettings);
  const [allTemplates, setAllTemplates] = useState<TemplateData[]>([]);
  const [isExtractionEnabled, setExtractionEnabled] = useState(false);

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
      setUserSettings(defaultUserSettings);
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

  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.type !== "EXTRACTED_VALUES") return;

      const scrapedData = message.payload;
      console.log("Received data:", scrapedData);

      setFormData((prevData) => {
        // Create a deep copy to safely modify nested state
        const newData = JSON.parse(JSON.stringify(prevData));
        const { caseType, mainCaseNumber, caseNumber, ...restOfData } =
          scrapedData;

        // Helper to get a "signature" of a case for merging Ersättning cases
        const getSignature = (caseData: any) =>
          [
            caseData.trainNumber,
            caseData.departureDate,
            caseData.departureStation,
            caseData.arrivalStation,
          ].join("|");

        // --- SUB-CASE LOGIC (A Huvudärende number was found) ---
        if (mainCaseNumber && caseNumber) {
          // Check if this is a Merkostnad sub-case
          const isMerkostnadSubCase = caseType === "Kundserviceärende";

          if (isMerkostnadSubCase) {
            newData.merkostnader.caseNumber = mainCaseNumber;
            let subCase = newData.merkostnader.subCases.find(
              (sc: MerkostnadData) => sc.caseNumber === caseNumber
            );

            if (subCase) {
              // If it exists, update it
              Object.assign(subCase, restOfData);
              if (scrapedData.underkategori)
                subCase.category = scrapedData.underkategori;
              // Rule 2: Update compensation for existing sub-case
              if (scrapedData.compensation)
                subCase.compensation = scrapedData.compensation;
            } else {
              // If not, create it
              newData.merkostnader.subCases.push({
                id: `subcase-merk-${Date.now()}`,
                caseNumber: caseNumber,
                category: scrapedData.underkategori || "food",
                decision: "approved",
                // Rule 2: Set compensation for new sub-case
                compensation: scrapedData.compensation || "",
              });
            }
            // Always update the related Ersättning case from the description
            if (scrapedData.relatedErsattningCase) {
              newData.ersattning.caseNumber = scrapedData.relatedErsattningCase;
            }
          }
          // Otherwise, assume it's an Ersättning sub-case
          else {
            const ersattning = newData.ersattning;
            ersattning.caseNumber = mainCaseNumber;

            let subCaseToUpdate = ersattning.subCases.find(
              (sc: ErsattningData) => sc.caseNumbers?.includes(caseNumber)
            );

            if (subCaseToUpdate) {
              Object.assign(subCaseToUpdate, restOfData);
            } else {
              const newSubCase: ErsattningData = {
                id: `subcase-${Date.now()}`,
                caseNumbers: [caseNumber],
                ...initialFormData.ersattning,
                ...restOfData,
              };
              ersattning.subCases.push(newSubCase);
              subCaseToUpdate = newSubCase;
            }

            if (subCaseToUpdate) {
              const currentSignature = getSignature(subCaseToUpdate);
              if (currentSignature !== "|||") {
                // Don't merge empty cases
                const mergeTarget = ersattning.subCases.find(
                  (sc: ErsattningData) =>
                    sc.id !== subCaseToUpdate.id &&
                    getSignature(sc) === currentSignature
                );

                if (mergeTarget) {
                  mergeTarget.caseNumbers = [
                    ...new Set([
                      ...mergeTarget.caseNumbers!,
                      ...subCaseToUpdate.caseNumbers!,
                    ]),
                  ];
                  ersattning.subCases = ersattning.subCases.filter(
                    (sc: ErsattningData) => sc.id !== subCaseToUpdate.id
                  );
                }
              }
            }
          }
        }
        // --- MAIN CASE & STANDARD CASE LOGIC ---
        else if (caseNumber) {
          // This handles all cases that are not sub-cases

          // First, update all possible fields from the scraped data
          const mapping = {
            departureStation: {
              section: "ersattning",
              field: "departureStation",
            },
            arrivalStation: { section: "ersattning", field: "arrivalStation" },
            trainNumber: { section: "ersattning", field: "trainNumber" },
            delay: { section: "ersattning", field: "delay" },
            departureDate: { section: "ersattning", field: "departureDate" },
            bookingNumber: { section: "ticket", field: "bookingNumber" },
            cost: { section: "ticket", field: "cost" },
            cardNumber: { section: "ticket", field: "cardNumber" },
            // Rule 2: Ensure compensation is mapped for standard cases
            compensation: { section: "merkostnader", field: "compensation" },
          };

          Object.entries(scrapedData).forEach(([key, value]) => {
            if (value && (mapping as any)[key]) {
              const { section, field } = (mapping as any)[key];
              if ((newData as any)[section]) {
                (newData as any)[section][field] = value;
              }
            }
          });

          // Second, set the primary case numbers and specific fields based on case type
          if (caseType === "Huvudärende - Merkostnad") {
            newData.merkostnader.caseNumber = caseNumber;
            if (scrapedData.relatedErsattningCase) {
              newData.ersattning.caseNumber = scrapedData.relatedErsattningCase;
            }
          } else if (caseType === "Kundserviceärende") {
            newData.merkostnader.caseNumber = caseNumber;
            newData.ersattning.caseNumber =
              scrapedData.relatedErsattningCase ||
              newData.ersattning.caseNumber;
            // Rule 1: Set Kategori from Underkategori
            if (scrapedData.underkategori) {
              newData.merkostnader.category = scrapedData.underkategori;
            }
          } else {
            // This is a standard Ersättning case or Huvudärende - RTG
            newData.ersattning.caseNumber = caseNumber;
          }
        }
        return newData;
      });
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  const templateOptions: TemplateOption[] = useMemo(() => {
    return allTemplates.map((template) => ({
      value: template.id,
      label: template.label,
    }));
  }, [allTemplates]);

  const handleMerkostnadSubCaseChange = (
    subCaseId: string,
    field: string,
    value: string
  ) => {
    setFormData((prevData) => {
      const newSubCases = prevData.merkostnader.subCases.map((sc) =>
        sc.id === subCaseId ? { ...sc, [field]: value } : sc
      );
      return {
        ...prevData,
        merkostnader: { ...prevData.merkostnader, subCases: newSubCases },
      };
    });
  };

  const handleDeleteMerkostnadSubCase = (subCaseId: string) => {
    setFormData((prevData) => {
      const newSubCases = prevData.merkostnader.subCases.filter(
        (sc) => sc.id !== subCaseId
      );
      return {
        ...prevData,
        merkostnader: { ...prevData.merkostnader, subCases: newSubCases },
      };
    });
  };

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

  const handleSubCaseDataChange = (
    subCaseId: string,
    field: string,
    value: string
  ) => {
    setFormData((prevData) => {
      const newSubCases = prevData.ersattning.subCases.map((sc) =>
        sc.id === subCaseId ? { ...sc, [field]: value } : sc
      );
      return {
        ...prevData,
        ersattning: {
          ...prevData.ersattning,
          subCases: newSubCases,
        },
      };
    });
  };

  const handleDeleteSubCase = (subCaseId: string) => {
    setFormData((prevData) => {
      const newSubCases = prevData.ersattning.subCases.filter(
        (sc) => sc.id !== subCaseId
      );
      return {
        ...prevData,
        ersattning: { ...prevData.ersattning, subCases: newSubCases },
      };
    });
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
    if (!currentUser) return;
    const {
      trainNumber,
      departureStation,
      arrivalStation,
      delay,
      departureDate,
    } = formData.ersattning;
    if (!trainNumber.trim() || !delay.trim()) {
      alert("Please enter at least a train number and delay before saving.");
      return;
    }
    const trainData = {
      trainNumber,
      departureStation,
      arrivalStation,
      delay: parseInt(delay, 10) || 0,
      departureDate,
      ownerId: currentUser.uid,
      createdAt: new Date().toISOString(),
    };
    try {
      await addDocument("delayedTrains", trainData);
      handleClear();
    } catch (error) {
      console.error("Error saving train data:", error);
      alert("Failed to save train data. Please try again.");
    }
  };

  const toggleExtraction = () => {
    const newState = !isExtractionEnabled;
    setExtractionEnabled(newState);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { type: "TOGGLE_EXTRACTION", payload: newState },
          () => {
            if (chrome.runtime.lastError) {
              console.warn(
                "SJ Wizard: Could not connect to the content script. Try refreshing the Siebel page."
              );
            }
          }
        );
      }
    });
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
          className={`button-svg ${isExtractionEnabled ? "active" : ""}`}
          title="Toggle Siebel Data Extraction"
          onClick={toggleExtraction}
        >
          {isExtractionEnabled ? <MagicWandIconFilled /> : <MagicWandIcon />}
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
        onSubCaseChange={handleSubCaseDataChange}
        onDeleteSubCase={handleDeleteSubCase}
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
        onSubCaseChange={handleMerkostnadSubCaseChange}
        onDeleteSubCase={handleDeleteMerkostnadSubCase}
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
