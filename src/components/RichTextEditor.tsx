"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Undo2, Redo2 } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  light?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter text...",
  light = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const lightClasses = light ? "light-theme" : "";

  return (
    <div className={`border rounded-lg overflow-hidden rich-text-editor ${lightClasses} ${
      light
        ? "bg-cream dark:bg-charcoal border-terracotta/20 dark:border-terracotta/20"
        : "bg-charcoal border-terracotta/20"
    }`}>
      {/* Toolbar */}
      <div className={`flex items-center gap-0 px-2 py-1 border-b border-terracotta/20 ${
        light
          ? "bg-cream-dark/50 dark:bg-charcoal-light"
          : "bg-charcoal-light"
      }`}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive("bold")
              ? light
                ? "bg-terracotta/20 text-terracotta dark:bg-gold/20 dark:text-gold"
                : "bg-gold/20 text-gold"
              : light
              ? "hover:bg-terracotta/20 text-charcoal/70 hover:text-charcoal dark:hover:bg-terracotta/20 dark:text-cream/70 dark:hover:text-cream"
              : "hover:bg-terracotta/20 text-cream/70 hover:text-cream"
          }`}
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive("italic")
              ? light
                ? "bg-terracotta/20 text-terracotta dark:bg-gold/20 dark:text-gold"
                : "bg-gold/20 text-gold"
              : light
              ? "hover:bg-terracotta/20 text-charcoal/70 hover:text-charcoal dark:hover:bg-terracotta/20 dark:text-cream/70 dark:hover:text-cream"
              : "hover:bg-terracotta/20 text-cream/70 hover:text-cream"
          }`}
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive("underline")
              ? light
                ? "bg-terracotta/20 text-terracotta dark:bg-gold/20 dark:text-gold"
                : "bg-gold/20 text-gold"
              : light
              ? "hover:bg-terracotta/20 text-charcoal/70 hover:text-charcoal dark:hover:bg-terracotta/20 dark:text-cream/70 dark:hover:text-cream"
              : "hover:bg-terracotta/20 text-cream/70 hover:text-cream"
          }`}
          title="Underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M6 4v7a6 6 0 0 0 6 6h0a6 6 0 0 0 6-6V4"/><line x1="4" x2="20" y1="21" y2="21"/></svg>
        </button>

        <div className="w-px h-4 bg-terracotta/20 mx-0.5" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={!editor.can().chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive("bulletList")
              ? light
                ? "bg-terracotta/20 text-terracotta dark:bg-gold/20 dark:text-gold"
                : "bg-gold/20 text-gold"
              : light
              ? "hover:bg-terracotta/20 text-charcoal/70 hover:text-charcoal dark:hover:bg-terracotta/20 dark:text-cream/70 dark:hover:text-cream"
              : "hover:bg-terracotta/20 text-cream/70 hover:text-cream"
          }`}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={!editor.can().chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive("orderedList")
              ? light
                ? "bg-terracotta/20 text-terracotta dark:bg-gold/20 dark:text-gold"
                : "bg-gold/20 text-gold"
              : light
              ? "hover:bg-terracotta/20 text-charcoal/70 hover:text-charcoal dark:hover:bg-terracotta/20 dark:text-cream/70 dark:hover:text-cream"
              : "hover:bg-terracotta/20 text-cream/70 hover:text-cream"
          }`}
          title="Ordered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-terracotta/20 mx-0.5" />

        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className={`p-1.5 rounded hover:bg-terracotta/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            light
              ? "text-charcoal/70 hover:text-charcoal dark:text-cream/70 dark:hover:text-cream"
              : "text-cream/70 hover:text-cream"
          }`}
          title="Undo"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className={`p-1.5 rounded hover:bg-terracotta/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            light
              ? "text-charcoal/70 hover:text-charcoal dark:text-cream/70 dark:hover:text-cream"
              : "text-cream/70 hover:text-cream"
          }`}
          title="Redo"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="max-w-none"
        style={{
          minHeight: "120px",
          padding: "12px",
          fontSize: "14px",
        }}
      />

      {/* Custom styles for the editor */}
      <style>{`
        /* Light theme */
        .rich-text-editor.light-theme .ProseMirror {
          outline: none;
          color: #1a1a1a;
          caret-color: #cc6533;
        }

        .rich-text-editor.light-theme .ProseMirror p.is-editor-empty:first-child::before {
          color: #8b7355;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        .rich-text-editor.light-theme .ProseMirror p {
          margin: 0.5rem 0;
        }

        .rich-text-editor.light-theme .ProseMirror ul,
        .rich-text-editor.light-theme .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }

        .rich-text-editor.light-theme .ProseMirror li {
          margin: 0.25rem 0;
        }

        .rich-text-editor.light-theme .ProseMirror strong {
          font-weight: bold;
          color: #cc6533;
        }

        .rich-text-editor.light-theme .ProseMirror em {
          font-style: italic;
        }

        .rich-text-editor.light-theme .ProseMirror u {
          text-decoration: underline;
        }

        /* Dark theme */
        .rich-text-editor:not(.light-theme) .ProseMirror {
          outline: none;
          color: #fcf9f2;
          caret-color: #e8c454;
        }

        .rich-text-editor:not(.light-theme) .ProseMirror p.is-editor-empty:first-child::before {
          color: #8b7355;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        .rich-text-editor:not(.light-theme) .ProseMirror p {
          margin: 0.5rem 0;
        }

        .rich-text-editor:not(.light-theme) .ProseMirror ul,
        .rich-text-editor:not(.light-theme) .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }

        .rich-text-editor:not(.light-theme) .ProseMirror li {
          margin: 0.25rem 0;
        }

        .rich-text-editor:not(.light-theme) .ProseMirror strong {
          font-weight: bold;
          color: #e8c454;
        }

        .rich-text-editor:not(.light-theme) .ProseMirror em {
          font-style: italic;
        }

        .rich-text-editor:not(.light-theme) .ProseMirror u {
          text-decoration: underline;
        }

        /* Shared styles */
        .rich-text-editor .ProseMirror {
          min-height: 120px;
        }

        .rich-text-editor .ProseMirror:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
