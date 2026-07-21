import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ArrowLeft, Send, MessageSquare, Calendar, User, Share2, Download, Copy, Check, X, Sparkles, Loader2 } from 'lucide-react';
import { Article, Comment } from '../types';

const DAYS_INDONESIAN = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS_INDONESIAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

interface ArticlesViewProps {
  articles: Article[];
  comments: Comment[];
  selectedArticle: Article | null;
  onSelectArticle: (article: Article | null) => void;
  onSubmitComment: (articleId: string, name: string, email: string, text: string) => void;
}

export default function ArticlesView({
  articles,
  comments,
  selectedArticle,
  onSelectArticle,
  onSubmitComment,
}: ArticlesViewProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Comment Form fields
  const [comName, setComName] = useState('');
  const [comEmail, setComEmail] = useState('');
  const [comText, setComText] = useState('');
  const [commentPosted, setCommentPosted] = useState(false);

  // AI Summary states
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [articleSummary, setArticleSummary] = useState<string | null>(null);

  const handleSummarizeArticle = async (article: Article) => {
    setIsSummarizing(true);
    setArticleSummary(null);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'article',
          id: article.id,
          title: article.title,
          content: article.content
        })
      });
      if (!response.ok) {
        throw new Error('Gagal memproses ringkasan berbasis AI.');
      }
      const data = await response.json();
      setArticleSummary(data.summary);
    } catch (err: any) {
      alert(err.message || 'Gagal menghasilkan ringkasan otomatis.');
    } finally {
      setIsSummarizing(false);
    }
  };

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
              <h4 key={idx} className="font-sans font-bold text-base text-[#1a2e26] mt-4 mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-700"></span>
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-sans font-bold text-lg text-[#1a2e26] mt-5 mb-2.5 border-b border-gray-100 pb-1">
                {line.replace('## ', '')}
              </h3>
            );
          }
          if (line.startsWith('# ')) {
            return (
              <h2 key={idx} className="font-sans font-extrabold text-xl text-[#1a2e26] mt-6 mb-3">
                {line.replace('# ', '')}
              </h2>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            const content = line.substring(2);
            return (
              <li key={idx} className="ml-5 list-disc pl-0.5 text-[#446257]">
                <span dangerouslySetInnerHTML={{ __html: formatBold(content) }} />
              </li>
            );
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-1" />;
          }
          return <p key={idx} className="indent-0" dangerouslySetInnerHTML={{ __html: formatBold(line) }} />;
        })}
      </div>
    );
  };

  // Public Poster Share States
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [posterStyle, setPosterStyle] = useState<'classic' | 'warm' | 'teal' | 'slate'>('classic');
  const [copiedLink, setCopiedLink] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const getReadTime = (content: string): number => {
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  const drawAndDownloadPoster = (art: Article) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawContent = (qrImg?: HTMLImageElement) => {
      // Dimensions: 1080 x 1350 (Perfect high-fidelity portrait ratio)
      canvas.width = 1080;
      canvas.height = 1350;

      // Define colors according to selected style
      let outerBg = '#eaeceb';
      let bgMainColor = '#0f382a';      // Deep Emerald Green
      let accentColor = '#dfba8a';     // Warm gold bronze
      let cardBgRight = '#ffffff';
      let textColorRight = '#0f382a';

      if (posterStyle === 'warm') {
        outerBg = '#f3efe2';
        bgMainColor = '#3a2416';       // Rich sepia coffee
        accentColor = '#b49a78';
        cardBgRight = '#fbf9f4';
        textColorRight = '#3a2416';
      } else if (posterStyle === 'teal') {
        outerBg = '#e8efed';
        bgMainColor = '#0b2b2a';       // Deep mint teal
        accentColor = '#81e6d9';
        cardBgRight = '#f0fdfa';
        textColorRight = '#0b2b2a';
      } else if (posterStyle === 'slate') {
        outerBg = '#cbd5e1';
        bgMainColor = '#0f172a';       // Dark cosmic
        accentColor = '#38bdf8';
        cardBgRight = '#f8fafc';
        textColorRight = '#0f172a';
      }

      // 1. Draw solid outer background frame
      ctx.fillStyle = outerBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Helper to draw rounded rectangle
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
      };

      // Helper to wrap left-aligned text
      const wrapLeftText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines = 5, fontStyle = '') => {
        ctx.font = fontStyle;
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        for (let n = 0; n < words.length; n++) {
          const testLine = currentLine + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;

          if (testWidth > maxWidth && n > 0) {
            lines.push(currentLine.trim());
            currentLine = words[n] + ' ';
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine.trim());

        let currentY = y;
        const printLines = lines.slice(0, maxLines);
        for (let i = 0; i < printLines.length; i++) {
          let lineText = printLines[i];
          if (i === maxLines - 1 && lines.length > maxLines) {
            lineText += '...';
          }
          ctx.fillText(lineText, x, currentY);
          currentY += lineHeight;
        }
        return currentY;
      };

      // Calculate reading time for the giant number
      const wordCount = art.content.split(/\s+/).filter(Boolean).length;
      const readingTimeNum = Math.max(1, Math.ceil(wordCount / 200));
      const readingTimeStr = String(readingTimeNum).padStart(2, '0');

      // ==========================================
      // DRAW TOP MAIN BLOCK
      // ==========================================
      ctx.fillStyle = bgMainColor;
      drawRoundedRect(40, 40, 1000, 740, 50);
      ctx.fill();

      // Draw solid accent circle inside the top block (clipped to block boundaries)
      ctx.save();
      drawRoundedRect(40, 40, 1000, 740, 50);
      ctx.clip();
      
      // Draw the circle shape
      ctx.fillStyle = accentColor;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(800, 520, 160, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Top Header Text (Left side)
      ctx.fillStyle = accentColor;
      ctx.textAlign = 'left';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('ARTIKEL PILIHAN // KAJIAN SYARIAH', 100, 120);

      // Top Header Text (Right side)
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'right';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('# RUSD.PEN', 980, 120);

      // Large Bold Aligned-Left Article Title
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      
      // Wrap Title with 64px display sans-serif
      wrapLeftText(
        art.title,
        100,
        270,
        860,
        80,
        4,
        'bold 64px "Plus Jakarta Sans", sans-serif'
      );

      // Decorative Right Stack Icons (©, 🌐, :))
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('©', 940, 380);
      ctx.fillText('🌐', 940, 460);
      ctx.fillText(':-)', 940, 540);

      // ==========================================
      // DRAW BOTTOM-LEFT PANEL
      // ==========================================
      ctx.fillStyle = accentColor;
      drawRoundedRect(40, 810, 410, 500, 50);
      ctx.fill();

      // Giant estimated read time number
      ctx.fillStyle = bgMainColor;
      ctx.textAlign = 'left';
      ctx.font = 'black 170px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(readingTimeStr, 100, 990);

      // Vertical category / read title
      ctx.fillStyle = bgMainColor;
      ctx.font = 'bold 42px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('MENIT BACA', 100, 1060);
      
      ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('KAJIAN ILMIAH', 100, 1120);

      // Small hex label bottom left
      ctx.font = 'bold 24px monospace';
      ctx.fillText(`# ${accentColor.toUpperCase()}`, 100, 1240);


      // ==========================================
      // DRAW BOTTOM-RIGHT PANEL
      // ==========================================
      ctx.fillStyle = cardBgRight;
      drawRoundedRect(480, 810, 560, 500, 50);
      ctx.fill();

      // Copyright label top left
      ctx.fillStyle = textColorRight;
      ctx.textAlign = 'left';
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('© RUSD.PEN DESIGN 2026', 540, 880);

      // Highlight Sentence (kalimat highlight) in serif italic
      const excerptText = `“${art.excerpt || art.content.replace(/[#*`>-]/g, '').substring(0, 95) + '...'}”`;
      ctx.fillStyle = textColorRight;
      wrapLeftText(
        excerptText,
        540,
        965,
        430,
        42,
        4,
        'italic 28px "Playfair Display", Georgia, serif'
      );

      // Small vertical line on right side
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(980, 880);
      ctx.lineTo(980, 1100);
      ctx.stroke();

      // Draw article category as a beautiful solid badge
      ctx.fillStyle = bgMainColor;
      const categoryText = art.category.toUpperCase();
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      const textWidth = ctx.measureText(categoryText).width;
      const badgeWidth = textWidth + 40;
      const badgeHeight = 54;
      const badgeX = 540;
      const badgeY = 1180;

      drawRoundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 16);
      ctx.fill();

      // Text inside category badge
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left'; // reset back to left as fillText is left-aligned by default or set precisely
      ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(categoryText, badgeX + 20, badgeY + 34);

      // Trigger download
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

  // Get active categories
  const categories = useMemo(() => {
    const list = new Set(articles.filter((a) => a.status === 'published').map((a) => a.category));
    return ['All', ...Array.from(list)];
  }, [articles]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      if (article.status !== 'published') return false;
      const matchesSearch =
        article.title.toLowerCase().includes(search.toLowerCase()) ||
        article.content.toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCategory === 'All' || article.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [articles, search, selectedCategory]);

  // Comments for currently selected article
  const articleComments = useMemo(() => {
    if (!selectedArticle) return [];
    return comments.filter((c) => c.article_id === selectedArticle.id && c.status === 'approved');
  }, [comments, selectedArticle]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle || !comName || !comEmail || !comText) return;
    onSubmitComment(selectedArticle.id, comName, comEmail, comText);
    setComText('');
    setCommentPosted(true);
    setTimeout(() => setCommentPosted(false), 5000);
  };

  // ==========================================
  // VIEW ARTICLE DETAIL SUB-PAGE
  // ==========================================
  if (selectedArticle) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 mt-8 space-y-12" id="article-detail-view">
        
        {/* Back Button */}
        <button
          onClick={() => onSelectArticle(null)}
          className="flex items-center gap-2 text-sm font-semibold text-[#1e4646] hover:text-[#2d5c5c] cursor-pointer transition-all px-4 py-2 rounded-full hover:shadow-[inset_2px_2px_5px_#d5dadb,_inset_-2px_-2px_5px_#ffffff] hover:bg-[#ebf0f0]/30"
          id="back-to-articles-btn"
        >
          <ArrowLeft size={16} />
          <span>Back to Articles</span>
        </button>

        {/* Article Body */}
        <article className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs text-[#446257] font-mono">
              <span className="px-3 py-1 rounded-md bg-[#e6ecec] text-[#1e4646] font-bold shadow-[inset_1px_1px_2px_#d5dadb]">
                {selectedArticle.category}
              </span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(selectedArticle.published_at).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>

            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#1a2e26] leading-tight">
              {selectedArticle.title}
            </h1>

            {/* Public Social Share Trigger */}
            <div className="pt-3.5 flex flex-wrap gap-2.5">
              <button
                onClick={() => setShowPosterModal(true)}
                className="flex items-center gap-1.5 px-4.5 py-2.5 bg-[#1e4646]/5 hover:bg-[#1e4646]/10 border border-[#1e4646]/10 text-[#1e4646] text-xs font-bold rounded-full cursor-pointer transition-all shadow-xs"
              >
                <Share2 size={13} />
                <span>Bagikan Poster Medsos 🌿</span>
              </button>
              <button
                onClick={() => handleCopyLink(selectedArticle)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-full cursor-pointer transition-all shadow-xs"
              >
                {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copiedLink ? 'Link Tersalin!' : 'Salin Tautan'}</span>
              </button>
              <button
                onClick={() => handleSummarizeArticle(selectedArticle)}
                disabled={isSummarizing}
                className="flex items-center gap-1.5 px-4.5 py-2.5 bg-teal-50 hover:bg-teal-100 border border-teal-100 text-teal-800 text-xs font-bold rounded-full cursor-pointer transition-all shadow-xs"
              >
                {isSummarizing ? (
                  <Loader2 size={13} className="animate-spin text-teal-800" />
                ) : (
                  <Sparkles size={13} className="text-teal-700" />
                )}
                <span>Ringkas Esai AI ✨</span>
              </button>
            </div>
          </div>

          <div className="w-full h-px bg-gray-200/50" />

          {/* AI Summary Section */}
          {articleSummary && (
            <div className="p-5 rounded-2xl border border-teal-500/10 bg-teal-50/20 shadow-inner relative space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-teal-800 font-bold text-xs">
                  <Sparkles size={13} className="text-teal-700" />
                  <span>Ringkasan Otomatis Berbasis AI:</span>
                </div>
                <button
                  type="button"
                  onClick={() => setArticleSummary(null)}
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="text-sm text-[#446257] leading-relaxed font-sans">
                {renderMarkdown(articleSummary)}
              </div>
            </div>
          )}

          {/* Render markdown style typography */}
          <div className="prose max-w-none text-base text-[#1a2e26]/90 leading-relaxed font-sans space-y-5" id="article-content-body">
            {selectedArticle.content.split('\n\n').map((paragraph, index) => {
              // Simple check for titles or bullet lists
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} className="font-sans font-bold text-xl text-[#1e4646] pt-4">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                return (
                  <ul key={index} className="list-disc list-inside space-y-1 pl-4 text-gray-700">
                    {paragraph.split('\n').map((item, itemIdx) => (
                      <li key={itemIdx}>{item.replace(/^[-*]\s+/, '')}</li>
                    ))}
                  </ul>
                );
              }
              // Bold parsing
              let text = paragraph;
              const boldRegex = /\*\*(.*?)\*\*/g;
              const parts = [];
              let lastIndex = 0;
              let match;
              while ((match = boldRegex.exec(text)) !== null) {
                if (match.index > lastIndex) {
                  parts.push(text.substring(lastIndex, match.index));
                }
                parts.push(<strong key={match.index} className="font-bold text-[#1e4646]">{match[1]}</strong>);
                lastIndex = boldRegex.lastIndex;
              }
              if (lastIndex < text.length) {
                parts.push(text.substring(lastIndex));
              }

              return (
                <p key={index} className="whitespace-pre-line text-gray-750">
                  {parts.length > 0 ? parts : paragraph}
                </p>
              );
            })}
          </div>
        </article>

        {/* Comment Section separator */}
        <div className="w-full h-px bg-gray-200/50" />

        {/* Comments Section */}
        <div className="space-y-8" id="article-comments-section">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-[#1e4646]" />
            <h2 className="font-sans font-bold text-xl text-[#1a2e26]">
              Discussion ({articleComments.length})
            </h2>
          </div>

          {/* List of comments */}
          <div className="space-y-4">
            {articleComments.length > 0 ? (
              articleComments.map((com) => (
                <div key={com.id} className="neumorph-raised border border-white/30 p-5 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#f3f6f6] shadow-[inset_2px_2px_4px_#d5dadb,_inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-[#1e4646] font-bold text-xs">
                        <User size={12} />
                      </div>
                      <span className="text-sm font-bold text-[#1a2e26]">{com.author_name}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(com.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 pl-10 leading-relaxed">{com.content}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic font-sans pl-1">No approved comments yet. Be the first to start the conversation!</p>
            )}
          </div>

          {/* Add comment Form */}
          <form onSubmit={handleCommentSubmit} className="neumorph-raised p-6 rounded-2xl space-y-4 border border-white/40">
            <h3 className="font-sans font-bold text-base text-[#1a2e26]">Add a thought</h3>
            <p className="text-xs text-gray-500">Your email address will not be published. Submitted comments will appear after approval.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abdullah"
                  value={comName}
                  onChange={(e) => setComName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl neumorph-input text-sm text-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. abdullah@example.com"
                  value={comEmail}
                  onChange={(e) => setComEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl neumorph-input text-sm text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Comment</label>
              <textarea
                required
                rows={4}
                placeholder="Share your perspective..."
                value={comText}
                onChange={(e) => setComText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl neumorph-input text-sm text-gray-800 resize-none"
              />
            </div>

            {commentPosted && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-medium">
                Thank you! Your comment has been submitted for moderation.
              </div>
            )}

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full neumorph-btn-teal text-xs font-semibold cursor-pointer"
            >
              <Send size={12} />
              <span>Submit comment</span>
            </button>
          </form>
        </div>

        {/* MODAL: SHORTS / SOCIAL POSTER PREVIEW CARD FOR PUBLIC READERS */}
        {showPosterModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl border border-gray-150 animate-scaleUp text-[#1a2e26]">
              
              {/* Header */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900 tracking-tight">Kartu Kutipan rusd.pen</h3>
                  <p className="text-xs text-gray-500">Unduh gambar kartu rangkuman indah untuk dibagikan ke media sosial (WhatsApp, Instagram, Telegram)</p>
                </div>
                <button
                  onClick={() => setShowPosterModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-650 cursor-pointer"
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
                    <label className="text-xs font-bold text-gray-400 block tracking-wider uppercase">PILIH GAYA POSTER:</label>
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

                  {/* Info */}
                  <div className="bg-emerald-50/40 border border-emerald-150/40 rounded-xl p-4 text-xs text-emerald-950 space-y-1.5">
                    <div className="font-bold">✨ Keindahan Sempurna</div>
                    <p className="text-gray-600 font-sans">Poster ini siap diunduh secara instan sebagai berkas gambar berkualitas tinggi. Cocok untuk dibagikan ke cerita Instagram Anda, WhatsApp, ataupun forum diskusi Syariah.</p>
                  </div>

                  {/* Download / Copy action */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => drawAndDownloadPoster(selectedArticle)}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-full text-xs cursor-pointer shadow-md transition-all"
                    >
                      <Download size={14} />
                      <span>Download Poster (.PNG)</span>
                    </button>

                    <button
                      onClick={() => handleCopyLink(selectedArticle)}
                      className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold px-5 py-3 rounded-full text-xs cursor-pointer transition-all"
                    >
                      {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{copiedLink ? 'Link Tersalin!' : 'Salin Link Artikel'}</span>
                    </button>
                  </div>

                </div>

                {/* Right Column: Live Poster Card Render Mockup */}
                <div className="flex flex-col items-center w-full">
                  <span className="text-xs font-bold text-gray-400 mb-2.5 uppercase tracking-wider">PREVIEW POSTER:</span>
                  
                  {(() => {
                    const getPosterColors = () => {
                      switch (posterStyle) {
                        case 'warm':
                          return {
                            outerBg: 'bg-[#f3efe2]',
                            bgMain: 'bg-[#3a2416]',
                            accent: 'bg-[#b49a78]',
                            accentText: 'text-[#b49a78]',
                            accentBg: 'bg-[#b49a78]',
                            cardRight: 'bg-[#fbf9f4]',
                            textRight: 'text-[#3a2416]',
                            accentColorHex: '#b49a78',
                          };
                        case 'teal':
                          return {
                            outerBg: 'bg-[#e8efed]',
                            bgMain: 'bg-[#0b2b2a]',
                            accent: 'bg-[#81e6d9]',
                            accentText: 'text-[#81e6d9]',
                            accentBg: 'bg-[#81e6d9]',
                            cardRight: 'bg-[#f0fdfa]',
                            textRight: 'text-[#0b2b2a]',
                            accentColorHex: '#81e6d9',
                          };
                        case 'slate':
                          return {
                            outerBg: 'bg-[#cbd5e1]',
                            bgMain: 'bg-[#0f172a]',
                            accent: 'bg-[#38bdf8]',
                            accentText: 'text-[#38bdf8]',
                            accentBg: 'bg-[#38bdf8]',
                            cardRight: 'bg-[#f8fafc]',
                            textRight: 'text-[#0f172a]',
                            accentColorHex: '#38bdf8',
                          };
                        case 'classic':
                        default:
                          return {
                            outerBg: 'bg-[#eaeceb]',
                            bgMain: 'bg-[#0f382a]',
                            accent: 'bg-[#dfba8a]',
                            accentText: 'text-[#dfba8a]',
                            accentBg: 'bg-[#dfba8a]',
                            cardRight: 'bg-[#ffffff]',
                            textRight: 'text-[#0f382a]',
                            accentColorHex: '#dfba8a',
                          };
                      }
                    };

                    const colors = getPosterColors();
                    const wordCount = selectedArticle.content.split(/\s+/).filter(Boolean).length;
                    const readingTimeNum = Math.max(1, Math.ceil(wordCount / 200));
                    const readingTimeStr = String(readingTimeNum).padStart(2, '0');

                    return (
                      <div
                        className={`w-full max-w-[320px] aspect-[1080/1350] relative overflow-hidden select-none shadow-2xl transition-all duration-300 p-3 rounded-2xl ${colors.outerBg}`}
                      >
                        {/* Top Block Container */}
                        <div className={`absolute top-[4%] left-[4%] right-[4%] h-[55%] rounded-2xl p-4 flex flex-col justify-between overflow-hidden ${colors.bgMain}`}>
                          
                          {/* Top circle (background clipped or absolute corner) */}
                          <div className={`absolute right-[-15%] bottom-[-15%] w-28 h-28 rounded-full opacity-85 z-0 ${colors.accent}`} />

                          {/* Top Block Header text */}
                          <div className="flex justify-between items-center z-10 w-full">
                            <span className={`text-[6.5px] font-mono font-bold uppercase tracking-wider ${colors.accentText}`}>
                              ARTIKEL PILIHAN // KAJIAN SYARIAH
                            </span>
                            <span className="text-[6.5px] font-mono font-bold text-white/95 uppercase">
                              # RUSD.PEN
                            </span>
                          </div>

                          {/* Top Block Title */}
                          <div className="z-10 flex-1 flex items-end pb-3 text-left">
                            <h4 className="font-sans font-black text-sm tracking-tight text-white leading-snug line-clamp-4 max-w-[82%]">
                              {selectedArticle.title}
                            </h4>
                          </div>

                          {/* Sidebar icons inside the top block */}
                          <div className="absolute right-3 top-[32%] flex flex-col gap-2.5 text-white/90 text-[10px] z-10 font-bold leading-none select-none items-center">
                            <span>©</span>
                            <span>🌐</span>
                            <span>:-)</span>
                          </div>

                        </div>

                        {/* Bottom Left Panel */}
                        <div className={`absolute bottom-[4%] left-[4%] w-[38%] h-[34%] rounded-2xl p-4 flex flex-col justify-between ${colors.accentBg}`}>
                          
                          {/* Giant reading time */}
                          <span className={`text-5xl font-black leading-none ${colors.textRight} tracking-tighter block`}>
                            {readingTimeStr}
                          </span>

                          <div className={`${colors.textRight} space-y-0.5 leading-none mt-1`}>
                            <span className="text-[10px] font-black tracking-wider block">MENIT BACA</span>
                            <span className="text-[7.5px] font-bold opacity-80 block">KAJIAN ILMIAH</span>
                          </div>

                          <span className={`text-[7px] font-mono font-bold mt-2 block ${colors.textRight} opacity-90`}>
                            # {colors.accentColorHex.toUpperCase()}
                          </span>

                        </div>

                        {/* Bottom Right Panel */}
                        <div className={`absolute bottom-[4%] right-[4%] w-[51%] h-[34%] rounded-2xl p-4.5 flex flex-col justify-between shadow-sm overflow-hidden ${colors.cardRight}`}>
                          
                          {/* Top watermark */}
                          <span className={`text-[7px] font-bold ${colors.textRight} block leading-none`}>
                            © RUSD.PEN DESIGN 2026
                          </span>

                          {/* Excerpt highlight sentence in serif italic */}
                          <p className={`text-[8.5px] font-serif italic ${colors.textRight} leading-relaxed line-clamp-3 mt-1.5`}>
                            “{selectedArticle.excerpt || selectedArticle.content.replace(/[#*`>-]/g, '').substring(0, 85) + '...'}”
                          </p>

                          {/* Beautiful solid Category badge at the bottom instead of Link & QR */}
                          <div className="mt-2.5 flex">
                            <span className={`px-3 py-1 rounded-md text-[8.5px] font-black uppercase tracking-wider text-white ${colors.bgMain}`}>
                              {selectedArticle.category}
                            </span>
                          </div>

                        </div>

                      </div>
                    );
                  })()}
                  
                  {/* Hidden canvas */}
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // LIST VIEW
  // ==========================================
  return (
    <div className="w-full max-w-7xl mx-auto px-4 mt-12 space-y-8" id="articles-list-view">
      
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#1e4646]/80 uppercase tracking-widest font-sans">
          JOURNAL
        </span>
        <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-[#1a2e26] tracking-tight">
          Articles
        </h1>
        <p className="text-[#446257] text-sm sm:text-base max-w-xl">
          Longer thoughts. Written slowly, published when ready.
        </p>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between" id="articles-filter-panel">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl neumorph-input text-sm text-[#1a2e26] focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto" id="articles-category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'shadow-[inset_2px_2px_5px_#d5dadb,_inset_-2px_-2px_5px_#ffffff] bg-[#ebf0f0] text-[#1e4646]'
                  : 'neumorph-btn text-[#446257]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="articles-list-grid">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className="neumorph-raised rounded-2xl p-8 border border-white/40 hover:shadow-[3px_3px_6px_#d5dadb,_-3px_-3px_6px_#ffffff] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group relative"
            >
              <div className="flex justify-between items-start mb-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2 text-xs text-[#446257] font-mono">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#e6ecec] text-[#1e4646] font-bold shadow-[inset_1px_1px_2px_#d5dadb]">
                    {article.category}
                  </span>
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
              </div>

              <h3 className="font-serif font-bold text-xl text-[#1a2e26] group-hover:text-[#1e4646] transition-colors leading-snug">
                {article.title}
              </h3>
              
              <p className="text-sm text-[#446257] mt-3 line-clamp-3 leading-relaxed font-sans">
                {article.excerpt || article.content.substring(0, 150) + '...'}
              </p>

              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1e4646] mt-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span>Read entire essay</span>
                <ArrowLeft size={12} className="rotate-180" />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="neumorph-sunken rounded-2xl p-16 text-center border border-dashed border-gray-200/80 max-w-md mx-auto space-y-3">
          <MessageSquare size={32} className="mx-auto text-gray-400" />
          <h3 className="font-sans font-bold text-lg text-[#1a2e26]">No articles yet.</h3>
          <p className="text-sm text-[#446257]">Check back later or use other filter tags to see if there are any published journals.</p>
        </div>
      )}



    </div>
  );
}
