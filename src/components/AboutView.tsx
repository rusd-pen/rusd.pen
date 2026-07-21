import React from 'react';
import { BookOpen, PenTool, Mail, ArrowRight, Instagram } from 'lucide-react';
import { motion } from 'motion/react';

interface AboutViewProps {
  onNavigate: (view: string) => void;
}

export default function AboutView({ onNavigate }: AboutViewProps) {
  // Stagger animation definitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 120,
        damping: 15,
      },
    },
  };

  const springButton = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 15,
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 mt-12 space-y-10" id="about-view-container">
      
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2"
      >
        <span className="text-xs font-bold text-[#1e4646]/80 uppercase tracking-widest font-sans">
          ABOUT
        </span>
        <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-[#1a2e26] tracking-tight">
          Hi, I made this place.
        </h1>
      </motion.div>

      {/* Main Narrative Text Block wrapped in beautiful Soft Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="neumorph-raised p-8 rounded-2xl border border-white/40 space-y-6 text-base text-[#446257] leading-relaxed font-sans" 
        id="about-narrative"
      >
        <p>
          <strong className="text-[#1e4646] font-bold">RusdPen</strong> is a small, personal library — half lecture materials, half writing desk. The academic side collects the notes, summaries and question banks I found useful during my own studies, organized so a fellow student can find them in ten seconds.
        </p>
        <p>
          The blog is where I write about the things that don't fit inside a syllabus — technology, opinions, moments from daily life. No newsletter pop-ups, no cookies chasing you around. Just words and files.
        </p>
      </motion.div>

      {/* 3-Card Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-5" 
        id="about-shortcuts-grid"
      >
        
        {/* Card 1: Lectures */}
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={springButton}
          onClick={() => onNavigate('lectures')}
          className="neumorph-raised text-left p-6 rounded-2xl border border-white/40 hover:shadow-[3px_3px_6px_#d5dadb,_-3px_-3px_6px_#ffffff] transition-all duration-300 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#f3f6f6] shadow-[inset_2px_2px_4px_#d5dadb,_inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-[#1e4646] mb-4">
            <BookOpen size={18} />
          </div>
          <h3 className="font-sans font-bold text-sm text-[#1a2e26]">Lectures</h3>
          <p className="text-xs text-[#446257] mt-1.5 group-hover:text-[#1e4646] transition-colors flex items-center gap-1">
            Browse materials <ArrowRight size={10} />
          </p>
        </motion.button>

        {/* Card 2: Articles */}
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={springButton}
          onClick={() => onNavigate('articles')}
          className="neumorph-raised text-left p-6 rounded-2xl border border-white/40 hover:shadow-[3px_3px_6px_#d5dadb,_-3px_-3px_6px_#ffffff] transition-all duration-300 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#f3f6f6] shadow-[inset_2px_2px_4px_#d5dadb,_inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-[#1e4646] mb-4">
            <PenTool size={18} />
          </div>
          <h3 className="font-sans font-bold text-sm text-[#1a2e26]">Articles</h3>
          <p className="text-xs text-[#446257] mt-1.5 group-hover:text-[#1e4646] transition-colors flex items-center gap-1">
            Read the essays <ArrowRight size={10} />
          </p>
        </motion.button>

        {/* Card 3: Contact */}
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={springButton}
          onClick={() => onNavigate('contact')}
          className="neumorph-raised text-left p-6 rounded-2xl border border-white/40 hover:shadow-[3px_3px_6px_#d5dadb,_-3px_-3px_6px_#ffffff] transition-all duration-300 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#f3f6f6] shadow-[inset_2px_2px_4px_#d5dadb,_inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-[#1e4646] mb-4">
            <Mail size={18} />
          </div>
          <h3 className="font-sans font-bold text-sm text-[#1a2e26]">Say hi</h3>
          <p className="text-xs text-[#446257] mt-1.5 group-hover:text-[#1e4646] transition-colors flex items-center gap-1">
            Or request materials <ArrowRight size={10} />
          </p>
        </motion.button>

      </motion.div>

      {/* Quote citation section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="border-l-2 border-[#1e4646] pl-4 italic text-sm text-[#1a2e26]/80 font-serif pt-2" 
        id="about-quote-block"
      >
        &ldquo;The pen is the tongue of the mind.&rdquo; — Miguel de Cervantes
      </motion.div>

      {/* Get in touch and Social action buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="pt-4 flex flex-wrap gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={springButton}
          onClick={() => onNavigate('contact')}
          className="px-6 py-3.5 rounded-full neumorph-btn-teal font-bold text-sm cursor-pointer"
        >
          Get in touch
        </motion.button>

        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={springButton}
          href="https://www.instagram.com/binzaen_nizar/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full neumorph-btn font-bold text-sm cursor-pointer"
        >
          <Instagram size={16} className="text-[#e1306c]" />
          <span>Instagram</span>
        </motion.a>
      </motion.div>

    </div>
  );
}
