"use client";

import { useRef, forwardRef, useImperativeHandle } from "react";
import { Editor } from "@tinymce/tinymce-react";

interface RichTextEditorProps {
  initialValue?: string;
  height?: number;
  placeholder?: string;
}

export interface RichTextEditorRef {
  getContent: () => string;
  setContent: (content: string) => void;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ initialValue = "", height = 400, placeholder }, ref) => {
    const editorRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      getContent: () => {
        return editorRef.current ? editorRef.current.getContent() : "";
      },
      setContent: (content: string) => {
        if (editorRef.current) {
          editorRef.current.setContent(content);
        }
      },
    }));

    return (
      <Editor
        tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js"
        onInit={(_evt, editor) => (editorRef.current = editor)}
        initialValue={initialValue}
        init={{
          height,
          menubar: false,
          branding: false,
          paste_data_images: true,
          placeholder,
          popup_container: typeof window !== "undefined" ? document.body : undefined,
          z_index: 9999,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks fontsizeselect | ' +
            'bold italic underline strikethrough | link image table | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | forecolor backcolor | ' +
            'superscript subscript | removeformat | help code',
          toolbar_mode: 'wrap',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          file_picker_types: 'image',
          file_picker_callback: (callback: (url: string, meta: { title: string }) => void, _value: any, _meta: any) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = () => {
              const file = input.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === 'string') {
                  callback(reader.result, { title: file.name });
                }
              };
              reader.readAsDataURL(file);
            };
            input.click();
          },
        }}
      />
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";
