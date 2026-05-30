import React from 'react';

export default function TemplateGalleryPage() {
  return (
    <div className="max-w-6xl mx-auto flex flex-col items-center">
      <div className="text-center mb-10 w-full">
        <h1 className="text-4xl font-bold text-white mb-4">Start with a Template</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">Production-ready configs for common use cases. Deploy in seconds, customize everything.</p>
      </div>

      <div className="w-full max-w-2xl relative mb-10">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input type="text" placeholder="Search templates..." className="w-full bg-[#111827]/80 backdrop-blur-sm border border-slate-700/50 rounded-xl pl-12 pr-4 py-4 text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-lg shadow-black/20" />
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <button className="px-5 py-2 rounded-full bg-blue-600 text-white font-medium shadow-[0_0_15px_rgba(37,99,235,0.4)]">All</button>
        <button className="px-5 py-2 rounded-full bg-[#111827]/80 border border-slate-800 text-slate-400 hover:text-slate-200 transition">Business</button>
        <button className="px-5 py-2 rounded-full bg-[#111827]/80 border border-slate-800 text-slate-400 hover:text-slate-200 transition">Content</button>
        <button className="px-5 py-2 rounded-full bg-[#111827]/80 border border-slate-800 text-slate-400 hover:text-slate-200 transition">Data</button>
        <button className="px-5 py-2 rounded-full bg-[#111827]/80 border border-slate-800 text-slate-400 hover:text-slate-200 transition">E-Commerce</button>
        <button className="px-5 py-2 rounded-full bg-[#111827]/80 border border-slate-800 text-slate-400 hover:text-slate-200 transition">Internal Tools</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {/* Template 1 */}
        <div className="group bg-[#111827]/80 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20 flex flex-col relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          <div className="p-8 flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">👥</div>
              <div>
                <h3 className="text-xl font-bold text-white">CRM Pro</h3>
                <span className="text-xs font-medium text-slate-500 px-2 py-0.5 rounded bg-slate-800">Business</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">Full-featured CRM with contacts, deals, pipeline, and email integration</p>
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="text-xs px-2.5 py-1 rounded-full border border-slate-700 text-slate-400">contacts</span>
              <span className="text-xs px-2.5 py-1 rounded-full border border-slate-700 text-slate-400">deals</span>
              <span className="text-xs px-2.5 py-1 rounded-full border border-slate-700 text-slate-400">pipeline</span>
              <span className="text-xs px-2.5 py-1 rounded-full border border-slate-700 text-slate-400">dashboard</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
              <span>4 entities &nbsp;&middot;&nbsp; 6 pages</span>
              <span className="flex items-center text-amber-500"><svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg> 342 - 1,280 deploys</span>
            </div>
          </div>
          <div className="p-6 border-t border-slate-800 flex justify-between items-center bg-[#0d1326]">
            <button className="text-sm text-slate-400 hover:text-white transition">Preview &rarr;</button>
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition shadow-[0_0_15px_rgba(37,99,235,0.3)]">Use Template</button>
          </div>
        </div>

        {/* Template 2 */}
        <div className="group bg-[#111827]/80 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20 flex flex-col relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-rose-600"></div>
          <div className="p-8 flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">🛒</div>
              <div>
                <h3 className="text-xl font-bold text-white">E-Commerce Starter</h3>
                <span className="text-xs font-medium text-slate-500 px-2 py-0.5 rounded bg-slate-800">E-Commerce</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">Products, orders, customers, and inventory management with analytics</p>
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="text-xs px-2.5 py-1 rounded-full border border-slate-700 text-slate-400">products</span>
              <span className="text-xs px-2.5 py-1 rounded-full border border-slate-700 text-slate-400">orders</span>
              <span className="text-xs px-2.5 py-1 rounded-full border border-slate-700 text-slate-400">inventory</span>
              <span className="text-xs px-2.5 py-1 rounded-full border border-slate-700 text-slate-400">analytics</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
              <span>5 entities &nbsp;&middot;&nbsp; 8 pages</span>
              <span className="flex items-center text-amber-500"><svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg> 567 - 2,340 deploys</span>
            </div>
          </div>
          <div className="p-6 border-t border-slate-800 flex justify-between items-center bg-[#0d1326]">
            <button className="text-sm text-slate-400 hover:text-white transition">Preview &rarr;</button>
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition shadow-[0_0_15px_rgba(37,99,235,0.3)]">Use Template</button>
          </div>
        </div>

        {/* Template 3 */}
        <div className="group bg-[#111827]/80 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20 flex flex-col relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          <div className="p-8 flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">✍️</div>
              <div>
                <h3 className="text-xl font-bold text-white">Blog / CMS</h3>
                <span className="text-xs font-medium text-slate-500 px-2 py-0.5 rounded bg-slate-800">Content</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">Content management with posts, categories, media library, and SEO tools</p>
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="text-xs px-2.5 py-1 rounded-full border border-slate-700 text-slate-400">posts</span>
              <span className="text-xs px-2.5 py-1 rounded-full border border-slate-700 text-slate-400">categories</span>
              <span className="text-xs px-2.5 py-1 rounded-full border border-slate-700 text-slate-400">media</span>
              <span className="text-xs px-2.5 py-1 rounded-full border border-slate-700 text-slate-400">SEO</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
              <span>3 entities &nbsp;&middot;&nbsp; 5 pages</span>
              <span className="flex items-center text-amber-500"><svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg> 289 - 980 deploys</span>
            </div>
          </div>
          <div className="p-6 border-t border-slate-800 flex justify-between items-center bg-[#0d1326]">
            <button className="text-sm text-slate-400 hover:text-white transition">Preview &rarr;</button>
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition shadow-[0_0_15px_rgba(37,99,235,0.3)]">Use Template</button>
          </div>
        </div>
      </div>
    </div>
  );
}
