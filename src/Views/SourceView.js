import React, { useState } from "react";
import axios from "axios";
import { addSource, generateRandomId } from "../Api.js";

import {
  FaFilePdf,
  FaGlobe,
  FaPodcast,
  FaArrowLeft,
  FaPlus,
} from "react-icons/fa";
import { IoLogoYoutube } from "react-icons/io";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

import "./SourceView.css";

export const SourceTypes = {
  ACADEMIC: "academic",
  YOUTUBE: "youtube",
  WEB: "web",
  PODCAST: "podcast",
};

export const SourceTypeIcons = {
  [SourceTypes.ACADEMIC]: { Icon: FaFilePdf, color: "text-red-600" },
  [SourceTypes.YOUTUBE]: { Icon: IoLogoYoutube, color: "text-red-500" },
  [SourceTypes.WEB]: { Icon: FaGlobe, color: "text-blue-500" },
  [SourceTypes.PODCAST]: { Icon: FaPodcast, color: "text-purple-600" },
};

const SidePanel = ({ sources, notes, onAddSource, currPaper }) => {
  const [expandedItem, setExpandedItem] = useState(null);
  const [activeTab, setActiveTab] = useState("sources");
  const [isAddSourceMenuOpen, setIsAddSourceMenuOpen] = useState(false);
  const [selectedSourceType, setSelectedSourceType] = useState(null);

  const handleItemClick = (item) => {
    setExpandedItem(item);
  };

  const handleBackClick = () => {
    setExpandedItem(null);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setExpandedItem(null);
  };

  const handleAddSourceClick = () => {
    setIsAddSourceMenuOpen(!isAddSourceMenuOpen);
  };

  const handleSourceTypeClick = (sourceType) => {
    setSelectedSourceType(sourceType);
  };

  return (
    <div className="relative h-full source-view">
      <TabToggle
        activeTab={activeTab}
        onTabClick={handleTabClick}
        onAddSourceClick={handleAddSourceClick}
      />
      {isAddSourceMenuOpen && (
        <AddSourceMenu onSourceTypeClick={handleSourceTypeClick} />
      )}
      <div className="relative h-full">
        {selectedSourceType === SourceTypes.ACADEMIC ? (
          <AddAcademicSourceForm
            onAddSource={onAddSource}
            onClose={() => {
              setSelectedSourceType(null);
              setIsAddSourceMenuOpen(false);
            }}
            currPaper={currPaper}
          />
        ) : (
          <>
            <div
              className={`tab-content-container ${
                activeTab === "notes" ? "active" : ""
              }`}
            >
              <TabContent
                activeTab={activeTab}
                expandedItem={expandedItem}
                sources={sources}
                notes={notes}
                onItemClick={handleItemClick}
              />
            </div>
            <ExpandedItemView
              expandedItem={expandedItem}
              activeTab={activeTab}
              onBackClick={handleBackClick}
            />
          </>
        )}
      </div>
    </div>
  );
};

const TabToggle = ({ activeTab, onTabClick, onAddSourceClick }) => (
  <div className="flex items-center justify-between mb-4 top-toggle-menu">
    <div className="flex items-center">
      <button
        className={`px-4 py-2 font-semibold relative transition-colors duration-300 ${
          activeTab === "sources" ? "active-tab" : "inactive-tab"
        }`}
        onClick={() => onTabClick("sources")}
      >
        <span className="relative z-10">sources</span>
        <div
          className={`absolute bottom-0 left-0 w-full h-0.5 active-tab-underline transition-transform duration-300 ${
            activeTab === "sources" ? "scale-x-100" : "scale-x-0"
          }`}
        ></div>
      </button>
      <button
        className={`px-4 py-2 font-semibold relative transition-colors duration-300 ${
          activeTab === "notes" ? "active-tab" : "inactive-tab"
        }`}
        onClick={() => onTabClick("notes")}
      >
        <span className="relative z-10">notes</span>
        <div
          className={`absolute bottom-0 left-0 w-full h-0.5 active-tab-underline transition-transform duration-300 ${
            activeTab === "notes" ? "scale-x-100" : "scale-x-0"
          }`}
        ></div>
      </button>
    </div>
    {activeTab === "sources" && (
      <button
        className="flex items-center px-3 py-2 text-sm font-medium text-white add-source-button rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        onClick={onAddSourceClick}
      >
        <FaPlus className="w-3 h-3 mr-2" />
        add source
      </button>
    )}
  </div>
);

