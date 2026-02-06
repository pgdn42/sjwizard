import { useState, useMemo, useEffect, useRef } from "react";
import type { ChatTemplateData } from "../types";
import PencilIcon from "../assets/PencilIcon";
import { ChatTemplateModal } from "./ChatTemplateModal";

// --- SVG Components for Flags ---
const FlagSE = () => (
  <svg viewBox="0 0 16 10" className="flag-icon" xmlns="http://www.w3.org/2000/svg">
    <rect width="16" height="10" fill="#006aa7" />
    <rect width="2" height="10" x="5" fill="#fecc00" />
    <rect width="16" height="2" y="4" fill="#fecc00" />
  </svg>
);

const FlagGB = () => (
  <svg viewBox="0 0 60 30" className="flag-icon" xmlns="http://www.w3.org/2000/svg">
    <rect width="60" height="30" fill="#012169" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" />
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
  </svg>
);

interface ChatModuleProps {
  chatTemplates: ChatTemplateData[];
  userId: string;
}

export function ChatModule({ chatTemplates, userId }: ChatModuleProps) {
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<ChatTemplateData | null>(null);

  // --- Navigation State ---
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedLang, setSelectedLang] = useState<"SE" | "EN">("SE");
  
  // Ref for auto-scrolling
  const listRef = useRef<HTMLDivElement>(null);

  // Filter: Matches if search text is in EITHER Swedish OR English label
  const filteredTemplates = useMemo(() => {
    return chatTemplates
      .filter((t) => {
        const query = searchText.toLowerCase();
        return (
          (t.labelSE && t.labelSE.toLowerCase().includes(query)) ||
          (t.labelEN && t.labelEN.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => a.labelSE.localeCompare(b.labelSE));
  }, [chatTemplates, searchText]);

  // --- Smart Selection Logic ---
  // When search results update, reset row to 0 AND detect best language match
  useEffect(() => {
    setSelectedIndex(0);

    if (filteredTemplates.length > 0 && searchText) {
      const firstMatch = filteredTemplates[0];
      const query = searchText.toLowerCase();
      
      const matchSE = firstMatch.labelSE?.toLowerCase().includes(query);
      const matchEN = firstMatch.labelEN?.toLowerCase().includes(query);

      // If the query exists in English label but NOT in Swedish label, default to English.
      // Otherwise (matches both or only Swedish), default to Swedish.
      if (matchEN && !matchSE) {
        setSelectedLang("EN");
      } else {
        setSelectedLang("SE");
      }
    } else {
      // If search is cleared, reset to default Swedish
      setSelectedLang("SE");
    }
  }, [filteredTemplates, searchText]);

  // Auto-scroll to selected item
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  const handleCopy = (content: string) => {
    if (content) {
      navigator.clipboard.writeText(content);
    }
  };

  const handleEditClick = (e: React.MouseEvent, template: ChatTemplateData) => {
    e.stopPropagation();
    setTemplateToEdit(template);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setTemplateToEdit(null);
    setIsModalOpen(true);
  };

  // --- Keyboard Navigation Handler ---
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredTemplates.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredTemplates.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "ArrowRight":
        e.preventDefault();
        setSelectedLang("EN");
        break;
      case "ArrowLeft":
        e.preventDefault();
        setSelectedLang("SE");
        break;
      case "Enter":
        e.preventDefault();
        const template = filteredTemplates[selectedIndex];
        if (template) {
          const content =
            selectedLang === "SE" ? template.contentSE : template.contentEN;
          handleCopy(content);
        }
        break;
    }
  };

  return (
    <div className="section-container chat-module-container">
      <div className="section-header" style={{ marginBottom: "10px" }}>
        <span className="section-title">Chat Templates</span>
      </div>

      <div className="chat-template-list" ref={listRef}>
        {filteredTemplates.map((t, index) => {
          const isOwner = t.ownerId === userId;
          const isSelected = index === selectedIndex;

          return (
            <div
              key={t.id}
              data-index={index}
              className={`chat-template-row ${isSelected ? "selected-row" : ""}`}
              onClick={() => setSelectedIndex(index)} 
            >
              {/* Swedish Button */}
              <button
                className={`chat-template-button ${
                  isSelected && selectedLang === "SE" ? "highlighted-btn" : ""
                }`}
                onClick={() => {
                  setSelectedIndex(index);
                  setSelectedLang("SE");
                  handleCopy(t.contentSE);
                }}
                title={t.contentSE}
              >
                <FlagSE /> {t.labelSE}
              </button>

              {/* English Button */}
              <button
                className={`chat-template-button ${
                  isSelected && selectedLang === "EN" ? "highlighted-btn" : ""
                }`}
                onClick={() => {
                  setSelectedIndex(index);
                  setSelectedLang("EN");
                  handleCopy(t.contentEN);
                }}
                title={t.contentEN}
              >
                <FlagGB /> {t.labelEN}
              </button>

              {/* Edit Icon */}
              {isOwner && (
                <button
                  className="row-edit-button"
                  onClick={(e) => handleEditClick(e, t)}
                  title="Edit Template"
                >
                  <PencilIcon />
                </button>
              )}
            </div>
          );
        })}
        {filteredTemplates.length === 0 && (
          <div className="no-templates-message">No templates found.</div>
        )}
      </div>

      <div className="template-controls" style={{ marginTop: "10px" }}>
        <div className="searchable-select">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyDown} 
            className="input"
          />
        </div>
        <button
          className="button-svg"
          title="Add New Chat Template"
          onClick={handleAddNew}
        >
          <span
            style={{ fontSize: "24px", fontWeight: "bold", lineHeight: 1 }}
          >
            +
          </span>
        </button>
      </div>

      <ChatTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        templateToEdit={templateToEdit}
        userId={userId}
      />
    </div>
  );
}