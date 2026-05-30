"use client";

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import { API_BASE_URL, apiUrl } from '@/lib/api';

const DEFAULT_CONFIG = `{
  "app": {
    "name": "My App"
  },
  "entities": [
    {
      "name": "tasks",
      "fields": [
        { "name": "title", "type": "string", "required": true }
      ]
    }
  ]
}`;

export default function ConfigEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const appId = resolvedParams.id;
  
  const [configJson, setConfigJson] = useState<string>(DEFAULT_CONFIG);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>({ valid: true });
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployLogs, setDeployLogs] = useState<{stage: string, status: string, duration?: number}[]>([]);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch(apiUrl(`/apps/${appId}/config`), { credentials: 'include' });
        const json = await res.json();
        if (json.success && json.data?.config) {
          const formatted = JSON.stringify(json.data.config, null, 2);
          setConfigJson(formatted);
          validateConfig(formatted);
          return;
        }

        const stored = localStorage.getItem('metaforge-generated-config');
        if (stored) {
          const parsed = JSON.parse(stored);
          const formatted = JSON.stringify(parsed, null, 2);
          setConfigJson(formatted);
          validateConfig(formatted);
          localStorage.removeItem('metaforge-generated-config');
        }
      } catch (e) {
        console.error('Failed to load config', e);
      }
    };

    loadConfig();
    
    // Connect socket
    const socket = io(API_BASE_URL.replace(/\/api\/v1$/, ''));
    socket.emit('join-app', appId);
    
    socket.on('deploy-progress', (data) => {
      setDeployLogs((prev) => [...prev, data]);
      if (data.stage === 'Frontend Generation') {
        setIsDeploying(false);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [appId]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setConfigJson(value);
      validateConfig(value);
    }
  };

  const validateConfig = (jsonString: string) => {
    setIsValidating(true);
    try {
      JSON.parse(jsonString);
      setValidationResult({ valid: true });
    } catch (e: any) {
      setValidationResult({ valid: false, error: e.message });
    } finally {
      setIsValidating(false);
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeployLogs([]);
    try {
      const res = await fetch(apiUrl('/deploy'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          appId: appId,
          config: JSON.parse(configJson)
        })
      });
      const data = await res.json();
      if (!data.success) {
        setIsDeploying(false);
        alert('Deploy failed! Response: \n' + JSON.stringify(data, null, 2));
      }
    } catch (e: any) {
      setIsDeploying(false);
      alert('Deploy error: ' + e.message);
    }
  };

  const handleFormat = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(configJson), null, 2);
      setConfigJson(formatted);
      validateConfig(formatted);
    } catch {
      validateConfig(configJson);
    }
  };

  const lineCount = configJson.split('\n').length;
  const charCount = configJson.length.toLocaleString();

  return (
    <div className="flex h-full bg-[#111827]/80 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0d1326]/80 text-sm">
        <div className="flex items-center gap-4">
          <a href="/studio/apps" className="text-slate-400 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </a>
          <span className="text-slate-400 font-medium">Config Editor</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-slate-300">App: {appId}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={handleFormat} className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition font-medium">Format</button>
          <button className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition font-medium">Diff View</button>
          <button className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition font-medium">History</button>
          <button 
            disabled={!validationResult.valid || isDeploying}
            onClick={handleDeploy}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded shadow-[0_0_10px_rgba(79,70,229,0.3)] disabled:opacity-50 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            {isDeploying ? 'Deploying...' : 'Deploy Pipeline'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Editor */}
        <div className="flex-1 flex flex-col relative border-r border-slate-800">
          {deployLogs.length > 0 && (
            <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
              <h3 className="text-sm font-bold text-slate-300 mb-2">Deployment Status</h3>
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                {deployLogs.map((log, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs font-mono">
                    <span className="text-blue-400">[{log.stage}]</span>
                    <span className={log.status === 'success' ? 'text-emerald-400' : log.status === 'failed' ? 'text-rose-400' : 'text-slate-400'}>
                      {log.status.toUpperCase()} {log.duration ? `(${log.duration}ms)` : ''}
                    </span>
                  </div>
                ))}
              </div>
              
              {!isDeploying && deployLogs.some(l => l.stage === 'Frontend Generation' && l.status === 'success') && (
                <div className="mt-3 pt-3 border-t border-slate-800 flex justify-end gap-3">
                  <a href={`/preview/${appId}`} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition text-xs font-medium">Open Deployed App</a>
                </div>
              )}
            </div>
          )}

          <div className="flex-1 bg-[#0a0f1c]">
            <Editor
              height="100%"
              defaultLanguage="json"
              theme="vs-dark"
              value={configJson}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: true, scale: 0.75, renderCharacters: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                formatOnPaste: true,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                smoothScrolling: true,
                cursorBlinking: "smooth",
                renderLineHighlight: "all",
              }}
            />
          </div>
          
          <div className="h-8 border-t border-slate-800 flex items-center justify-between px-4 bg-[#0d1326] text-[10px] font-mono text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><div className="w-4 h-4 bg-slate-900 rounded-full flex items-center justify-center text-[8px] text-white">N</div></span>
              <span>{lineCount} lines</span>
              <span>{charCount} chars</span>
              <span className={validationResult.valid ? 'text-emerald-500' : 'text-rose-400'}>
                {validationResult.valid ? 'Valid Configuration' : 'Invalid JSON'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>JSON</span>
              <span>UTF-8</span>
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="w-72 bg-[#0d1326] flex flex-col">
          <div className="flex border-b border-slate-800">
            <button className="flex-1 py-3 text-sm font-medium text-blue-400 border-b-2 border-blue-500 bg-blue-900/10">Issues (0)</button>
            <button className="flex-1 py-3 text-sm font-medium text-slate-400 hover:text-slate-200 transition">Schema Explorer</button>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto">
            {validationResult.valid ? (
              <div className="p-3 bg-emerald-900/20 border border-emerald-900/50 rounded-lg flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                <span className="text-sm font-medium text-emerald-400">No issues found</span>
              </div>
            ) : (
              <div className="p-3 bg-rose-900/20 border border-rose-900/50 rounded-lg flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-sm font-medium text-rose-400">JSON Syntax Error</span>
                </div>
                <div className="text-xs text-rose-300 break-words font-mono">
                  {validationResult.error}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