const AddSourceMenu = ({ onSourceTypeClick }) => (
  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 add-source-menu-popup">
    <div className="py-1">
      <button
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
        onClick={() => onSourceTypeClick(SourceTypes.WEB)}
      >
        Web
      </button>
      <button
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
        onClick={() => onSourceTypeClick(SourceTypes.YOUTUBE)}
      >
        YouTube
      </button>
      <button
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
        onClick={() => onSourceTypeClick(SourceTypes.PODCAST)}
      >
        Podcast
      </button>
      <button
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
        onClick={() => onSourceTypeClick(SourceTypes.ACADEMIC)}
      >
        Academic
      </button>
    </div>
  </div>
);

const AddAcademicSourceForm = ({ onAddSource, onClose, currPaper }) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const handleAddAcademicSource = async () => {
    setLoading(true);
    setError(null);

    try {
      const arxivId = url.match(/(\d+\.\d+)/)[1];
      const response = await axios.get(
        `https://export.arxiv.org/api/query?id_list=${arxivId}`,
      );
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.data, "text/xml");

      const entry = xmlDoc.querySelector("entry");
      const title = entry.querySelector("title").textContent;
      const abstract = entry.querySelector("summary").textContent;
      const authors = Array.from(entry.querySelectorAll("author name")).map(
        (author) => author.textContent,
      );
      const published = entry.querySelector("published").textContent;

      addSource(currPaper, String(url), String(title));
      onAddSource({
        type: SourceTypes.ACADEMIC,
        title,
        link: url,
        author: authors.join(", "),
        description: abstract,
        date: new Date(published).toLocaleDateString(),
        creator: "ArXiv",
      });

      setUrl("");
      onClose();
    } catch (err) {
      setError(
        "Error fetching paper info. Please check the URL and try again.",
      );
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-white z-10">
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add ArXiv Paper</h3>
          <button
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
            onClick={onClose}
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto mb-4">
          <div className="mb-4">
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700"
            >
              ArXiv Paper URL
            </label>
            <input
              type="text"
              name="url"
              id="url"
              value={url}
              onChange={handleUrlChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="https://arxiv.org/abs/2303.08774"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="py-10">
            <button
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleAddAcademicSource}
              disabled={loading}
            >
              {loading ? "Loading..." : "Add Source"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabContent = ({
  activeTab,
  expandedItem,
  sources,
  notes,
  onItemClick,
}) => (
  <>
    <div
      className={`tab-content sources transition-opacity duration-300 ${
        expandedItem ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {activeTab === "sources" && (
        <SourcesList sources={sources} onSourceClick={onItemClick} />
      )}
    </div>
    <div
      className={`tab-content notes transition-opacity duration-300 ${
        expandedItem ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {activeTab === "notes" && (
        <NotesList notes={notes} onNoteClick={onItemClick} />
      )}
    </div>
  </>
);

const ExpandedItemView = ({ expandedItem, activeTab, onBackClick }) => (
  <div
    className={`absolute top-0 left-0 w-full h-full transition-opacity duration-300 ${
      expandedItem ? "opacity-100" : "opacity-0 pointer-events-none"
    }`}
  >
    {expandedItem && (
      <>
        {activeTab === "sources" && (
          <ExpandedSourceView source={expandedItem} onBack={onBackClick} />
        )}
        {activeTab === "notes" && (
          <ExpandedNoteView note={expandedItem} onBack={onBackClick} />
        )}
      </>
    )}
  </div>
);

const NotesList = ({ notes, onNoteClick }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-y-auto">
        <ul className="space-y-2 p-2">
          {notes.map((note, index) => (
            <NoteView
              key={index}
              note={note}
              onClick={() => onNoteClick(note)}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

const NoteView = ({ note, onClick }) => {
  return (
    <li
      className="relative p-3 rounded-lg transition-colors duration-200 ease-in-out hover:bg-gray-100 cursor-pointer"
      onClick={onClick}
    >
      <p className="text-lg font-semibold text-gray-900 note-title">
        {note.title}
      </p>
      <p className="text-sm text-gray-600 note-date">{note.date}</p>
    </li>
  );
};

const ExpandedNoteView = ({ note, onBack }) => {
  return (
    <div className="h-full p-4 rounded-md shadow-sm overflow-y-auto expanded-view">
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 note-title">
          {note.title}
        </h3>
        <p className="text-sm text-gray-600 note-date mb-4">{note.date}</p>
        <p className="text-gray-700">{note.content}</p>
      </div>
    </div>
  );
};

const SourcesList = ({ sources, onSourceClick }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-y-auto">
        <ul className="space-y-2 p-2">
          {sources.map((source, index) => (
            <SourceView
              key={index}
              source={source}
              onClick={() => onSourceClick(source)}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

const SourceView = ({ source, onClick }) => {
  const SourceIconInfo = SourceTypeIcons[source.type] || null;

  return (
    <li
      className="relative p-3 rounded-lg transition-colors duration-200 ease-in-out hover:bg-gray-100 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <img
            src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
        </div>
        <div className="ml-3 flex flex-col justify-center">
          <h3 className="text-base font-medium text-gray-800 source-creator">
            {source.creator}
          </h3>
          <p className="text-xs text-gray-600 source-date">{source.date}</p>
        </div>
      </div>
      <p className="text-lg font-semibold text-gray-900 mt-1 source-title">
        {source.title}
      </p>
      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
        {SourceIconInfo && (
          <SourceIconInfo.Icon className={`w-4 h-4 ${SourceIconInfo.color}`} />
        )}
        <span className="source-author">{source.author}</span>
      </div>
    </li>
  );
};

const ExpandedSourceView = ({ source, onBack }) => {
  const SourceIconInfo = SourceTypeIcons[source.type] || null;

  const renderLatex = (text) => {
    const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g);
    return parts.map((part, index) => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        return <BlockMath key={index} math={part.slice(2, -2)} />;
      } else if (part.startsWith("$") && part.endsWith("$")) {
        return <InlineMath key={index} math={part.slice(1, -1)} />;
      } else {
        return part;
      }
    });
  };

  return (
    <div className="h-full p-4 bg-white rounded-md shadow-sm overflow-y-auto expanded-view">
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <img
              src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
              alt="Profile"
              className="w-12 h-12 rounded-full"
            />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-900 source-creator">
              {source.creator}
            </h2>
            <p className="text-sm text-gray-600 source-date">{source.date}</p>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {source.title}
        </h3>
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
          {SourceIconInfo && (
            <SourceIconInfo.Icon
              className={`w-5 h-5 ${SourceIconInfo.color}`}
            />
          )}
          <span className="font-medium source-author">{source.author}</span>
        </div>
        <div className="text-gray-700 mb-4">
          {renderLatex(source.description || "No description available.")}
        </div>
        <div className="bg-white p-3 rounded-md">
          <ul className="list-disc list-inside text-gray-700">
            <li>
              URL:{" "}
              <a
                href={source.link}
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {source.link}
              </a>
            </li>
            {source.publishedIn && <li>Published in: {source.publishedIn}</li>}
            {source.doi && <li>DOI: {source.doi}</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
