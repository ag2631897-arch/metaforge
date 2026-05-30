import React from 'react';

export default function AuthPage() {
  return (
    <div className="flex h-full bg-[#111827]/80 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#0d1326]/80">
        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h2 className="text-xl font-bold text-white">Auth & Permissions</h2>
        </div>
        <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.4)] transition">
          Save Changes
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-[#0a0f1c]">
        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex p-1 bg-slate-900 rounded-lg mb-8 inline-flex border border-slate-800">
            <button className="px-6 py-2 bg-[#1e293b] text-white font-medium rounded-md shadow-sm">Auth Providers</button>
            <button className="px-6 py-2 text-slate-400 font-medium hover:text-slate-200 transition rounded-md">Roles & Permissions</button>
          </div>

          <div className="mb-10">
            <h3 className="text-xl font-bold text-white mb-2">Authentication Providers</h3>
            <p className="text-slate-400 text-sm mb-6">Enable the sign-in methods available to your app users</p>

            <div className="space-y-4">
              {/* Email / Password */}
              <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-white">Email / Password</h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">JWT / Argon2id</span>
                    </div>
                    <p className="text-xs text-slate-500">Username and password authentication</p>
                  </div>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle" id="toggle1" defaultChecked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-blue-600 translate-x-6" style={{ right: 0 }} />
                  <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-6 rounded-full bg-blue-600 cursor-pointer"></label>
                </div>
              </div>

              {/* Google OAuth */}
              <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-blue-900/30 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-white">Google OAuth</h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">OAuth 2.0 / OIDC</span>
                      </div>
                      <p className="text-xs text-slate-500">Sign in with Google accounts</p>
                    </div>
                  </div>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="toggle" id="toggle2" defaultChecked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-blue-600 translate-x-6" style={{ right: 0 }} />
                    <label htmlFor="toggle2" className="toggle-label block overflow-hidden h-6 rounded-full bg-blue-600 cursor-pointer"></label>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-medium">Client ID</label>
                    <input type="text" placeholder="Enter client ID..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-medium">Client Secret</label>
                    <input type="password" placeholder="Enter client secret..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition" />
                  </div>
                </div>
              </div>

              {/* GitHub OAuth */}
              <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-between opacity-50 grayscale">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-white">GitHub OAuth</h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">OAuth 2.0</span>
                    </div>
                    <p className="text-xs text-slate-500">Sign in with GitHub accounts</p>
                  </div>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input type="checkbox" name="toggle" id="toggle3" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-slate-400 border-4 appearance-none cursor-pointer border-slate-700" />
                  <label htmlFor="toggle3" className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-700 cursor-pointer"></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
