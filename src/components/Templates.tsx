// src/components/Templates.tsx
import { useState, useMemo, useRef, useEffect } from "react";
import PencilIcon from "../assets/PencilIcon";
import { DynamicButtonRow } from "./DynamicButtonRow";
import type { ModuleCopyConfig } from "../types";
import { replaceTemplateVariables } from "../utils";
import { TemplateModal } from "./TemplateModal";

// --- SVG Flags ---
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

interface TemplatesProps {
  onSelectTemplate: (id: string) => void;
  allTemplates: any[]; 
  userId: string;
  customButtons: ModuleCopyConfig;
  data: any;
  templateOptions: any[]; 
}

export function Templates({
  onSelectTemplate, 
  allTemplates,
  userId,
  customButtons,
  data,
}: TemplatesProps) {
  const [searchText, setSearchText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [selectedLang, setSelectedLang] = useState<"SE" | "EN">("SE");
  
  // Modal State
  const [isModalOpen, setModalOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<any | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // --- Filter Logic ---
  const filteredTemplates = useMemo(() => {
    if (!searchText) return allTemplates;
    const lower = searchText.toLowerCase();
    return allTemplates.filter((t) => {
      const labelSE = t.labelSE || t.label || "";
      const labelEN = t.labelEN || "";
      return labelSE.toLowerCase().includes(lower) || labelEN.toLowerCase().includes(lower);
    });
  }, [allTemplates, searchText]);

  // --- Reset Highlight on Search ---
  useEffect(() => {
    setHighlightedIndex(0);
    setSelectedLang("SE");
  }, [searchText]);

  // --- Auto-scroll to Highlighted Item ---
  useEffect(() => {
    if (isOpen && listRef.current && listRef.current.children[highlightedIndex]) {
      const activeElement = listRef.current.children[highlightedIndex] as HTMLElement;
      activeElement.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  // --- Close dropdown on outside click ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Copy Logic ---
  const handleCopy = (template: any, lang: "SE" | "EN") => {
    let contentToProcess = "";
    
    if (lang === "SE") {
      // Prioritize explicit SE content, fall back to legacy 'content'
      contentToProcess = template.contentSE || template.content || "";
    } else {
      contentToProcess = template.contentEN || "";
    }

    if (contentToProcess) {
      const finalContent = replaceTemplateVariables(contentToProcess, data);
      navigator.clipboard.writeText(finalContent);
      
      // FIXED: Only trigger parent selection if picking Swedish (Primary).
      // Triggering it for English often causes the parent to reload the 
      // default (Swedish) content into the form, overwriting the English copy.
      if (lang === "SE" && onSelectTemplate) {
        onSelectTemplate(template.id);
      }
      
      setIsOpen(false);
      setSearchText(""); 
    } else {
      // Optional: Feedback if empty
      console.warn("No content found for language:", lang);
    }
  };

  const handleEdit = () => {
    setTemplateToEdit(null);
    setModalOpen(true);
  };
  
  const handleEditSpecific = (e: React.MouseEvent, t: any) => {
      e.stopPropagation();
      setTemplateToEdit(t);
      setModalOpen(true);
  };

  // --- Keyboard Navigation ---
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && filteredTemplates.length > 0 && (e.key === "ArrowDown" || e.key === "Enter")) {
      setIsOpen(true);
      return;
    }

    const currentTemplate = filteredTemplates[highlightedIndex];
    // Check if English content exists
    const hasEN = currentTemplate ? !!(currentTemplate.labelEN || currentTemplate.contentEN) : false;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < filteredTemplates.length - 1 ? prev + 1 : prev
        );
        setSelectedLang("SE"); 
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        setSelectedLang("SE");
        break;
      case "ArrowRight":
        if (hasEN) {
            e.preventDefault();
            setSelectedLang("EN");
        }
        break;
      case "ArrowLeft":
        e.preventDefault();
        setSelectedLang("SE");
        break;
      case "Enter":
        e.preventDefault();
        if (currentTemplate) {
          handleCopy(currentTemplate, selectedLang);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <>
      <div className="section-container" style={{overflow:'visible'}}> 
        <div className="section-header">
          <span className="section-title">Templates</span>
          <div className="buttons-wrapper">
            <DynamicButtonRow buttons={customButtons} formData={data} />
          </div>
        </div>

        <div className="template-controls" ref={dropdownRef}>
          <div className="searchable-select" style={{position: 'relative'}}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search templates..."
              className="input"
              value={searchText}
              onFocus={() => setIsOpen(true)}
              onChange={(e) => {
                setSearchText(e.target.value);
                setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
            />

            {isOpen && filteredTemplates.length > 0 && (
              <div className="custom-dropdown-list" ref={listRef}>
                {filteredTemplates.map((t, index) => {
                  const isHighlighted = index === highlightedIndex;
                  const labelSE = t.labelSE || t.label || "Untitled";
                  const hasEN = !!(t.labelEN || t.contentEN);
                  const isOwner = t.ownerId === userId;
                  
                  const isSEActive = isHighlighted && selectedLang === "SE";
                  const isENActive = isHighlighted && selectedLang === "EN";

                  return (
                    <div
                      key={t.id}
                      className="dropdown-row"
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      {/* Left Side: SE Flag + Label */}
                      <div 
                        className={`row-label-se ${isSEActive ? "active-selection" : ""}`}
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleCopy(t, "SE"); 
                        }}
                        onMouseEnter={() => setSelectedLang("SE")}
                        title="Copy Swedish"
                      >
                         <FlagSE /> 
                         <span className="template-label-text">{labelSE}</span>
                      </div>

                      {/* Right Side: Actions */}
                      <div className="row-actions">
                         {/* English Flag Button */}
                         {hasEN && (
                           <div 
                             className={`lang-indicator ${isENActive ? "active-selection" : ""}`}
                             onClick={(e) => { 
                               e.stopPropagation(); 
                               handleCopy(t, "EN"); 
                             }}
                             onMouseEnter={() => setSelectedLang("EN")}
                             title="Copy English"
                           >
                             <FlagGB />
                           </div>
                         )}

                         {/* Edit Button */}
                         {isOwner && (
                             <button 
                                className="icon-btn-small"
                                onClick={(e) => handleEditSpecific(e, t)}
                                tabIndex={-1}
                                title="Edit"
                             >
                                 <PencilIcon />
                             </button>
                         )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {isOpen && filteredTemplates.length === 0 && (
                <div className="custom-dropdown-list" style={{padding: '10px', color: '#777', textAlign:'center'}}>
                    No templates found.
                </div>
            )}
          </div>

          <button
            className="button-svg"
            title="Create New Template"
            onClick={handleEdit}
          >
            <span style={{ fontSize: "24px", fontWeight: "bold", lineHeight: 1 }}>+</span>
          </button>
        </div>
      </div>

      <TemplateModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        templateToEdit={templateToEdit}
        userId={userId}
      />
    </>
  );
}