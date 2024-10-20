import React, { useState } from "react";
import "./Editor.css";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { $getRoot, $createParagraphNode, $createTextNode } from "lexical";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useNavigate } from "react-router-dom";
import Project from "./Project";

const theme = {
  // Theme config here
  paragraph: "mb-1",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
  },
};

function onError(error) {
  console.error(error);
}

const TitleEditor = ({ title, onChange }) => {
  const initialConfig = {
    namespace: "TitleEditor",
    theme,
    onError,
    editorState: () => {
      const root = $getRoot();
      root.clear();
      const p = $createParagraphNode();
      p.append($createTextNode(title));
      root.append(p);
    },
  };

  const handleChange = (editorState) => {
    editorState.read(() => {
      const currentText = $getRoot().getTextContent();
      onChange(currentText);
    });
  };

  return (
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-container title-editor">
          <RichTextPlugin
              contentEditable={
                <ContentEditable className="editor-input title-input" />
              }
              placeholder={
                <div className="editor-placeholder">Untitled Document</div>
              }
              ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin onChange={handleChange} />
          <HistoryPlugin />
          <AutoFocusPlugin />
        </div>
      </LexicalComposer>
  );
};

const ContentEditor = ({ content, onChange }) => {
  const initialConfig = {
    namespace: "ContentEditor",
    theme,
    onError,
    editorState: () => {
      const root = $getRoot();
      root.clear();
      const p = $createParagraphNode();
      p.append($createTextNode(content));
      root.append(p);
    },
  };

  const handleChange = (editorState) => {
    editorState.read(() => {
      const currentText = $getRoot().getTextContent();
      onChange(currentText);
    });
  };

  return (
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-container content-editor">
          <RichTextPlugin
              contentEditable={
                <ContentEditable className="editor-input content-input" />
              }
              placeholder={
                <div className="editor-placeholder">start your research...</div>
              }
              ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin onChange={handleChange} />
          <HistoryPlugin />
        </div>
      </LexicalComposer>
  );
};

export default function Editor({
                                 id,
                                 title: initialTitle,
                                 content: initialContent,
                                 onUpdateProject,
                               }) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      const response = await fetch("https://api.chennupati.dev/update_paper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id: id,
          title: title,
          text: content,
        }),
      });
      console.log(id)

      if (!response.ok) {
        throw new Error("Failed to save paper");
      }

      // Update parent component
      if (onUpdateProject) {
        onUpdateProject({
          id,
          title,
          content,
        });
      }

      // Optionally, show a success message
      console.log("Paper saved successfully!");
    } catch (error) {
      console.error("Error saving paper:", error);
      // Optionally, show an error message to the user
    }
  };

  return (
      <div className="full-editor">
        <TitleEditor title={title} onChange={setTitle} />
        <ContentEditor content={content} onChange={setContent} />
        <button onClick={handleSave} className="save-button">
          Save
        </button>
      </div>
  );
}
