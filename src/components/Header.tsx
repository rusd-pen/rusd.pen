import React from 'react';
import { BookOpen, FileText, User, Mail, Search, ShieldCheck, Sun, Moon, Award } from 'lucide-react';
import { motion } from 'motion/react';
import Logo from './Logo';
import { AdminUser } from '../types';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  adminUser: AdminUser | null;
  onOpenSearch: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Header({ currentView, onNavigate, adminUser, onOpenSearch, darkMode, onToggleDarkMode }: HeaderProps) {
  const springTransition = { type: 'spring' as const, stiffness: 300, damping: 15 };

  const navItems = [
    { id: 'lectures', label: 'Lectures', icon: BookOpen },
    { id: 'articles', label: 'Articles', icon: FileText },
    { id: 'about', label: 'About', icon: User },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  return (
    <header className="w-full max-w-7xl mx-auto px-4 pt-6" id="rusd-pen-header">
      <div className="glass-panel rounded-full px-6 py-3 flex items-center justify-between shadow-[6px_6px_12px_#d5dadb,_-6px_-6px_12px_#ffffff] border border-white/40">
        
        {/* Brand Logo & Name */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={springTransition}
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1.5 p-1 rounded-full hover:shadow-[inset_2px_2px_5px_#d5dadb,_inset_-2px_-2px_5px_#ffffff] hover:bg-[#f3f6f6]/50 transition-all cursor-pointer shrink-0"
          id="header-brand-logo"
        >
          <Logo size={26} />
          <span className="font-sans font-bold text-base md:text-lg text-[#1e4646] tracking-tight pr-1 hidden min-[480px]:inline">
            RusdPen
          </span>
        </motion.button>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-6" id="header-navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={springTransition}
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'shadow-[inset_3px_3px_6px_#d5dadb,_inset_-3px_-3px_6px_#ffffff] bg-[#ebf0f0] text-[#1e4646]'
                    : 'text-[#446257] hover:text-[#1e4646] hover:shadow-[inset_3px_3px_6px_#d5dadb,_inset_-3px_-3px_6px_#ffffff] hover:bg-[#ebf0f0]/30'
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline md:hidden lg:inline">{item.label}</span>
              </motion.button>
            );
          })}

          {/* Quick link to Admin if logged in */}
          {adminUser && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={springTransition}
              onClick={() => onNavigate('admin')}
              className={`flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                currentView === 'admin'
                  ? 'shadow-[inset_3px_3px_6px_#d5dadb,_inset_-3px_-3px_6px_#ffffff] bg-amber-500/10 text-amber-800'
                  : 'text-amber-800 bg-amber-500/5 hover:bg-amber-500/10 hover:shadow-[inset_3px_3px_6px_#d5dadb,_inset_-3px_-3px_6px_#ffffff]'
              }`}
            >
              <ShieldCheck size={14} />
              <span className="hidden sm:inline md:hidden lg:inline">Dashboard</span>
            </motion.button>
          )}
        </nav>

        {/* Search Bar / Button */}
        <div className="flex items-center gap-1.5 min-[400px]:gap-2" id="header-actions">
          {/* Mobile menu trigger equivalent */}
          <div className="md:hidden flex items-center gap-1 min-[400px]:gap-1.5">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={springTransition}
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={item.label}
                  className={`p-1.5 min-[400px]:p-2 rounded-full transition-all cursor-pointer ${
                    isActive 
                      ? 'shadow-[inset_2px_2px_5px_#d5dadb,_inset_-2px_-2px_5px_#ffffff] bg-[#ebf0f0] text-[#1e4646]' 
                      : 'text-[#446257] hover:shadow-[inset_2px_2px_5px_#d5dadb,_inset_-2px_-2px_5px_#ffffff] hover:bg-[#ebf0f0]/30'
                  }`}
                >
                  <item.icon size={15} />
                </motion.button>
              );
            })}
            {adminUser && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={springTransition}
                onClick={() => onNavigate('admin')}
                title="Admin Dashboard"
                className={`p-1.5 min-[400px]:p-2 rounded-full transition-all cursor-pointer ${
                  currentView === 'admin' 
                    ? 'shadow-[inset_2px_2px_5px_#d5dadb,_inset_-2px_-2px_5px_#ffffff] bg-amber-500/10 text-amber-800' 
                    : 'text-amber-700 bg-amber-500/5 hover:shadow-[inset_2px_2px_5px_#d5dadb,_inset_-2px_-2px_5px_#ffffff]'
                }`}
              >
                <ShieldCheck size={15} />
              </motion.button>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={springTransition}
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-full neumorph-btn text-[#1e4646] flex items-center justify-center cursor-pointer shrink-0"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            id="dark-mode-toggle-btn"
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={springTransition}
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 min-[400px]:px-4 min-[400px]:py-2 lg:px-5 rounded-full neumorph-btn text-xs min-[400px]:text-sm font-semibold cursor-pointer shrink-0"
            id="search-trigger-btn"
          >
            <Search size={14} />
            <span className="hidden lg:inline">Search</span>
          </motion.button>
        </div>

      </div>
    </header>
  );
}
