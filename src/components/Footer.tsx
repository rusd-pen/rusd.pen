import React from 'react';
import { LayoutGrid, Type, Edit3, MessageCircle, Shield, UserCheck, LogOut, Instagram } from 'lucide-react';
import { AdminUser } from '../types';

interface FooterProps {
  onNavigate: (view: string) => void;
  adminUser: AdminUser | null;
  onLogout: () => void;
}

export default function Footer({ onNavigate, adminUser, onLogout }: FooterProps) {
  return (
    <footer className="w-full max-w-7xl mx-auto px-4 mt-20 pb-24" id="rusd-pen-footer">
      <div className="glass-panel rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start gap-8 shadow-sm border border-white/50">
        
        {/* Left Side: Brand & Mission */}
        <div className="max-w-md flex flex-col justify-between h-full gap-4">
          <div>
            <h3 className="font-sans font-bold text-lg text-[#1e4646]">Rusd.Pen</h3>
            <p className="text-sm text-[#446257] mt-2 leading-relaxed">
              Free lecture materials for university students, and personal writing on ideas that matter. Made for students majoring in syariah islamiyyah at Al-Azhar University.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/binzaen_nizar/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e4646]/5 hover:bg-[#1e4646]/10 text-[#1e4646] text-xs font-bold transition-all duration-200 border border-white/50 shadow-sm"
              title="Kunjungi Instagram Saya"
            >
              <Instagram size={14} className="text-[#e1306c]" />
              <span>@binzaen_nizar</span>
            </a>
          </div>
        </div>

        {/* Right Side: Links */}
        <div className="flex flex-wrap gap-x-12 gap-y-6">
          <div>
            <h4 className="text-xs font-semibold text-[#1e4646] uppercase tracking-wider mb-3">Sections</h4>
            <div className="flex flex-col gap-2">
              <button onClick={() => onNavigate('lectures')} className="text-sm text-[#446257] hover:text-[#1e4646] cursor-pointer text-left">Lectures</button>
              <button onClick={() => onNavigate('articles')} className="text-sm text-[#446257] hover:text-[#1e4646] cursor-pointer text-left">Articles</button>
              <button onClick={() => onNavigate('about')} className="text-sm text-[#446257] hover:text-[#1e4646] cursor-pointer text-left">About</button>
              <button onClick={() => onNavigate('contact')} className="text-sm text-[#446257] hover:text-[#1e4646] cursor-pointer text-left">Contact</button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#1e4646] uppercase tracking-wider mb-3">Admin Panel</h4>
            <div className="flex flex-col gap-2">
              {adminUser ? (
                <>
                  <button onClick={() => onNavigate('admin')} className="text-sm text-[#446257] hover:text-[#1e4646] cursor-pointer flex items-center gap-1.5 text-left">
                    <UserCheck size={14} className="text-[#1e4646]" />
                    Dashboard
                  </button>
                  <button onClick={onLogout} className="text-sm text-red-700 hover:text-red-900 cursor-pointer flex items-center gap-1.5 text-left">
                    <LogOut size={14} />
                    Sign out
                  </button>
                </>
              ) : (
                <button onClick={() => onNavigate('login')} className="text-sm text-[#446257] hover:text-[#1e4646] cursor-pointer flex items-center gap-1.5 text-left">
                  <Shield size={14} />
                  Sign in
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Copyright line */}
      <div className="text-center text-xs text-[#446257]/60 mt-6" id="footer-copyright-text">
        © 2026 Rusd.Pen. Built with care.
      </div>

      {/* Signature Floating Action Bar Capsule at the bottom-center */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50" id="floating-action-bar-capsule">
        <div className="bg-white/80 backdrop-blur-xl border border-white/80 shadow-lg shadow-[#1e4646]/5 rounded-full px-4 py-2 flex items-center gap-4">
          <button
            onClick={() => onNavigate('lectures')}
            title="Browse Lectures"
            className="p-2 text-[#446257] hover:text-[#1e4646] hover:bg-[#1e4646]/5 rounded-full transition-all duration-200 cursor-pointer"
          >
            <LayoutGrid size={16} />
          </button>
          
          <div className="w-px h-4 bg-gray-200" />
          
          <button
            onClick={() => onNavigate('articles')}
            title="Read Articles"
            className="p-2 text-[#446257] hover:text-[#1e4646] hover:bg-[#1e4646]/5 rounded-full transition-all duration-200 cursor-pointer"
          >
            <Type size={16} />
          </button>
          
          <div className="w-px h-4 bg-gray-200" />
          
          <button
            onClick={() => onNavigate('contact')}
            title="Write / Contact"
            className="p-2 text-[#446257] hover:text-[#1e4646] hover:bg-[#1e4646]/5 rounded-full transition-all duration-200 cursor-pointer"
          >
            <Edit3 size={16} />
          </button>
          
          <div className="w-px h-4 bg-gray-200" />
          
          <button
            onClick={() => onNavigate('contact')}
            title="Submit Feedback"
            className="p-2 text-[#446257] hover:text-[#1e4646] hover:bg-[#1e4646]/5 rounded-full transition-all duration-200 cursor-pointer"
          >
            <MessageCircle size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}
