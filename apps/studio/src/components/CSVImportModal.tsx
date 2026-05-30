"use client";

import React, { useRef, useState } from "react";
import { apiUrl } from "@/lib/api";

interface CSVImportModalProps {
  appId: string;
  appName: string;
  entities: Array<{ name: string; fields?: any[] }>;
  onClose: () => void;
  onImportComplete?: (data: any) => void;
}

export function CSVImportModal({ appId, appName, entities, onClose, onImportComplete }: CSVImportModalProps) {
  const [entity, setEntity] = useState(entities[0]?.name || "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ headers: string[]; rows: any[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(selectedFile: File) {
    setFile(selectedFile);
    setError("");
    setResult(null);

    const text = await selectedFile.text();
    try {
      const res = await fetch(apiUrl("/csv/parse"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ csv: text, entity }),
      });
      const json = await res.json();
      if (json.success) {
        setPreview({ headers: json.data.headers, rows: json.data.preview });
      }
    } catch {
      // Parse locally as fallback
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length > 1) {
        const headers = lines[0].split(",").map((h) => h.trim());
        const rows = lines.slice(1, 6).map((line) => {
          const vals = line.split(",");
          const row: Record<string, string> = {};
          headers.forEach((h, i) => (row[h] = vals[i]?.trim() || ""));
          return row;
        });
        setPreview({ headers, rows });
      }
    }
  }

  async function handleImport() {
    if (!file || !entity) return;

    setImporting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append(entity, file);

      const res = await fetch(apiUrl(`/apps/${appId}/import/csv?entity=${entity}`), {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        setResult(json.data);
        onImportComplete?.(json.data);
      } else {
        setError(json.error?.message || "Import failed");
      }
    } catch (err: any) {
      setError(err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  }

  async function handleExport() {
    try {
      const res = await fetch(apiUrl(`/apps/${appId}/export/csv`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ entity, records: [] }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${entity}-export.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      setError("Failed to export CSV");
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl"
        style={{
          backgroundColor: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          boxShadow: "var(--shadow-lg)",
          animation: "mf-modal-in 200ms ease-out",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)" }}>
              <svg className="h-5 w-5" style={{ color: "var(--info)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <h3 className="text-[16px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>CSV Import / Export</h3>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{appName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 transition-all duration-[180ms]"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-overlay)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)"; }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {error && (
            <div className="rounded-lg px-4 py-2.5 text-[12px] font-medium" style={{ backgroundColor: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "var(--error)" }}>
              {error}
            </div>
          )}

          {/* Entity Selector */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
              Target Entity
            </label>
            <select
              value={entity}
              onChange={(e) => setEntity(e.target.value)}
              className="w-full rounded-lg outline-none transition-all duration-[180ms]"
              style={{
                backgroundColor: "var(--bg-overlay)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
                padding: "10px 14px",
                fontSize: "13px",
              }}
              onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "var(--accent-primary)"; (e.target as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-muted)"; }}
              onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "var(--border-default)"; (e.target as HTMLElement).style.boxShadow = "none"; }}
            >
              {entities.map((e) => (
                <option key={e.name} value={e.name}>
                  {e.name} ({e.fields?.length || 0} fields)
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
              CSV File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
              }}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) handleFileSelect(f);
              }}
              className="cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-[180ms]"
              style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-surface)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--info)"; (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(96,165,250,0.05)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)"; (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-surface)"; }}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <svg className="h-8 w-8" style={{ color: "var(--info)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>{file.name}</p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {(file.size / 1024).toFixed(1)} KB — Click to change
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <svg className="mx-auto mb-3 h-10 w-10" style={{ color: "var(--text-tertiary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
                    Drop a CSV file here or <span style={{ color: "var(--info)" }}>browse</span>
                  </p>
                  <p className="mt-1 text-[11px]" style={{ color: "var(--text-tertiary)" }}>Max 10 MB</p>
                </>
              )}
            </div>
          </div>

          {/* Preview Table */}
          {preview && preview.rows.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
                  Preview ({preview.rows.length} rows shown)
                </label>
              </div>
              <div className="overflow-x-auto rounded-lg" style={{ border: "1px solid var(--border-subtle)" }}>
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr style={{ backgroundColor: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)" }}>
                      {preview.headers.map((h) => (
                        <th key={h} className="px-3 py-2 font-bold uppercase tracking-[0.08em]" style={{ color: "var(--text-tertiary)" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row, i) => (
                      <tr key={i} className="transition-colors duration-[180ms]" style={{ borderBottom: "1px solid var(--border-subtle)" }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-elevated)"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}>
                        {preview.headers.map((h) => (
                          <td key={h} className="px-3 py-2" style={{ color: "var(--text-secondary)" }}>
                            {String(row[h] || "").substring(0, 40)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Result */}
          {result && (
            <div className="rounded-lg p-4" style={{ backgroundColor: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.2)" }}>
              <div className="flex items-center gap-2 mb-3">
                <svg className="h-5 w-5" style={{ color: "var(--success)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[13px] font-bold" style={{ color: "var(--success)" }}>Import Complete</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-md py-2" style={{ backgroundColor: "var(--bg-surface)" }}>
                  <div className="text-[18px] font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>{result.totalRows}</div>
                  <div className="text-[10px] uppercase font-semibold" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>Total</div>
                </div>
                <div className="rounded-md py-2" style={{ backgroundColor: "var(--bg-surface)" }}>
                  <div className="text-[18px] font-bold" style={{ color: "var(--success)", fontFamily: "var(--font-display)" }}>{result.importedCount}</div>
                  <div className="text-[10px] uppercase font-semibold" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>Imported</div>
                </div>
                <div className="rounded-md py-2" style={{ backgroundColor: "var(--bg-surface)" }}>
                  <div className="text-[18px] font-bold" style={{ color: "var(--error)", fontFamily: "var(--font-display)" }}>{result.validationErrors?.length || 0}</div>
                  <div className="text-[10px] uppercase font-semibold" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>Errors</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] font-bold transition-all duration-[180ms]"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-overlay)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)"; (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-surface)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-[13px] font-medium transition-all duration-[180ms]"
              style={{ color: "var(--text-tertiary)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-surface)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)"; (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            >
              {result ? "Done" : "Cancel"}
            </button>
            {!result && (
              <button
                type="button"
                onClick={handleImport}
                disabled={!file || !entity || importing}
                className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-[13px] font-semibold transition-all duration-[180ms] disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: "var(--accent-primary)",
                  color: "var(--text-inverse)",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={(e) => { if (!e.currentTarget.disabled) { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-hover)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-glow)"; } }}
                onMouseLeave={(e) => { if (!e.currentTarget.disabled) { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-primary)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; } }}
              >
                {importing ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Importing...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Import Data
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
