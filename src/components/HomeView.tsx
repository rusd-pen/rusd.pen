import React from 'react';
import { BookOpen, ArrowRight, Download, FileText, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { Article, Material, Taxonomy } from '../types';
import Logo from './Logo';

interface HomeViewProps {
  articles: Article[];
  materials: Material[];
  taxonomies: Taxonomy[];
  onNavigate: (view: string) => void;
  onDownloadMaterial: (id: string) => void;
  onSelectArticle: (article: Article) => void;
}

export default function HomeView({
  articles,
  materials,
  taxonomies,
  onNavigate,
  onDownloadMaterial,
  onSelectArticle,
}: HomeViewProps) {
  // Get latest 2 published articles
  const latestArticles = articles
    .filter((a) => a.status === 'published')
    .slice(0, 2);

  // Get latest 2 materials
  const latestMaterials = materials.slice(0, 2);

  // Helper to get taxonomy name by ID
  const getTaxName = (id?: string) => {
    if (!id) return '';
    return taxonomies.find((t) => t.id === id)?.name || '';
  };

  // Framer motion variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 120,
        damping: 14
      }
    }
  };

  const springButton = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 15
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mt-12 md:mt-16 space-y-24" id="home-view-container">
      
      {/* Hero Section with Grid and Neumorphic Plate */}
      <section className="relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-12 items-center hero-thin-grid p-8 md:p-12 rounded-3xl shadow-[inset_6px_6px_12px_#d5dadb,_inset_-6px_-6px_12px_#ffffff] border border-white/40" id="homepage-hero-section">
        
        {/* Background thin gradient drifting/floating circles */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl -z-10 pointer-events-none">
          <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full border border-[#1e4646]/10 bg-gradient-to-tr from-[#1e4646]/5 to-transparent blur-xl animate-drift-slow-1" />
          <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full border border-[#1e4646]/5 bg-gradient-to-bl from-[#1e4646]/5 to-transparent blur-2xl animate-drift-slow-2" />
          <div className="absolute top-1/4 right-1/3 w-48 h-48 rounded-full border border-[#1e4646]/10 bg-[#1e4646]/3 blur-lg animate-drift-slow-1" style={{ animationDelay: '-5s' }} />
        </div>

        {/* Left Hero Content */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-3" id="hero-syariah-tagline">
            <span className="w-8 h-[1px] bg-[#1e4646]/40" />
            <span className="text-xs font-bold text-[#1e4646] uppercase tracking-widest font-sans">
              A quiet corner of Syariah Islamiyyah
            </span>
          </div>

          <h1 className="font-sans font-extrabold text-4xl sm:text-5xl md:text-6xl text-[#1a2e26] leading-[1.1] tracking-tight">
            Lecture materials,<br />
            <span className="text-[#1e4646]">honest writing</span>,<br />
            nothing extra.
          </h1>

          <p className="text-base sm:text-lg text-[#446257] leading-relaxed max-w-xl font-sans">
            Free summaries, dictations, question banks, and notes for students majoring in syariah islamiyyah at Al-Azhar University — as well as personal essays on the ideas that fill the margins of textbooks.
          </p>

          <div className="flex flex-wrap gap-4 pt-4" id="hero-button-actions">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={springButton}
              onClick={() => onNavigate('lectures')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-full neumorph-btn-teal font-bold text-sm cursor-pointer"
            >
              <BookOpen size={16} />
              Browse lectures
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={springButton}
              onClick={() => onNavigate('articles')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-full neumorph-btn font-bold text-sm cursor-pointer"
            >
              Read the blog
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </div>

        {/* Right Hero Content: Beautiful 3D-feeling card and desk widget */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative" id="hero-desk-widget-container">
          <div className="relative w-full max-w-[340px] aspect-square rounded-3xl neumorph-raised flex items-center justify-center p-8 border border-white/50">
            <Logo size={180} className="drop-shadow-[0_15px_30px_rgba(30,70,70,0.15)] hover:scale-105 transition-all duration-300" />
          </div>

          {/* Currently on the desk status capsule */}
          <div className="neumorph-raised w-full max-w-[340px] rounded-2xl p-4 mt-6 border border-white/40">
            <span className="text-[10px] font-bold text-[#1e4646]/60 uppercase tracking-widest block mb-1 font-mono">
              Currently on the desk
            </span>
            <p className="text-sm font-semibold text-[#1a2e26] flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#1e4646] animate-ping" />
              {materials.length > 0 ? (
                <span>{materials.length} resource(s) archived &amp; ready</span>
              ) : (
                <span>No materials uploaded yet.</span>
              )}
            </p>
          </div>
        </div>

      </section>

      {/* Dual Column Bottom Section: Articles & Materials */}
      <motion.section 
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-12" 
        id="homepage-bottom-columns"
      >
        
        {/* Left Column: Latest Articles */}
        <div className="space-y-6">
          <div className="flex justify-between items-baseline border-b border-gray-200/50 pb-3">
            <h2 className="font-sans font-bold text-2xl text-[#1a2e26]">Latest articles</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={springButton}
              onClick={() => onNavigate('articles')}
              className="text-xs font-bold text-[#1e4646] hover:underline flex items-center gap-1 cursor-pointer"
            >
              All articles <ArrowRight size={12} />
            </motion.button>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {latestArticles.length > 0 ? (
              latestArticles.map((article) => (
                <motion.article
                  variants={staggerItem}
                  whileHover={{ scale: 1.015 }}
                  transition={springButton}
                  key={article.id}
                  onClick={() => onSelectArticle(article)}
                  className="neumorph-raised rounded-2xl p-6 border border-white/40 hover:shadow-[3px_3px_6px_#d5dadb,_-3px_-3px_6px_#ffffff] transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-xs text-[#446257] mb-2 font-mono">
                    <span>{article.category}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(article.published_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  <h3 className="font-sans font-bold text-lg text-[#1a2e26] group-hover:text-[#1e4646] transition-colors leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-sm text-[#446257] mt-2 line-clamp-2 leading-relaxed">
                    {article.excerpt || article.content.substring(0, 120) + '...'}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1e4646] mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Read essay</span>
                    <ArrowRight size={12} />
                  </div>
                </motion.article>
              ))
            ) : (
              <div className="neumorph-sunken rounded-2xl p-12 text-center border border-dashed border-gray-200">
                <FileText size={32} className="mx-auto text-gray-400 mb-3" />
                <p className="text-sm text-gray-500 font-sans">No articles published yet.</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column: Fresh from the lecture hall (Materials) */}
        <div className="space-y-6">
          <div className="flex justify-between items-baseline border-b border-gray-200/50 pb-3">
            <h2 className="font-sans font-bold text-2xl text-[#1a2e26]">Fresh from the lecture hall</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={springButton}
              onClick={() => onNavigate('lectures')}
              className="text-xs font-bold text-[#1e4646] hover:underline flex items-center gap-1 cursor-pointer"
            >
              All materials <ArrowRight size={12} />
            </motion.button>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {latestMaterials.length > 0 ? (
              latestMaterials.map((material) => (
                <motion.div
                  variants={staggerItem}
                  whileHover={{ scale: 1.015 }}
                  transition={springButton}
                  key={material.id}
                  className="neumorph-raised rounded-2xl p-6 border border-white/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-[3px_3px_6px_#d5dadb,_-3px_-3px_6px_#ffffff] transition-all duration-300"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#1e4646]/5 text-[#1e4646] text-[10px] font-bold font-sans">
                        {getTaxName(material.semester_id)}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#93a39e]/15 text-[#3a4f48] text-[10px] font-bold font-sans">
                        {getTaxName(material.type_id)}
                      </span>
                    </div>
                    <h3 className="font-sans font-semibold text-base text-[#1a2e26] leading-snug">
                      {material.title}
                    </h3>
                    <p className="text-xs text-[#446257] line-clamp-1 font-sans">
                      {material.description || 'No description provided.'}
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={springButton}
                    onClick={() => onDownloadMaterial(material.id)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full neumorph-btn text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 self-end sm:self-center"
                  >
                    <Download size={12} />
                    <span>Download</span>
                    <span className="text-[10px] opacity-70 font-mono">({material.file_size || 'N/A'})</span>
                  </motion.button>
                </motion.div>
              ))
            ) : (
              <div className="neumorph-sunken rounded-2xl p-12 text-center border border-dashed border-gray-200">
                <BookOpen size={32} className="mx-auto text-gray-400 mb-3" />
                <p className="text-sm text-gray-500 font-sans">No materials uploaded yet.</p>
              </div>
            )}
          </motion.div>
        </div>

      </motion.section>

    </div>
  );
}

