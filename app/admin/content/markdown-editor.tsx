"use client"

import { useRef, useState } from "react"
import CodeMirror, {
  EditorView,
  type ReactCodeMirrorRef,
} from "@uiw/react-codemirror"
import { markdown } from "@codemirror/lang-markdown"
import { oneDark } from "@codemirror/theme-one-dark"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  Bold,
  Code,
  Eye,
  Heading,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  Pencil,
} from "lucide-react"

type Props = {
  value: string
  onChange: (value: string) => void
}

const tbBtn =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground disabled:opacity-50"

export function MarkdownEditor({ value, onChange }: Props) {
  const ref = useRef<ReactCodeMirrorRef>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  function view(): EditorView | undefined {
    return ref.current?.view
  }

  function wrap(before: string, after = before) {
    const v = view()
    if (!v) return
    const { from, to } = v.state.selection.main
    const sel = v.state.sliceDoc(from, to)
    v.dispatch({
      changes: { from, to, insert: `${before}${sel}${after}` },
      selection: { anchor: from + before.length, head: from + before.length + sel.length },
    })
    v.focus()
  }

  function prefixLine(prefix: string) {
    const v = view()
    if (!v) return
    const line = v.state.doc.lineAt(v.state.selection.main.from)
    v.dispatch({ changes: { from: line.from, insert: prefix } })
    v.focus()
  }

  function insert(text: string) {
    const v = view()
    if (!v) return
    const { from, to } = v.state.selection.main
    v.dispatch({
      changes: { from, to, insert: text },
      selection: { anchor: from + text.length },
    })
    v.focus()
  }

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = "" // permite reupload do mesmo arquivo
    if (!file) return
    setUploadError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Falha no upload.")
      insert(`![${file.name}](${data.url})`)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Falha no upload.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 p-1.5">
        <button type="button" className={tbBtn} title="Negrito" onClick={() => wrap("**")}>
          <Bold className="size-4" />
        </button>
        <button type="button" className={tbBtn} title="Itálico" onClick={() => wrap("*")}>
          <Italic className="size-4" />
        </button>
        <button type="button" className={tbBtn} title="Título" onClick={() => prefixLine("## ")}>
          <Heading className="size-4" />
        </button>
        <button type="button" className={tbBtn} title="Lista" onClick={() => prefixLine("- ")}>
          <List className="size-4" />
        </button>
        <button type="button" className={tbBtn} title="Código" onClick={() => wrap("`")}>
          <Code className="size-4" />
        </button>
        <button
          type="button"
          className={tbBtn}
          title="Link"
          onClick={() => insert("[texto](https://)")}
        >
          <LinkIcon className="size-4" />
        </button>
        <button
          type="button"
          className={tbBtn}
          title="Imagem"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          <ImageIcon className="size-4" />
        </button>

        <div className="ml-auto">
          <button
            type="button"
            className={tbBtn}
            title={preview ? "Editar" : "Pré-visualizar"}
            onClick={() => setPreview((p) => !p)}
          >
            {preview ? <Pencil className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPickImage}
        />
      </div>

      {uploadError ? (
        <p className="border-b border-border bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
          {uploadError}
        </p>
      ) : null}
      {uploading ? (
        <p className="border-b border-border px-3 py-1.5 text-xs text-muted-foreground">
          Enviando imagem…
        </p>
      ) : null}

      {preview ? (
        <div className="markdown-preview min-h-64 px-4 py-3 text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {value || "_Nada para pré-visualizar._"}
          </ReactMarkdown>
        </div>
      ) : (
        <CodeMirror
          ref={ref}
          value={value}
          onChange={onChange}
          theme={oneDark}
          extensions={[markdown(), EditorView.lineWrapping]}
          minHeight="16rem"
          basicSetup={{ lineNumbers: false, foldGutter: false }}
        />
      )}
    </div>
  )
}
