import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, X, Image, Video, Code, Quote, Minus, Search, Share2, Download,
  Check, Edit3, Trash2, BookOpen, Clock, Calendar, CheckCircle, AlertCircle,
  ChevronDown, Settings, HelpCircle, Bell, ExternalLink, RefreshCw, Send, Copy
} from 'lucide-react';
import { Article } from '../types';

interface MediumEditorViewProps {
  articles: Article[];
  onCreateArticle: (art: Omit<Article, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  onUpdateArticle: (id: string, updates: Partial<Article>) => Promise<any>;
  onDeleteArticle: (id: string) => Promise<any>;
  onClose: () => void;
}

interface EditorBlock {
  id: string;
  type: 'p' | 'h2' | 'blockquote' | 'code' | 'ul' | 'ol' | 'hr' | 'img';
  content: string;
  extraUrl?: string; // for image source or code language or video url
}

type DashboardTab = 'drafts' | 'published' | 'unlisted';

const IMAGE_PRESETS = [
  { url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80', label: 'Library / Buku' },
  { url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80', label: 'Lentera / Suasana Syariah' },
  { url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80', label: 'Meja Menulis' },
  { url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80', label: 'Kitab / Klasik' },
];

export default function MediumEditorView({
  articles,
  onCreateArticle,
  onUpdateArticle,
  onDeleteArticle,
  onClose,
}: MediumEditorViewProps) {
  // Navigation states
  const [activeTab, setActiveTab] = useState<DashboardTab>('published');
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'editor'>('dashboard');
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  // Editor states
  const [storyTitle, setStoryTitle] = useState('');
  const [storyExcerpt, setStoryExcerpt] = useState('');
  const [storyCategory, setStoryCategory] = useState('Syariah');
  const [storyStatus, setStoryStatus] = useState<'draft' | 'published'>('published');
  const [storyContent, setStoryContent] = useState('');
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [showImageDropdown, setShowImageDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showHintsModal, setShowHintsModal] = useState(false);

  // Refs for auto-growing inputs and cursor manipulation
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const excerptRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Share Poster Generator States
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [posterArticle, setPosterArticle] = useState<Article | null>(null);
  const [posterStyle, setPosterStyle] = useState<'classic' | 'warm' | 'teal' | 'slate'>('classic');
  const [copiedLink, setCopiedLink] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto-Save notification simulator
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'draft'>('saved');
  const [isSaving, setIsSaving] = useState(false);

  // Trigger auto-save visual feedback
  useEffect(() => {
    if (currentScreen === 'editor') {
      setSaveStatus('saving');
      const timer = setTimeout(() => {
        setSaveStatus('saved');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [storyContent, storyTitle, storyExcerpt, storyCategory, storyStatus, currentScreen]);

  // Handle auto-resizing textareas when editor mounts or article loads
  useEffect(() => {
    if (currentScreen === 'editor') {
      const resizeAll = () => {
        if (titleRef.current) {
          titleRef.current.style.height = 'auto';
          titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
        }
        if (excerptRef.current) {
          excerptRef.current.style.height = 'auto';
          excerptRef.current.style.height = excerptRef.current.scrollHeight + 'px';
        }
        if (contentRef.current) {
          contentRef.current.style.height = 'auto';
          contentRef.current.style.height = Math.max(400, contentRef.current.scrollHeight) + 'px';
        }
      };
      
      // Delay slightly to ensure layout and styles are computed correctly
      const timer1 = setTimeout(resizeAll, 50);
      const timer2 = setTimeout(resizeAll, 150);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [currentScreen, editingArticleId]);

  // Handle parse article content into blocks when editing (now directly using raw text)
  const loadArticleForEditing = (art: Article) => {
    setEditingArticleId(art.id);
    setStoryTitle(art.title);
    setStoryExcerpt(art.excerpt || '');
    setStoryCategory(art.category || 'Syariah');
    setStoryStatus(art.status);
    setStoryContent(art.content || '');
    setCurrentScreen('editor');
  };

  // Create new blank story
  const handleNewStory = () => {
    setEditingArticleId(null);
    setStoryTitle('');
    setStoryExcerpt('');
    setStoryCategory('Syariah');
    setStoryStatus('published');
    setStoryContent('');
    setCurrentScreen('editor');
  };

  // Save changes to database
  const handleSavePublish = async () => {
    if (!storyTitle.trim()) {
      alert('Tolong masukkan judul artikel terlebih dahulu!');
      return;
    }

    if (isSaving) return;

    const slug = storyTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const articlePayload = {
      title: storyTitle,
      slug,
      excerpt: storyExcerpt || storyTitle.substring(0, 100),
      content: storyContent || 'Tulisan artikel kosong...',
      category: storyCategory,
      status: storyStatus,
      published_at: new Date().toISOString()
    };

    setIsSaving(true);
    try {
      if (editingArticleId) {
        await onUpdateArticle(editingArticleId, articlePayload);
      } else {
        await onCreateArticle(articlePayload);
      }
      setCurrentScreen('dashboard');
    } catch (error: any) {
      console.error('Gagal menyimpan artikel:', error);
      // Notice: Alert has already been shown inside dbService with detailed error.
    } finally {
      setIsSaving(false);
    }
  };

  // Insert markdown tag/component at cursor position
  const insertAtCursor = (markdown: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = storyContent;
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    const newContent = before + markdown + after;
    setStoryContent(newContent);
    
    // Reset focus and cursor position after state update
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + markdown.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      
      // Auto grow height
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(400, textarea.scrollHeight) + 'px';
    }, 50);
  };

  // Calculate estimated read time
  const getReadTime = (content: string): number => {
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  // Get filtered articles for selected tab
  const getFilteredArticles = (): Article[] => {
    if (activeTab === 'drafts') {
      return articles.filter(a => a.status === 'draft');
    }
    // Published and other default lists
    return articles.filter(a => a.status === 'published');
  };

  // DRAW CANVAS POSTER METHOD (Matches exactly the customized layout in screenshots)
  const drawAndDownloadPoster = (art: Article) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawContent = (qrImg?: HTMLImageElement) => {
      // Dimensions: 500 x 750 (Excellent vertical resolution)
      canvas.width = 500;
      canvas.height = 750;

      // Define colors according to selected style
      let bgColor = '#ffffff';
      let textColor = '#1a2e26';
      let subTextColor = '#446257';
      let borderColor = '#1a2e26';
      let accentColor = '#1e4646';

      if (posterStyle === 'warm') {
        bgColor = '#f9f6f0';
        textColor = '#2c221e';
        subTextColor = '#786255';
        borderColor = '#4a3728';
        accentColor = '#8c6239';
      } else if (posterStyle === 'teal') {
        bgColor = '#e6f0ee';
        textColor = '#0f2924';
        subTextColor = '#2d5c52';
        borderColor = '#124238';
        accentColor = '#0d9488';
      } else if (posterStyle === 'slate') {
        bgColor = '#111827';
        textColor = '#f9fafb';
        subTextColor = '#9ca3af';
        borderColor = '#374151';
        accentColor = '#14b8a6';
      }

      // 1. Draw solid background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw outer rounded border (inset slightly)
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1.5;
      const padding = 20;
      
      // Draw rounded rect function
      const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.stroke();
      };

      drawRoundedRect(padding, padding, canvas.width - padding * 2, canvas.height - padding * 2, 16);

      // 3. Draw Top Header Box (horizontal line)
      const headerHeight = 75;
      ctx.beginPath();
      ctx.moveTo(padding, headerHeight);
      ctx.lineTo(canvas.width - padding, headerHeight);
      ctx.stroke();

      // Top text: e.g. "5 min read"
      ctx.fillStyle = subTextColor;
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${getReadTime(art.content)} min read`, padding + 20, 48);

      // 4. Draw Vertical Dividing Line on the right side
      const sidebarWidth = 110;
      const splitX = canvas.width - padding - sidebarWidth;
      ctx.beginPath();
      ctx.moveTo(splitX, headerHeight);
      ctx.lineTo(splitX, canvas.height - 110);
      ctx.stroke();

      // Vertical Text: Category of Article instead of Link (Rotate canvas, draw, and restore)
      ctx.save();
      ctx.translate(canvas.width - padding - (sidebarWidth / 2) + 5, 330);
      ctx.rotate(Math.PI / 2); // 90 degrees clockwise
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(art.category.toUpperCase(), 0, 0);
      ctx.restore();

      // 5. Draw Title (Left side body wrapping text)
      ctx.fillStyle = textColor;
      ctx.font = 'bold 28px serif';
      ctx.textAlign = 'left';
      const textX = padding + 25;
      const maxTextWidth = splitX - textX - 15;
      let currentY = 160;

      // Helper to wrap text
      const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines = 5) => {
        const words = text.split(' ');
        let line = '';
        let lineCount = 0;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;

          if (testWidth > maxWidth && n > 0) {
            lineCount++;
            if (lineCount >= maxLines) {
              ctx.fillText(line.trim() + '...', x, y);
              return y;
            }
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, y);
        return y;
      };

      const finalTitleY = wrapText(art.title, textX, currentY, maxTextWidth, 36, 5);

      // 6. Draw Excerpt / Short Summary
      ctx.fillStyle = subTextColor;
      ctx.font = '16px sans-serif';
      currentY = finalTitleY + 50;

      const excerptText = art.excerpt || art.content.replace(/[#*`>-]/g, '').substring(0, 160) + '...';
      wrapText(excerptText, textX, currentY, maxTextWidth, 24, 4);

      // 7. Draw Footer Line
      const footerY = canvas.height - 110;
      ctx.beginPath();
      ctx.moveTo(padding, footerY);
      ctx.lineTo(canvas.width - padding, footerY);
      ctx.stroke();

      // 8. Draw Footer Brand and Logo Leaf
      // Leaf Logo Drawing
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      const leafX = padding + 25;
      const leafY = canvas.height - 55;
      
      // Draw leaf shape vector
      ctx.moveTo(leafX, leafY);
      ctx.bezierCurveTo(leafX + 15, leafY - 25, leafX + 30, leafY - 25, leafX + 30, leafY - 5);
      ctx.bezierCurveTo(leafX + 15, leafY + 15, leafX, leafY + 10, leafX, leafY);
      ctx.fill();

      // Stem
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leafX + 12, leafY - 3);
      ctx.lineTo(leafX - 3, leafY + 8);
      ctx.stroke();

      // Brand Label
      ctx.fillStyle = textColor;
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('rusd.pen', leafX + 45, canvas.height - 55);

      ctx.fillStyle = subTextColor;
      ctx.font = '14px sans-serif';
      ctx.fillText('Penulis & Pengkaji Syariah', leafX + 45, canvas.height - 35);

      // Medium Right side text
      ctx.fillStyle = textColor;
      ctx.font = 'bold 20px serif';
      ctx.textAlign = 'right';
      ctx.fillText('Medium', canvas.width - padding - 25, canvas.height - 45);

      // Convert canvas to image and trigger download
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `poster-${art.slug || 'artikel'}.png`;
      link.href = dataURL;
      link.click();
    };

    drawContent();
  };

  const handleCopyLink = (art: Article) => {
    const fullUrl = `${window.location.origin}/articles?slug=${art.slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full bg-white text-[#1a2e26] min-h-screen border-t border-gray-100" id="medium-platform-main">
      
      {/* SCREEN 1: STORIES DASHBOARD */}
      {currentScreen === 'dashboard' && (
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 animate-fadeIn">
          
          {/* Top Info Bar */}
          <div className="flex justify-between items-center pb-6 border-b border-gray-150">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold font-sans">
                RP
              </div>
              <div>
                <h1 className="text-xl font-bold font-sans tracking-tight text-gray-900">Your Stories</h1>
                <p className="text-xs text-gray-500">Manage, edit and publish your articles</p>
              </div>
            </div>

            <button
              onClick={handleNewStory}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold font-sans px-4.5 py-2 rounded-full text-xs cursor-pointer shadow-sm transition-all"
            >
              <Plus size={14} />
              <span>Write a story</span>
            </button>
          </div>

          {/* Stories Tabs (Drafts, Published, etc) */}
          <div className="flex gap-6 border-b border-gray-100 pb-2">
            {(['published', 'drafts'] as DashboardTab[]).map(tab => {
              const count = articles.filter(a => tab === 'drafts' ? a.status === 'draft' : a.status === 'published').length;
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs font-semibold pb-3.5 relative cursor-pointer font-sans capitalize ${
                    isActive ? 'text-gray-900 font-extrabold border-b-2 border-gray-900' : 'text-gray-400 hover:text-gray-650'
                  }`}
                >
                  {tab} <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded-full ml-1">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Stories List */}
          <div className="space-y-6 pt-2">
            {getFilteredArticles().length > 0 ? (
              getFilteredArticles().map(art => {
                const readTime = getReadTime(art.content);
                return (
                  <div
                    key={art.id}
                    className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-gray-100 group transition-all"
                  >
                    <div className="space-y-2.5 max-w-2xl">
                      {/* Sub-tag info */}
                      <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px]">
                          {art.category}
                        </span>
                        <span>•</span>
                        <span>{readTime} min read</span>
                        <span>•</span>
                        <span>Updated {new Date(art.published_at || Date.now()).toLocaleDateString('id-ID')}</span>
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => loadArticleForEditing(art)}
                        className="font-serif font-extrabold text-xl text-gray-900 hover:text-emerald-700 cursor-pointer leading-tight transition-all"
                      >
                        {art.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-sm text-gray-500 font-sans line-clamp-2 leading-relaxed">
                        {art.excerpt || art.content.replace(/[#*`>-]/g, '').substring(0, 150) + '...'}
                      </p>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex items-center gap-2.5 sm:self-center self-start">
                      <button
                        onClick={() => loadArticleForEditing(art)}
                        title="Edit Story"
                        className="w-9 h-9 rounded-full hover:bg-gray-50 flex items-center justify-center border border-gray-150 text-gray-600 hover:text-emerald-700 cursor-pointer transition-all"
                      >
                        <Edit3 size={14} />
                      </button>

                      {art.status === 'published' && (
                        <button
                          onClick={() => {
                            setPosterArticle(art);
                            setShowPosterModal(true);
                          }}
                          title="Generate Beautiful Share Poster"
                          className="w-9 h-9 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 flex items-center justify-center text-emerald-800 cursor-pointer transition-all animate-pulse"
                        >
                          <Share2 size={14} />
                        </button>
                      )}

                      <button
                        onClick={async () => {
                          if (confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
                            try {
                              await onDeleteArticle(art.id);
                            } catch (err) {
                              console.error('Gagal menghapus artikel:', err);
                            }
                          }
                        }}
                        title="Hapus"
                        className="w-9 h-9 rounded-full hover:bg-red-50 flex items-center justify-center border border-gray-150 text-gray-400 hover:text-red-600 cursor-pointer transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center border border-dashed border-gray-200/80 rounded-2xl space-y-4 max-w-md mx-auto">
                <BookOpen size={36} className="mx-auto text-gray-300" />
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-gray-800">Belum ada cerita</h4>
                  <p className="text-xs text-gray-400">Mulailah menulis artikel pertama Anda dengan mengklik tombol Tulis Cerita di atas!</p>
                </div>
                <button
                  onClick={handleNewStory}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold font-sans px-4 py-2 rounded-full text-xs cursor-pointer shadow-sm"
                >
                  Buat Cerita Baru
                </button>
              </div>
            )}
          </div>

          {/* Close Panel Button */}
          <div className="pt-6 flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full border border-gray-200 hover:bg-gray-55/10 text-gray-600 hover:text-gray-900 text-xs font-bold font-sans cursor-pointer transition-all"
            >
              Kembali ke Menu Dashboard Admin Utama
            </button>
          </div>

        </div>
      )}

      {/* SCREEN 2: DISTRACTION-FREE WRITING CANVAS */}
      {currentScreen === 'editor' && (
        <div className="animate-fadeIn min-h-screen bg-white">
          
          {/* Top Custom Medium Header bar */}
          <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-10 px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="font-serif font-extrabold text-lg text-gray-950 tracking-tight flex items-center gap-1">
                <span>Medium</span>
                <span className="text-xs font-mono font-normal text-gray-400 border border-gray-200 px-1 rounded bg-gray-50 uppercase">Draft</span>
              </div>
              <div className="h-4 w-px bg-gray-200" />
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-sans">
                {saveStatus === 'saving' ? (
                  <span className="flex items-center gap-1 text-amber-600">
                    <RefreshCw size={11} className="animate-spin" />
                    <span>Menyimpan...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-gray-400">
                    <Check size={12} className="text-emerald-600" />
                    <span>Tersimpan ke Rusd.Pen</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              {/* Category selector pill */}
              <div className="flex items-center gap-1 bg-gray-50 border border-gray-150 rounded-full px-3 py-1 text-xs">
                <span className="text-gray-400 text-[10px] font-mono">Category:</span>
                <select
                  value={storyCategory}
                  onChange={(e) => setStoryCategory(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-emerald-800 font-bold font-sans cursor-pointer text-xs"
                >
                  <option value="Syariah">Syariah</option>
                  <option value="Personal">Personal</option>
                  <option value="Reflections">Reflections</option>
                  <option value="General">General</option>
                </select>
              </div>

              {/* Status selector draft / published */}
              <div className="flex items-center gap-1 bg-gray-50 border border-gray-150 rounded-full px-3 py-1 text-xs">
                <span className="text-gray-400 text-[10px] font-mono">Status:</span>
                <select
                  value={storyStatus}
                  onChange={(e) => setStoryStatus(e.target.value as any)}
                  className="bg-transparent border-none focus:outline-none text-gray-700 font-bold font-sans cursor-pointer text-xs"
                >
                  <option value="published">Publish Now</option>
                  <option value="draft">Save as Draft</option>
                </select>
              </div>

              {/* Publish button */}
              <button
                onClick={handleSavePublish}
                disabled={isSaving}
                className={`bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold font-sans text-xs px-4 py-2 rounded-full shadow-sm transition-all flex items-center gap-1.5 ${
                  isSaving ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {isSaving && <RefreshCw size={12} className="animate-spin" />}
                <span>{editingArticleId ? (isSaving ? 'Saving...' : 'Save Changes') : (isSaving ? 'Publishing...' : 'Publish Story')}</span>
              </button>

              {/* Settings Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  <Settings size={18} />
                </button>
                {showSettingsDropdown && (
                  <div className="absolute right-0 mt-2.5 w-60 bg-white rounded-xl shadow-xl border border-gray-150 py-2.5 z-20 font-sans text-xs text-gray-700">
                    <div className="px-3.5 py-1.5 border-b border-gray-100 font-bold text-gray-900 text-[11px] tracking-wider uppercase">
                      Publish Settings
                    </div>
                    <button
                      onClick={() => {
                        setShowHintsModal(true);
                        setShowSettingsDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                    >
                      <HelpCircle size={13} />
                      <span>Shortcuts &amp; Hints</span>
                    </button>
                    <button
                      onClick={() => {
                        setStoryStatus('draft');
                        setShowSettingsDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Clock size={13} />
                      <span>Convert to Draft</span>
                    </button>
                    <button
                      onClick={() => setCurrentScreen('dashboard')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600 font-semibold cursor-pointer border-t border-gray-100"
                    >
                      <X size={13} />
                      <span>Discard Changes / Exit</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* MAIN WRITING CANVAS */}
          <main 
            className="max-w-5xl mx-auto py-12 md:py-16 space-y-6 font-serif" 
            id="medium-writing-canvas"
            style={{ paddingLeft: '2cm', paddingRight: '2cm' }}
          >
            
            {/* 1. EDITABLE TITLE (Auto-growing Textareas that wrap text perfectly instead of colliding) */}
            <div className="space-y-4">
              <textarea
                ref={titleRef}
                placeholder="Title (Judul Artikel)"
                value={storyTitle}
                onChange={(e) => {
                  setStoryTitle(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                className="w-full border-none focus:outline-none font-extrabold text-3xl md:text-4xl text-gray-950 font-serif placeholder-gray-200 leading-tight bg-transparent resize-none overflow-hidden py-1 block"
                style={{ outline: 'none' }}
                rows={1}
              />
              <textarea
                ref={excerptRef}
                placeholder="Sub-judul atau kutipan singkat artikel (Excerpt)..."
                value={storyExcerpt}
                onChange={(e) => {
                  setStoryExcerpt(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                className="w-full border-none focus:outline-none font-sans text-base text-gray-400 placeholder-gray-200 bg-transparent py-1.5 resize-none overflow-hidden block"
                style={{ outline: 'none' }}
                rows={1}
              />
            </div>

            <div className="h-px bg-gray-100 my-4" />

            {/* FLOATING RICH TEXT HELPER BAR (Appears gracefully when clicked/focused) */}
            {isTextareaFocused && (
              <div 
                className="sticky top-16 bg-white/95 backdrop-blur-md shadow-xl border border-emerald-100 rounded-2xl p-2.5 flex items-center justify-between gap-4 animate-fadeIn z-20 mx-auto max-w-lg mb-4"
                onMouseDown={(e) => e.preventDefault()} // prevent blur on click
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider px-2 border-r border-gray-100 mr-1.5">Format</span>
                  
                  {/* H2 heading */}
                  <button
                    type="button"
                    onClick={() => insertAtCursor('\n### Judul Sub-bagian\n')}
                    title="Sisipkan Sub-heading (H2)"
                    className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-800 font-sans font-extrabold text-xs cursor-pointer transition-all"
                  >
                    H2
                  </button>

                  {/* Quote */}
                  <button
                    type="button"
                    onClick={() => insertAtCursor('\n> Kutipan penting...\n')}
                    title="Sisipkan Kutipan"
                    className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-600 hover:text-emerald-800 cursor-pointer transition-all"
                  >
                    <Quote size={14} />
                  </button>

                  {/* Code Block */}
                  <button
                    type="button"
                    onClick={() => insertAtCursor('\n```\n// Tulis kutipan referensi atau script disini...\n```\n')}
                    title="Sisipkan Code Block"
                    className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-600 hover:text-emerald-800 cursor-pointer transition-all"
                  >
                    <Code size={14} />
                  </button>

                  {/* Bullet List */}
                  <button
                    type="button"
                    onClick={() => insertAtCursor('\n- Item daftar...\n')}
                    title="Sisipkan Bullet List"
                    className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-600 hover:text-emerald-800 cursor-pointer transition-all text-xs font-sans font-bold"
                  >
                    • List
                  </button>

                  {/* Numbered List */}
                  <button
                    type="button"
                    onClick={() => insertAtCursor('\n1. Item terurut...\n')}
                    title="Sisipkan List Terurut"
                    className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-600 hover:text-emerald-800 cursor-pointer transition-all text-xs font-sans font-bold"
                  >
                    1. List
                  </button>

                  {/* Divider line */}
                  <button
                    type="button"
                    onClick={() => insertAtCursor('\n---\n')}
                    title="Sisipkan Garis Pembatas"
                    className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-600 hover:text-emerald-800 cursor-pointer transition-all"
                  >
                    <Minus size={14} />
                  </button>

                  <div className="h-5 w-px bg-gray-150 mx-1" />

                  {/* Preset Image Insertion selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowImageDropdown(!showImageDropdown)}
                      title="Sisipkan Gambar Poster"
                      className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-600 hover:text-emerald-800 cursor-pointer transition-all flex items-center gap-1"
                    >
                      <Image size={14} />
                      <ChevronDown size={10} />
                    </button>
                    
                    {showImageDropdown && (
                      <div className="absolute left-0 bottom-10 mb-2 w-64 bg-white border border-gray-150 rounded-xl shadow-xl p-3 z-30 font-sans space-y-2 text-xs">
                        <span className="text-[10px] font-bold text-gray-400 block tracking-wider uppercase">Ganti Gambar Poster:</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {IMAGE_PRESETS.map((p, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => {
                                insertAtCursor(`\n[image: ${p.url}]\n`);
                                setShowImageDropdown(false);
                              }}
                              className="h-10 rounded overflow-hidden relative border border-gray-100 hover:border-emerald-600"
                            >
                              <img src={p.url} className="w-full h-full object-cover" />
                              <span className="absolute bottom-0 inset-x-0 bg-black/50 text-[7px] text-white py-0.5 truncate px-1 text-center font-sans">
                                {p.label}
                              </span>
                            </button>
                          ))}
                        </div>
                        <div className="pt-1.5 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => {
                              const url = prompt("Masukkan URL Gambar Anda:");
                              if (url) {
                                insertAtCursor(`\n[image: ${url}]\n`);
                              }
                              setShowImageDropdown(false);
                            }}
                            className="w-full py-1 text-center text-emerald-800 font-bold bg-emerald-50 rounded-md hover:bg-emerald-100 transition-all cursor-pointer"
                          >
                            Tempel URL Gambar Kustom
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <span className="text-[9px] text-gray-400 font-medium font-sans">
                  Markdown support
                </span>
              </div>
            )}

            {/* 2. INFINITE DOCUMENT TEXT AREA (Behaves exactly like Medium / Google Docs) */}
            <div className="w-full relative py-2">
              <textarea
                ref={contentRef}
                placeholder="Mulai menulis cerita Syariah atau Refleksi Anda disini... Gunakan markdown seperti ### untuk heading, > untuk quote, - untuk list."
                value={storyContent}
                onChange={(e) => {
                  setStoryContent(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.max(450, e.target.scrollHeight) + 'px';
                }}
                onFocus={() => setIsTextareaFocused(true)}
                onBlur={() => {
                  // Keep focused long enough to capture formatting button clicks
                  setTimeout(() => setIsTextareaFocused(false), 200);
                }}
                className="w-full border-none focus:outline-none bg-transparent font-serif text-lg leading-relaxed text-gray-850 placeholder-gray-300 resize-none overflow-hidden py-1 block"
                style={{ outline: 'none', minHeight: '450px' }}
              />
            </div>

          </main>

        </div>
      )}

      {/* MODAL 3: SHORTS / SOCIAL POSTER PREVIEW CARD (MATCHES SPECIFIC SCREENSHOT DESIGN) */}
      {showPosterModal && posterArticle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl border border-gray-150 animate-scaleUp">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-gray-900 tracking-tight">Medium Share Poster Generator</h3>
                <p className="text-xs text-gray-500">Download beautiful summaries perfect for social networks (X, Telegram, WA)</p>
              </div>
              <button
                onClick={() => {
                  setShowPosterModal(false);
                  setPosterArticle(null);
                }}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Layout split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* Left Column: Customized Controls */}
              <div className="space-y-6">
                
                {/* 1. Select styling theme preset */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-gray-400 block tracking-wider uppercase">PILIH WARNA TEMA POSTER:</label>
                  <div className="grid grid-cols-2 gap-3">
                    
                    <button
                      onClick={() => setPosterStyle('classic')}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left cursor-pointer transition-all ${
                        posterStyle === 'classic' ? 'border-emerald-600 bg-emerald-50/30' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs text-gray-950 block">Classic Ivory</span>
                        <span className="text-[10px] text-gray-400 block">Putih Minimalis asli</span>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-white border border-gray-300" />
                    </button>

                    <button
                      onClick={() => setPosterStyle('warm')}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left cursor-pointer transition-all ${
                        posterStyle === 'warm' ? 'border-emerald-600 bg-amber-50/30' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs text-gray-950 block">Warm Sepia</span>
                        <span className="text-[10px] text-gray-400 block">Kertas Kuning Syahdu</span>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-[#f9f6f0] border border-amber-200" />
                    </button>

                    <button
                      onClick={() => setPosterStyle('teal')}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left cursor-pointer transition-all ${
                        posterStyle === 'teal' ? 'border-emerald-600 bg-teal-50/20' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs text-gray-950 block">Teal Mint</span>
                        <span className="text-[10px] text-gray-400 block">Hijau daun segar</span>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-[#e6f0ee] border border-teal-300" />
                    </button>

                    <button
                      onClick={() => setPosterStyle('slate')}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left cursor-pointer transition-all ${
                        posterStyle === 'slate' ? 'border-emerald-600 bg-slate-900/10' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs text-gray-950 block">Deep Cosmic</span>
                        <span className="text-[10px] text-gray-400 block">Misterius Gelap</span>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-gray-950 border border-gray-700" />
                    </button>

                  </div>
                </div>

                {/* 2. Custom Author metadata info */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3.5 border border-gray-150">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle size={14} />
                    <span>Poster Layout Details</span>
                  </div>
                  <ul className="text-xs text-gray-500 space-y-2 pl-4 list-disc">
                    <li><strong>Membaca waktu otomatis:</strong> Diestimasi berdasarkan panjang artikel ({getReadTime(posterArticle.content)} min).</li>
                    <li><strong>Link Domain Kanan:</strong> Ditulis miring secara vertikal di sebelah kanan poster.</li>
                    <li><strong>Ujung Bulat:</strong> Struktur kartu berbingkai rapi siap dibagikan ke instastory atau feed medsos.</li>
                  </ul>
                </div>

                {/* 3. Operational Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => drawAndDownloadPoster(posterArticle)}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-full text-xs cursor-pointer shadow-md transition-all"
                  >
                    <Download size={14} />
                    <span>Download Poster (.PNG)</span>
                  </button>

                  <button
                    onClick={() => handleCopyLink(posterArticle)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold px-5 py-3 rounded-full text-xs cursor-pointer transition-all"
                  >
                    {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>{copiedLink ? 'Link Tersalin!' : 'Salin Link Artikel'}</span>
                  </button>
                </div>

              </div>

              {/* Right Column: Live Poster Card Render Mockup (Matches Screenshot identically) */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-gray-400 mb-2.5 uppercase tracking-wider">Live Preview Poster:</span>
                
                {/* Visual mockup representation of the rendered poster */}
                <div
                  className={`w-full max-w-[340px] aspect-[2/3] border rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between select-none shadow-lg ${
                    posterStyle === 'classic'
                      ? 'bg-white border-gray-900 text-gray-900'
                      : posterStyle === 'warm'
                      ? 'bg-[#f9f6f0] border-[#4a3728] text-[#2c221e]'
                      : posterStyle === 'teal'
                      ? 'bg-[#e6f0ee] border-[#124238] text-[#0f2924]'
                      : 'bg-gray-950 border-gray-800 text-gray-100'
                  }`}
                >
                  {/* Top Bar horizontal line */}
                  <div className="pb-3 border-b flex justify-between items-center text-xs font-bold"
                    style={{ borderColor: posterStyle === 'slate' ? '#1f2937' : 'currentColor' }}
                  >
                    <span className="opacity-80">{getReadTime(posterArticle.content)} min read</span>
                  </div>

                  {/* Body Content - layout split into Main Left and Vertical Right */}
                  <div className="flex-1 flex pt-4 pb-4 min-h-0">
                    
                    {/* Left major column */}
                    <div className="flex-1 pr-3 space-y-3 flex flex-col justify-center min-w-0">
                      {/* Large Title */}
                      <h4 className="font-serif font-extrabold text-base sm:text-lg leading-tight line-clamp-4">
                        {posterArticle.title}
                      </h4>
                      {/* Short excerpt snippet */}
                      <p className="text-[10px] opacity-80 leading-relaxed font-sans line-clamp-3">
                        {posterArticle.excerpt || posterArticle.content.replace(/[#*`>-]/g, '').substring(0, 90) + '...'}
                      </p>
                    </div>

                    {/* Right column vertical text displaying category */}
                    <div className="w-14 relative flex flex-col items-center justify-center py-2 border-l"
                      style={{ borderColor: posterStyle === 'slate' ? '#1f2937' : 'currentColor' }}
                    >
                      {/* Vertical rotated text of category */}
                      <div className="flex-1 flex items-center justify-center">
                        <div className="font-sans text-[10px] font-black uppercase whitespace-nowrap tracking-widest"
                          style={{ 
                            transform: 'rotate(90deg)',
                            color: posterStyle === 'slate' ? '#14b8a6' : posterStyle === 'warm' ? '#8c6239' : posterStyle === 'teal' ? '#0d9488' : '#1e4646'
                          }}
                        >
                          {posterArticle.category}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Bottom Footer Line */}
                  <div className="pt-3 border-t flex justify-between items-center"
                    style={{ borderColor: posterStyle === 'slate' ? '#1f2937' : 'currentColor' }}
                  >
                    <div className="flex items-center gap-2">
                      {/* Leaf custom illustration */}
                      <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white text-[10px] font-serif font-bold">
                        🌿
                      </div>
                      <div className="text-left leading-none">
                        <span className="font-extrabold text-xs block">rusd.pen</span>
                        <span className="text-[8px] opacity-60 block">Penulis Syariah</span>
                      </div>
                    </div>
                    <span className="font-serif font-extrabold text-xs">Medium</span>
                  </div>

                </div>

                {/* Hidden real drawing canvas used only to export real PNG */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>

            </div>

          </div>
        </div>
      )}

      {/* MODAL 4: HINTS & KEYBOARD SHORTCUTS */}
      {showHintsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-150">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h4 className="font-extrabold text-gray-900">Medium Editor Hints &amp; Tips</h4>
              <button onClick={() => setShowHintsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3.5 text-xs text-gray-600 leading-relaxed font-sans">
              <p>Menulis di platform ini sangat menyenangkan! Kami menyalin fungsionalitas Medium untuk menjaga fokus Anda:</p>
              
              <div className="space-y-2.5">
                <div className="flex justify-between border-b pb-1">
                  <strong>Tambah Baris Paragraf</strong>
                  <span>Tekan tombol <code>Enter</code></span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <strong>Menu Floating (+)</strong>
                  <span>Akan muncul di sebelah kiri baris yang aktif untuk menambahkan gambar, quote, kode, atau list.</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <strong>Auto-Save</strong>
                  <span>Tiap kali Anda mengetik, sistem otomatis menyinkronkan data draft.</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowHintsModal(false)}
              className="w-full bg-gray-950 hover:bg-gray-800 text-white font-bold py-2 rounded-lg text-xs"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
