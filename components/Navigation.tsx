
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { ViewState } from '../types';

interface SidebarProps {
  activeView: ViewState;
  setActiveView: (view: ViewState) => void;
  profileName: string;
  avatarUrl?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, profileName, avatarUrl }) => {
  return (
    <aside className="hidden md:flex flex-col w-72 bg-slate-900/50 border-r border-slate-800/50 p-8">
      <div className="mb-12 px-2">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Experience</h2>
        <nav className="space-y-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ViewState)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden ${
                activeView === item.id 
                  ? 'bg-blue-600/10 text-blue-400' 
                  : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {activeView === item.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-full" />
              )}
              <span className={`transition-transform duration-500 ${activeView === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span className="font-bold text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto relative group">
        <div className="absolute inset-0 bg-blue-600/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative bg-slate-800/30 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-700/30 overflow-hidden">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-2xl overflow-hidden flex items-center justify-center">
               {avatarUrl ? (
                 <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-blue-400 text-xs font-black">{profileName.charAt(0)}</span>
               )}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-300 tracking-widest uppercase">Premium</p>
              <p className="text-xs font-bold text-blue-400">FlexTrack Pro</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-4 font-medium">
            Personalized biometric AI analysis and unlimited routines.
          </p>
          <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-[10px] font-black tracking-widest transition-all duration-300 shadow-lg shadow-blue-500/20">
            UPGRADE
          </button>
        </div>
      </div>
    </aside>
  );
};
