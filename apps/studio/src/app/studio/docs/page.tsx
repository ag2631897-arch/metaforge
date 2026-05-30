import React from 'react';

export default function DocumentationPage() {
  return (
    <div className="flex h-full bg-[#111827]/80 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Sidebar */}
      <div className="w-64 border-r border-slate-800 bg-[#0d1326]/50 overflow-y-auto">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2 text-slate-200">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span className="font-semibold">Documentation</span>
        </div>
        <div className="p-4 space-y-6">
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Getting Started</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-blue-400 font-medium">Quick Start Guide</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-slate-200 transition">Config Reference</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-slate-200 transition">Templates</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Configuration</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-slate-400 hover:text-slate-200 transition">App Manifest</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-slate-200 transition">Entities & Fields</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-slate-200 transition">Pages & Components</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-slate-200 transition">Auth & Roles</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-slate-200 transition">Workflows</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-slate-200 transition">Theme & i18n</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">API Reference</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-slate-400 hover:text-slate-200 transition">REST API</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-slate-200 transition">Deploy API</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-slate-200 transition">Webhook Events</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-12 bg-[#0d1326]/30">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">MetaForge Documentation</h1>
          <p className="text-slate-400 text-lg mb-12">Everything you need to build apps with JSON configuration.</p>

          <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-800 pb-2">Quick Start</h2>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-12">
            <div className="flex items-center px-4 py-2 bg-slate-800/50 border-b border-slate-800">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
            </div>
            <pre className="p-6 font-mono text-sm overflow-x-auto text-slate-300">
              <span className="text-slate-500">// 1. Create a config file</span><br/>
              {`{
  "app": { "name": "My App" },
  "entities": [{
    "name": "tasks",
    "fields": [
      { "name": "title", "type": "string", "required": true }
    ]
  }],
  "pages": [{ "path": "/", "components": [...] }]
}`}
              <br/><br/>
              <span className="text-slate-500">// 2. Deploy via Studio or API</span><br/>
              <span className="text-rose-400">POST</span> /api/v1/deploy {`{ config: {...} }`}
            </pre>
          </div>

          <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-800 pb-2">Field Types</h2>
          <p className="text-slate-300 mb-6 leading-relaxed">
            MetaForge supports various field types for your entities out-of-the-box. These types determine the database column type, the API validation rules, and the default UI component rendered in forms.
          </p>
        </div>
      </div>
    </div>
  );
}
