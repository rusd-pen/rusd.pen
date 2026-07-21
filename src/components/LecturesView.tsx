import React, { useState, useMemo, useEffect } from 'react';
import { Search, Download, HelpCircle, RefreshCw, Star, MessageSquare, Sparkles, X, Loader2 } from 'lucide-react';
import { Material, Taxonomy, MaterialReview } from '../types';
import { dbService } from '../lib/database';

interface LecturesViewProps {
  materials: Material[];
  taxonomies: Taxonomy[];
  onDownloadMaterial: (id: string) => void;
  onRequestMaterial: (searchQuery: string) => void;
}

export default function LecturesView({
  materials,
  taxonomies,
  onDownloadMaterial,
  onRequestMaterial,
}: LecturesViewProps) {
  const [search, setSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Rating Map state
  const [reviewsMap, setReviewsMap] = useState<Record<string, { avg: number; count: number }>>({});

  // AI states
  const [activeMaterialSummary, setActiveMaterialSummary] = useState<{ id: string; text: string } | null>(null);
  const [isSummarizingId, setIsSummarizingId] = useState<string | null>(null);

  // Reviews Modal states
  const [activeReviewsMaterial, setActiveReviewsMaterial] = useState<Material | null>(null);
  const [materialReviews, setMaterialReviews] = useState<MaterialReview[]>([]);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewEmail, setNewReviewEmail] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewContent, setNewReviewContent] = useState('');

  // AI Smart Search states
  const [smartSearchQuery, setSmartSearchQuery] = useState('');
  const [isSmartSearching, setIsSmartSearching] = useState(false);
  const [smartSearchResult, setSmartSearchResult] = useState<{
    answer: string;
    rankings: { id: string; type: string; relevance: string; reason: string }[];
  } | null>(null);
  const [smartSearchError, setSmartSearchError] = useState<string | null>(null);

  // Popular search items
  const popularSearches = ["Fiqh Islam", "Ushul Fiqh", "Tafsir Ayat", "Semester 3", "Summary", "Semester 1"];

  // Group taxonomies
  const semesters = useMemo(() => taxonomies.filter((t) => t.type === 'semester'), [taxonomies]);
  const courses = useMemo(() => taxonomies.filter((t) => t.type === 'course'), [taxonomies]);
  const types = useMemo(() => taxonomies.filter((t) => t.type === 'type'), [taxonomies]);

  // Load reviews/ratings map on load & when materials/reviews change
  const loadRatingsMap = async () => {
    const map: Record<string, { avg: number; count: number }> = {};
    for (const m of materials) {
      try {
        const reviews = await dbService.getMaterialReviews(m.id);
        if (reviews.length > 0) {
          const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
          map[m.id] = {
            avg: Math.round((sum / reviews.length) * 10) / 10,
            count: reviews.length,
          };
        } else {
          map[m.id] = { avg: 0, count: 0 };
        }
      } catch (err) {
        console.error('Error loading rating for ' + m.id, err);
        map[m.id] = { avg: 0, count: 0 };
      }
    }
    setReviewsMap(map);
  };

  useEffect(() => {
    loadRatingsMap();
  }, [materials]);

  // Handle Popular Search Tag Clicks
  const handlePopularSearchClick = (tag: string) => {
    // If it matches a taxonomy name, apply taxonomy filters
    const matchedTax = taxonomies.find((t) => t.name.toLowerCase().includes(tag.toLowerCase()));
    if (matchedTax) {
      if (matchedTax.type === 'semester') {
        setSelectedSemester(matchedTax.id);
      } else if (matchedTax.type === 'course') {
        setSelectedCourse(matchedTax.id);
      } else if (matchedTax.type === 'type') {
        setSelectedType(matchedTax.id);
      }
    } else {
      // Otherwise search text
      setSearch(tag);
    }
  };

  // Filter materials based on classical search
  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      const matchesSearch =
        material.title.toLowerCase().includes(search.toLowerCase()) ||
        (material.description && material.description.toLowerCase().includes(search.toLowerCase()));

      const matchesSemester = selectedSemester === 'all' || material.semester_id === selectedSemester;
      const matchesCourse = selectedCourse === 'all' || material.course_id === selectedCourse;
      const matchesType = selectedType === 'all' || material.type_id === selectedType;

      return matchesSearch && matchesSemester && matchesCourse && matchesType;
    });
  }, [materials, search, selectedSemester, selectedCourse, selectedType]);

  // Helper to get taxonomy name
  const getTaxName = (id?: string) => {
    if (!id) return '';
    return taxonomies.find((t) => t.id === id)?.name || '';
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedSemester('all');
    setSelectedCourse('all');
    setSelectedType('all');
  };

  // Handle Reviews Drawer/Modal Open
  const handleOpenReviews = async (material: Material) => {
    setActiveReviewsMaterial(material);
    try {
      const reviews = await dbService.getMaterialReviews(material.id);
      setMaterialReviews(reviews);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Review Submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewsMaterial) return;
    if (!newReviewAuthor.trim() || !newReviewEmail.trim() || !newReviewContent.trim()) {
      alert('Mohon lengkapi seluruh kolom formulir ulasan.');
      return;
    }

    try {
      const review = await dbService.createMaterialReview({
        material_id: activeReviewsMaterial.id,
        author_name: newReviewAuthor,
        author_email: newReviewEmail,
        rating: newReviewRating,
        content: newReviewContent,
      });

      setMaterialReviews((prev) => [review, ...prev]);
      setNewReviewAuthor('');
      setNewReviewEmail('');
      setNewReviewRating(5);
      setNewReviewContent('');

      // Refresh global ratings averages
      await loadRatingsMap();
    } catch (err) {
      console.error(err);
    }
  };

  // AI Smart Search
  const handleSmartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartSearchQuery.trim()) return;

    setIsSmartSearching(true);
    setSmartSearchError(null);
    setSmartSearchResult(null);

    try {
      const response = await fetch('/api/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: smartSearchQuery,
          materials: materials,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal memproses pencarian pintar AI.');
      }

      const data = await response.json();
      setSmartSearchResult(data);
    } catch (err: any) {
      console.error(err);
      setSmartSearchError(err.message || 'Gagal terhubung dengan server kecerdasan buatan.');
    } finally {
      setIsSmartSearching(false);
    }
  };

  // AI Summarize
  const handleSummarizeMaterial = async (material: Material) => {
    setIsSummarizingId(material.id);
    setActiveMaterialSummary(null);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'material',
          id: material.id,
          title: material.title,
          content: material.description,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal memproses ringkasan berbasis AI.');
      }

      const data = await response.json();
      setActiveMaterialSummary({ id: material.id, text: data.summary });
    } catch (err: any) {
      alert(err.message || 'Gagal menghasilkan ringkasan otomatis.');
    } finally {
      setIsSummarizingId(null);
    }
  };

  // Simple clean markdown formatter
  const renderMarkdown = (text: string) => {
    const formatBold = (str: string) => {
      return str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    };

    const lines = text.split('\n');
    return (
      <div className="space-y-3 text-sm text-[#3a4f48] leading-relaxed font-sans">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-sans font-bold text-base text-[#1a2e26] mt-5 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1e4646]"></span>
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-sans font-bold text-lg text-[#1a2e26] mt-6 mb-3 border-b border-gray-100 pb-1.5">
                {line.replace('## ', '')}
              </h3>
            );
          }
          if (line.startsWith('# ')) {
            return (
              <h2 key={idx} className="font-sans font-extrabold text-xl text-[#1a2e26] mt-8 mb-4">
                {line.replace('# ', '')}
              </h2>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            const content = line.substring(2);
            return (
              <li key={idx} className="ml-5 list-disc pl-1 text-[#446257]">
                <span dangerouslySetInnerHTML={{ __html: formatBold(content) }} />
              </li>
            );
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-2" />;
          }
          return <p key={idx} className="indent-0" dangerouslySetInnerHTML={{ __html: formatBold(line) }} />;
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mt-12 space-y-10 pb-20" id="lecture-hub-container">
      
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#1e4646]/80 uppercase tracking-widest font-sans">
          Lecture Hub
        </span>
        <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-[#1a2e26] tracking-tight">
          The materials, organized.
        </h1>
        <p className="text-[#446257] text-sm sm:text-base max-w-xl">
          Filter by semester, course, or material type. Discover reviews, smart search and AI-powered talkhis study sheets.
        </p>
      </div>

      {/* AI Smart Search Box */}
      <div className="neumorph-raised rounded-3xl p-6 border border-teal-600/10 bg-[#f4f7f7] relative overflow-hidden" id="ai-smart-search-box">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
          <Sparkles size={180} className="text-[#1e4646]" />
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-[#1e4646]/10 rounded-lg text-[#1e4646]">
            <Sparkles size={18} />
          </div>
          <h2 className="font-sans font-bold text-base text-[#1a2e26]">
            Pencarian Pintar AI (AI Smart Search)
          </h2>
          <span className="text-[10px] bg-teal-800 text-white font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Gemini
          </span>
        </div>

        <form onSubmit={handleSmartSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Tanyakan topik fiqh, semester, atau materi spesifik... (Contoh: 'materi fikh ibadah semester 3')"
            value={smartSearchQuery}
            onChange={(e) => setSmartSearchQuery(e.target.value)}
            className="flex-grow px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1e4646] text-sm bg-white text-gray-800 font-sans"
          />
          <button
            type="submit"
            disabled={isSmartSearching || !smartSearchQuery.trim()}
            className="px-5 py-3 rounded-xl bg-[#1e4646] hover:bg-[#1a3d3d] text-white text-sm font-bold flex items-center gap-2 transition-colors duration-200 disabled:opacity-50 cursor-pointer shadow-md"
          >
            {isSmartSearching ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={15} />}
            <span>Analisis</span>
          </button>
        </form>

        {/* Smart Search Error */}
        {smartSearchError && (
          <p className="text-xs text-red-600 mt-2 font-medium italic">{smartSearchError}</p>
        )}

        {/* Smart Search Results container */}
        {smartSearchResult && (
          <div className="mt-4 p-4 rounded-2xl bg-white border border-[#1e4646]/10 space-y-3 shadow-inner">
            <div className="text-xs font-bold text-[#1e4646]/80 flex items-center gap-1">
              <Sparkles size={11} />
              <span>AI Analisis Pencarian:</span>
            </div>
            <p className="text-sm text-[#3a4f48] leading-relaxed font-sans font-medium">
              {smartSearchResult.answer}
            </p>

            {smartSearchResult.rankings && smartSearchResult.rankings.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 font-mono tracking-wider uppercase">
                  Rekomendasi Dokumen Terkait:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {smartSearchResult.rankings.map((rec) => {
                    const matchedMat = materials.find((m) => m.id === rec.id);
                    if (!matchedMat) return null;
                    return (
                      <div
                        key={rec.id}
                        onClick={() => {
                          const element = document.getElementById(`material-card-${rec.id}`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            element.classList.add('ring-2', 'ring-[#1e4646]', 'ring-offset-2');
                            setTimeout(() => {
                              element.classList.remove('ring-2', 'ring-[#1e4646]', 'ring-offset-2');
                            }, 3000);
                          }
                        }}
                        className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-[#1e4646]/20 transition-all cursor-pointer flex justify-between items-start text-left group"
                      >
                        <div className="space-y-1 max-w-[80%]">
                          <h4 className="font-sans font-bold text-xs text-[#1a2e26] group-hover:text-[#1e4646] line-clamp-1">
                            {matchedMat.title}
                          </h4>
                          <p className="text-[10px] text-gray-500 line-clamp-1">{rec.reason}</p>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            rec.relevance === 'Sangat Relevan'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.relevance === 'Cukup Relevan'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {rec.relevance}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Popular Search tags row */}
      <div className="space-y-2" id="popular-searches-box">
        <span className="text-xs font-bold text-[#446257] font-sans flex items-center gap-1.5">
          Pencarian Populer:
        </span>
        <div className="flex flex-wrap gap-2">
          {popularSearches.map((tag) => (
            <button
              key={tag}
              onClick={() => handlePopularSearchClick(tag)}
              className="px-4 py-1.5 rounded-full bg-white text-[#446257] text-xs font-semibold hover:bg-[#1e4646] hover:text-white border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Filters Bar */}
      <div className="neumorph-raised rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-center border border-white/40" id="lectures-filters-bar">
        
        {/* Search input */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl neumorph-input text-sm text-[#1a2e26] focus:outline-none placeholder-gray-400 font-sans"
          />
        </div>

        {/* Dropdown filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
          
          {/* Semester dropdown */}
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-4 py-3 rounded-xl neumorph-input text-sm focus:outline-none text-[#446257] font-semibold cursor-pointer"
          >
            <option value="all">All semesters</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Course dropdown */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-3 rounded-xl neumorph-input text-sm focus:outline-none text-[#446257] font-semibold cursor-pointer"
          >
            <option value="all">All courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Type dropdown */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 rounded-xl neumorph-input text-sm focus:outline-none text-[#446257] font-semibold cursor-pointer"
          >
            <option value="all">All types</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

        </div>

      </div>

      {/* Materials Results Info */}
      <div className="flex justify-between items-center text-xs text-[#446257] px-1 font-mono">
        <span>{filteredMaterials.length} materials found</span>
        {(search || selectedSemester !== 'all' || selectedCourse !== 'all' || selectedType !== 'all') && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 hover:text-[#1e4646] cursor-pointer font-bold"
          >
            <RefreshCw size={10} />
            Reset filters
          </button>
        )}
      </div>

      {/* Materials List / Grid */}
      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="lectures-grid">
          {filteredMaterials.map((material) => {
            const currentRatings = reviewsMap[material.id] || { avg: 0, count: 0 };
            return (
              <div
                key={material.id}
                id={`material-card-${material.id}`}
                className="neumorph-raised rounded-2xl p-6 border border-white/40 flex flex-col justify-between hover:shadow-[3px_3px_6px_#d5dadb,_-3px_-3px_6px_#ffffff] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
              >
                <div className="space-y-3">
                  {/* Meta Pill Tags */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-3 py-1 rounded-md bg-[#e6ecec] text-[#1e4646] text-[10px] font-bold font-sans shadow-[inset_1px_1px_2px_#d5dadb]">
                        {getTaxName(material.semester_id)}
                      </span>
                      <span className="px-3 py-1 rounded-md bg-amber-500/10 text-amber-800 text-[10px] font-bold font-sans shadow-[inset_1px_1px_2px_rgba(245,158,11,0.15)]">
                        {getTaxName(material.course_id)}
                      </span>
                      <span className="px-3 py-1 rounded-md bg-gray-200/60 text-[#3a4f48] text-[10px] font-bold font-sans shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)]">
                        {getTaxName(material.type_id)}
                      </span>
                    </div>

                    {/* Star ratings indicator on card */}
                    {currentRatings.count > 0 ? (
                      <div className="flex items-center gap-1 bg-[#1e4646]/5 px-2.5 py-1 rounded-full text-xs font-bold text-[#1e4646] border border-[#1e4646]/10">
                        <Star size={11} className="text-[#1e4646] fill-current" />
                        <span>{currentRatings.avg}</span>
                        <span className="text-gray-400 text-[10px] font-normal">({currentRatings.count})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-full text-[10px] text-gray-400 border border-gray-100">
                        <Star size={10} />
                        <span>Belum dirating</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-sans font-bold text-lg text-[#1a2e26] leading-snug">
                    {material.title}
                  </h3>
                  
                  <p className="text-sm text-[#446257] leading-relaxed font-sans">
                    {material.description || 'No detailed description provided.'}
                  </p>
                </div>

                {/* Card Footer actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200/50 mt-6 pt-4 gap-3 text-xs">
                  <span className="text-[#446257]/60 font-mono">
                    Downloads: <strong className="text-[#1e4646] font-semibold">{material.download_count}</strong>
                  </span>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Ratings & Reviews button */}
                    <button
                      onClick={() => handleOpenReviews(material)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#1e4646]/5 hover:bg-[#1e4646]/10 text-[#1e4646] font-bold transition-all border border-transparent hover:border-[#1e4646]/10 cursor-pointer"
                      title="Lihat Ulasan"
                    >
                      <MessageSquare size={12} />
                      <span>Ulasan</span>
                    </button>

                    {/* AI Summarize study button */}
                    <button
                      disabled={isSummarizingId === material.id}
                      onClick={() => handleSummarizeMaterial(material)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-800 font-bold transition-all border border-teal-500/10 cursor-pointer"
                    >
                      {isSummarizingId === material.id ? (
                        <Loader2 size={12} className="animate-spin text-teal-800" />
                      ) : (
                        <Sparkles size={12} className="text-teal-700" />
                      )}
                      <span>Ringkas AI</span>
                    </button>

                    {/* Download Button */}
                    <button
                      onClick={() => onDownloadMaterial(material.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1e4646] hover:bg-[#1a3d3d] text-white font-bold transition-all shadow-md cursor-pointer"
                    >
                      <Download size={11} />
                      <span>Unduh</span>
                      <span className="text-[9px] opacity-80 font-mono">({material.file_size || 'pdf'})</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty state matching the screenshots */
        <div className="neumorph-sunken rounded-2xl p-12 text-center border border-dashed border-gray-200/80 max-w-2xl mx-auto space-y-4" id="lectures-empty-state">
          <HelpCircle size={40} className="mx-auto text-gray-400" />
          <h3 className="font-sans font-bold text-lg text-[#1a2e26]">Nothing matches those filters yet.</h3>
          <p className="text-sm text-[#446257] max-w-md mx-auto">
            If you are looking for a specific midterm summary, question bank, or notebook note, click below to send a request.
          </p>
          <button
            onClick={() => onRequestMaterial(search)}
            className="px-6 py-3 rounded-full neumorph-btn text-xs font-bold transition-all cursor-pointer"
          >
            Request this material
          </button>
        </div>
      )}

      {/* AI Summary Light Modal */}
      {activeMaterialSummary && (
        <div className="fixed inset-0 bg-[#1a2e26]/30 backdrop-blur-xl z-100 flex items-center justify-center p-4">
          <div className="bg-white max-w-3xl w-full rounded-3xl p-6 shadow-2xl flex flex-col space-y-4 max-h-[85vh] border border-white">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-teal-500/10 text-teal-800 rounded-lg">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-sans font-extrabold text-base text-[#1a2e26]">
                    Ringkasan Berbasis AI
                  </h3>
                  <p className="text-[10px] text-teal-800 font-mono font-bold tracking-wider uppercase">
                    Al-Azhar Academic Assistant
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveMaterialSummary(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto pr-1">
              {renderMarkdown(activeMaterialSummary.text)}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 font-sans">
              <span>Hasil ringkasan bersifat edukatif. Tetap rujuk materi utama kuliah.</span>
              <button
                onClick={() => setActiveMaterialSummary(null)}
                className="px-4 py-2 rounded-xl bg-[#1e4646] hover:bg-[#1a3d3d] text-white font-bold transition-colors cursor-pointer text-xs"
              >
                Selesai Membaca
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ratings & Reviews Modal */}
      {activeReviewsMaterial && (
        <div className="fixed inset-0 bg-[#1a2e26]/30 backdrop-blur-xl z-100 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-6 shadow-2xl flex flex-col space-y-4 max-h-[85vh] border border-white">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-sans font-extrabold text-lg text-[#1a2e26]">
                  Ulasan &amp; Rating Materi
                </h3>
                <p className="text-xs text-gray-500 font-sans">{activeReviewsMaterial.title}</p>
              </div>
              <button
                onClick={() => {
                  setActiveReviewsMaterial(null);
                  loadRatingsMap();
                }}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-4 pr-1">
              {/* Existing Reviews list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#1e4646] uppercase tracking-wider font-mono">
                  Ulasan Mahasiswa ({materialReviews.length})
                </h4>

                {materialReviews.length > 0 ? (
                  <div className="space-y-3">
                    {materialReviews.map((rev) => (
                      <div key={rev.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="font-sans font-bold text-xs text-[#1a2e26] block">
                              {rev.author_name}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {new Date(rev.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          
                          {/* Stars display */}
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={i < rev.rating ? 'fill-current' : 'text-gray-200'}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-[#446257] leading-relaxed font-sans">{rev.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic py-4 text-center">
                    Belum ada ulasan untuk materi ini. Jadilah yang pertama memberikan penilaian!
                  </p>
                )}
              </div>

              {/* Leave a review form */}
              <form onSubmit={handleSubmitReview} className="border-t border-gray-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-[#1e4646] uppercase tracking-wider font-mono">
                  Tulis Ulasan Anda
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#446257] font-sans">NAMA</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap"
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1e4646] bg-white text-gray-800 font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#446257] font-sans">EMAIL</label>
                    <input
                      type="email"
                      required
                      placeholder="email@mhs.id"
                      value={newReviewEmail}
                      onChange={(e) => setNewReviewEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1e4646] bg-white text-gray-800 font-sans"
                    />
                  </div>
                </div>

                {/* Stars selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#446257] font-sans block">RATING</label>
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setNewReviewRating(i + 1)}
                        className="hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          size={20}
                          className={i < newReviewRating ? 'fill-current text-amber-500' : 'text-gray-200'}
                        />
                      </button>
                    ))}
                    <span className="text-xs text-gray-400 font-sans ml-2 font-semibold">
                      ({newReviewRating} dari 5 bintang)
                    </span>
                  </div>
                </div>

                {/* Review content */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#446257] font-sans">ISI ULASAN</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Tulis pendapat atau ulasan Anda mengenai kejelasan materi ini..."
                    value={newReviewContent}
                    onChange={(e) => setNewReviewContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1e4646] bg-white text-gray-800 font-sans resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#1e4646] hover:bg-[#1a3d3d] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Kirim Ulasan &amp; Rating
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
