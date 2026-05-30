import React from 'react';
import Link from 'next/link';

export default async function WorkflowsOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: appId } = await params;
  
  return (
    <div className="flex h-full bg-[#111827]/80 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#0d1326]/80">
        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h2 className="text-xl font-bold text-white">Workflows</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button className="px-4 py-1.5 bg-[#1e293b] text-white text-sm font-medium rounded shadow-sm">Workflows</button>
            <button className="px-4 py-1.5 text-slate-400 text-sm font-medium hover:text-slate-200 transition rounded">Execution Log</button>
          </div>
          
          <Link href={`/studio/apps/${appId}/workflows/editor`} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.4)] transition flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            New Workflow
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-[#0a0f1c]">
        <div className="max-w-5xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <div className="text-slate-400 text-sm font-medium mb-2">Active Workflows</div>
              <div className="text-2xl font-bold text-white"><span className="text-white">2</span> <span className="text-slate-500 text-lg">/ 3</span></div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <div className="text-slate-400 text-sm font-medium mb-2">Total Executions</div>
              <div className="text-2xl font-bold text-white">59</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <div className="text-slate-400 text-sm font-medium mb-2">Avg Success Rate</div>
              <div className="text-2xl font-bold text-white">96%</div>
            </div>
          </div>

          {/* Workflow List */}
          <div className="space-y-6">
            {/* Workflow 1 */}
            <div className="bg-[#111827]/80 border border-slate-800 rounded-xl p-6 shadow-lg shadow-black/10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded bg-indigo-900/30 flex items-center justify-center border border-indigo-500/20">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">New Task Notification</h3>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">On Record Create</span>
                      <span className="text-slate-500">&rarr;</span>
                      <span className="text-slate-400">tasks</span>
                    </div>
                  </div>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" defaultChecked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-blue-600 translate-x-6" style={{ right: 0 }} />
                  <label className="toggle-label block overflow-hidden h-6 rounded-full bg-blue-600 cursor-pointer"></label>
                </div>
              </div>

              <div className="bg-slate-950 rounded-lg p-4 mb-6 border border-slate-800/50">
                <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Conditions</div>
                <code className="text-sm font-mono text-slate-300">priority = "critical"</code>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actions:</div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-md bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                    Send Email
                  </span>
                  <span className="text-slate-600">&rarr;</span>
                  <span className="px-3 py-1.5 rounded-md bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <span className="text-amber-500">🔔</span>
                    Notification
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium border-t border-slate-800 pt-4">
                <span className="text-slate-500">Last run: 2h ago</span>
                <span className="text-slate-700">&bull;</span>
                <span className="text-slate-400">47 total runs</span>
                <span className="text-slate-700">&bull;</span>
                <span className="text-emerald-500">98% success</span>
              </div>
            </div>

            {/* Workflow 2 */}
            <div className="bg-[#111827]/80 border border-slate-800 rounded-xl p-6 shadow-lg shadow-black/10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded bg-indigo-900/30 flex items-center justify-center border border-indigo-500/20">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Weekly Project Report</h3>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">Scheduled</span>
                      <span className="text-slate-400">Every Monday 9:00 AM</span>
                    </div>
                  </div>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" defaultChecked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-blue-600 translate-x-6" style={{ right: 0 }} />
                  <label className="toggle-label block overflow-hidden h-6 rounded-full bg-blue-600 cursor-pointer"></label>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6 mt-10">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actions:</div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-md bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Export CSV
                  </span>
                  <span className="text-slate-600">&rarr;</span>
                  <span className="px-3 py-1.5 rounded-md bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                    Send Email
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium border-t border-slate-800 pt-4">
                <span className="text-slate-500">Last run: 3d ago</span>
                <span className="text-slate-700">&bull;</span>
                <span className="text-slate-400">12 total runs</span>
                <span className="text-slate-700">&bull;</span>
                <span className="text-emerald-500">100% success</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
