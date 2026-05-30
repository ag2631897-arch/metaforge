import React from 'react';

export default function ApiExplorerPage() {
  return (
    <div className="flex h-full bg-[#111827]/80 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-[#0d1326]/50">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-4 text-slate-200">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span className="font-semibold text-lg">API Explorer</span>
            <span className="text-xs text-slate-500 ml-auto">— 18 endpoints</span>
          </div>
          <div className="flex gap-2 text-xs">
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-full">All</button>
            <button className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-full hover:text-slate-200">System</button>
            <button className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-full hover:text-slate-200">Apps</button>
            <button className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-full hover:text-slate-200">Config</button>
            <button className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-full hover:text-slate-200">Deploy</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Endpoints */}
          <button className="w-full text-left p-4 border-b border-slate-800/50 bg-slate-800/30 border-l-2 border-l-emerald-500">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">GET</span>
              <span className="text-sm font-mono text-slate-200">/api/v1/health</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-11">Health check</p>
          </button>
          <button className="w-full text-left p-4 border-b border-slate-800/50 hover:bg-slate-800/20">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">GET</span>
              <span className="text-sm font-mono text-slate-200">/api/v1/apps</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-11">List all apps</p>
          </button>
          <button className="w-full text-left p-4 border-b border-slate-800/50 hover:bg-slate-800/20">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">GET</span>
              <span className="text-sm font-mono text-slate-200">/api/v1/apps/:id</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-11">Get app details</p>
          </button>
          <button className="w-full text-left p-4 border-b border-slate-800/50 hover:bg-slate-800/20">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">POST</span>
              <span className="text-sm font-mono text-slate-200">/api/v1/apps</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-12">Create new app</p>
          </button>
          <button className="w-full text-left p-4 border-b border-slate-800/50 hover:bg-slate-800/20">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">PUT</span>
              <span className="text-sm font-mono text-slate-200">/api/v1/apps/:id/config</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-10">Update app config</p>
          </button>
          <button className="w-full text-left p-4 border-b border-slate-800/50 hover:bg-slate-800/20">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">DELETE</span>
              <span className="text-sm font-mono text-slate-200">/api/v1/apps/:id</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-14">Delete app</p>
          </button>
          <button className="w-full text-left p-4 border-b border-slate-800/50 hover:bg-slate-800/20">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">POST</span>
              <span className="text-sm font-mono text-slate-200">/api/v1/config/validate</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-12">Validate config JSON</p>
          </button>
          <button className="w-full text-left p-4 border-b border-slate-800/50 hover:bg-slate-800/20">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">POST</span>
              <span className="text-sm font-mono text-slate-200">/api/v1/deploy</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-12">Deploy app from config</p>
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col bg-[#0d1326]/30">
        <div className="p-6 border-b border-slate-800 flex items-center gap-4">
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden flex-1">
            <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 font-bold text-sm border-r border-slate-700">GET</div>
            <input type="text" value="http://localhost:3001/api/v1/health" readOnly className="bg-transparent text-slate-300 font-mono text-sm px-4 py-2 w-full outline-none" />
          </div>
          <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium flex items-center gap-2 transition shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            Send
          </button>
        </div>
        
        <div className="flex-1 p-6 relative">
          <div className="absolute top-6 right-6">
            <span className="text-sm font-bold text-emerald-400">200 OK</span>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-4">Response</h3>
          <pre className="font-mono text-sm text-slate-300">
{`{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "uptime": 3600,
    "timestamp": "2026-05-28T10:00:00Z"
  }
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
