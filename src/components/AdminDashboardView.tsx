import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FileText, BookOpen, Tag, MessageSquare, Inbox, Plus, Trash2, Check,
  X, LogOut, ArrowRight, Save, Eye, Globe, Edit, Database, Cloud, CloudOff, AlertTriangle, Info
} from 'lucide-react';
import { Article, Material, Taxonomy, Comment, MaterialRequest, AdminUser } from '../types';
import { dbService } from '../lib/database';
import MediumEditorView from './MediumEditorView';

interface AdminDashboardViewProps {
  adminUser: AdminUser;
  articles: Article[];
  materials: Material[];
  taxonomies: Taxonomy[];
  comments: Comment[];
  requests: MaterialRequest[];
  onLogout: () => void;
  // Article actions
  onCreateArticle: (art: Omit<Article, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  onUpdateArticle: (id: string, updates: Partial<Article>) => Promise<any>;
  onDeleteArticle: (id: string) => Promise<any>;
  // Material actions
  onCreateMaterial: (mat: Omit<Material, 'id' | 'download_count' | 'created_at' | 'updated_at'>) => Promise<any>;
  onDeleteMaterial: (id: string) => Promise<any>;
  // Taxonomy actions
  onCreateTaxonomy: (tax: Omit<Taxonomy, 'id' | 'created_at'>) => Promise<any>;
  onDeleteTaxonomy: (id: string) => Promise<any>;
  // Comment actions
  onApproveComment: (id: string) => Promise<any>;
  onRejectComment: (id: string) => Promise<any>;
  onDeleteComment: (id: string) => Promise<any>;
  // Request actions
  onUpdateRequestStatus: (id: string, status: 'pending' | 'completed' | 'archived') => Promise<any>;
  onDeleteRequest: (id: string) => Promise<any>;
}

type TabType = 'articles' | 'materials' | 'taxonomy' | 'comments' | 'requests';

export default function AdminDashboardView({
  adminUser,
  articles,
  materials,
  taxonomies,
  comments,
  requests,
  onLogout,
  onCreateArticle,
  onUpdateArticle,
  onDeleteArticle,
  onCreateMaterial,
  onDeleteMaterial,
  onCreateTaxonomy,
  onDeleteTaxonomy,
  onApproveComment,
  onRejectComment,
  onDeleteComment,
  onUpdateRequestStatus,
  onDeleteRequest,
}: AdminDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('articles');
  const [showMediumEditor, setShowMediumEditor] = useState(true);

  // Quick Taxonomy Add States
  const [quickSemName, setQuickSemName] = useState('');
  const [quickCourseName, setQuickCourseName] = useState('');
  const [quickTypeName, setQuickTypeName] = useState('');

  // File Upload States
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>('#');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // Form toggles and states
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [artTitle, setArtTitle] = useState('');
  const [artSlug, setArtSlug] = useState('');
  const [artExcerpt, setArtExcerpt] = useState('');
  const [artContent, setArtContent] = useState('');
  const [artCategory, setArtCategory] = useState('Syariah');
  const [artStatus, setArtStatus] = useState<'draft' | 'published'>('published');

  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [matTitle, setMatTitle] = useState('');
  const [matDesc, setMatDesc] = useState('');
  const [matSize, setMatSize] = useState('2.4 MB');
  const [matType, setMatType] = useState('pdf');
  const [matSemId, setMatSemId] = useState('');
  const [matCourseId, setMatCourseId] = useState('');
  const [matTypeId, setMatTypeId] = useState('');

  const [showTaxForm, setShowTaxForm] = useState(false);
  const [taxName, setTaxName] = useState('');
  const [taxSlug, setTaxSlug] = useState('');
  const [taxType, setTaxType] = useState<'semester' | 'course' | 'type'>('semester');

  const [showDbInstructions, setShowDbInstructions] = useState(false);

  // Helpers
  const semesters = taxonomies.filter((t) => t.type === 'semester');
  const courses = taxonomies.filter((t) => t.type === 'course');
  const types = taxonomies.filter((t) => t.type === 'type');

  const getTaxName = (id?: string) => {
    if (!id) return '-';
    return taxonomies.find((t) => t.id === id)?.name || '-';
  };

  const handleCreateArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle || !artContent) return;
    
    const slug = artSlug || artTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    onCreateArticle({
      title: artTitle,
      slug,
      excerpt: artExcerpt,
      content: artContent,
      category: artCategory,
      status: artStatus,
      published_at: new Date().toISOString()
    });

    // Reset Form
    setArtTitle('');
    setArtSlug('');
    setArtExcerpt('');
    setArtContent('');
    setArtCategory('Syariah');
    setArtStatus('published');
    setShowArticleForm(false);
  };

  const handleFileSelected = (file: File) => {
    setUploadedFileName(file.name);
    
    // Auto populate Title if empty
    if (!matTitle) {
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setMatTitle(baseName);
    }
    
    // Set auto file type
    const ext = file.name.split('.').pop() || 'pdf';
    setMatType(ext.toLowerCase());

    // Set size
    const sizeInMB = file.size / (1024 * 1024);
    const formattedSize = sizeInMB < 0.1 
      ? (file.size / 1024).toFixed(1) + ' KB' 
      : sizeInMB.toFixed(1) + ' MB';
    setMatSize(formattedSize);

    // Read file to Base64 to make it truly persistent & downloadable
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setUploadedFileUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle) return;

    onCreateMaterial({
      title: matTitle,
      description: matDesc,
      file_url: uploadedFileUrl,
      file_size: matSize,
      file_type: matType,
      semester_id: matSemId || undefined,
      course_id: matCourseId || undefined,
      type_id: matTypeId || undefined,
    });

    setMatTitle('');
    setMatDesc('');
    setMatSize('2.4 MB');
    setMatType('pdf');
    setMatSemId('');
    setMatCourseId('');
    setMatTypeId('');
    setUploadedFileUrl('#');
    setUploadedFileName('');
    setShowMaterialForm(false);
  };

  const handleCreateTaxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxName) return;

    const slug = taxSlug || taxName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    onCreateTaxonomy({
      name: taxName,
      slug,
      type: taxType,
    });

    setTaxName('');
    setTaxSlug('');
    setShowTaxForm(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mt-12 space-y-8" id="admin-dashboard-container">
      
      {/* Top Welcome Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/50 pb-6">
        <div>
          <span className="text-xs font-bold text-[#1e4646]/80 uppercase tracking-widest font-sans">
            ADMIN
          </span>
          <h1 className="font-sans font-extrabold text-3xl text-[#1a2e26] tracking-tight">
            Dashboard
          </h1>
          <p className="text-[#446257] text-sm mt-1">
            Signed in as <strong className="text-[#1e4646] font-bold">{adminUser.email}</strong>
          </p>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full neumorph-btn text-red-700 hover:text-red-800 text-xs font-bold cursor-pointer transition-colors sm:self-center self-start"
          id="admin-logout-btn"
        >
          <LogOut size={14} />
          <span>Sign out</span>
        </button>
      </div>



      {/* Tabs Row Bar */}
      <div className="flex flex-wrap gap-3.5 pb-2" id="dashboard-tabs-bar">
        {(['articles', 'materials', 'taxonomy', 'comments', 'requests'] as TabType[]).map((tab) => {
          const isActive = activeTab === tab;
          const label = tab.charAt(0).toUpperCase() + tab.slice(1);
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setShowArticleForm(false);
                setShowMaterialForm(false);
                setShowTaxForm(false);
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-bold cursor-pointer capitalize transition-all duration-300 ${
                isActive
                  ? 'neumorph-sunken text-[#1e4646] font-extrabold shadow-[inset_3px_3px_6px_#d5dadb,_inset_-3px_-3px_6px_#ffffff] bg-[#f3f6f6]'
                  : 'neumorph-raised text-[#446257] hover:shadow-[inset_2px_2px_4px_#d5dadb,_inset_-2px_-2px_4px_#ffffff]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ACTIVE TAB MAIN WINDOW */}
      <div className="space-y-6" id="dashboard-tab-content-window">
        
        {/* ==========================================
            1. ARTICLES TAB
            ========================================== */}
        {activeTab === 'articles' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Elegant Mode Toggle Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-white border border-emerald-150/40 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="text-[10px] font-extrabold font-sans text-emerald-800 uppercase tracking-wider">Medium Mode Active</span>
                </div>
                <h3 className="font-serif font-extrabold text-lg text-gray-950">Clean Writing Platform</h3>
                <p className="text-xs text-gray-500 font-sans">Distraction-free visual block editor, draft autosaving, and customizable social share poster cards.</p>
              </div>
              <button
                onClick={() => setShowMediumEditor(!showMediumEditor)}
                className="px-4 py-2 rounded-full border border-emerald-600/30 hover:bg-emerald-50 text-xs font-bold font-sans text-emerald-850 cursor-pointer shadow-sm transition-all"
              >
                {showMediumEditor ? 'Switch to Classic List View' : 'Switch to Medium Editor Mode 🌿'}
              </button>
            </div>

            {showMediumEditor ? (
              <MediumEditorView
                articles={articles}
                onCreateArticle={onCreateArticle}
                onUpdateArticle={onUpdateArticle}
                onDeleteArticle={onDeleteArticle}
                onClose={() => setActiveTab('materials')}
              />
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-gray-500">
                    {articles.length} article(s) found
                  </span>
                  {!showArticleForm && (
                    <button
                      onClick={() => setShowArticleForm(true)}
                      className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-full neumorph-btn-teal text-xs font-bold cursor-pointer transition-all"
                    >
                      <Plus size={14} />
                      <span>New article</span>
                    </button>
                  )}
                </div>

                {/* Form to create article */}
                {showArticleForm && (
                  <form onSubmit={handleCreateArticleSubmit} className="neumorph-raised rounded-2xl p-6 border border-white/40 space-y-4 max-w-3xl">
                    <div className="flex justify-between items-center">
                      <h3 className="font-sans font-bold text-base text-[#1a2e26]">Compose New Article</h3>
                      <button type="button" onClick={() => setShowArticleForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Traditional Jurisprudence in Cairo"
                          value={artTitle}
                          onChange={(e) => setArtTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl neumorph-input text-sm text-[#1a2e26] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Category</label>
                        <select
                          value={artCategory}
                          onChange={(e) => setArtCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl neumorph-input text-sm text-[#1a2e26] focus:outline-none cursor-pointer"
                        >
                          <option value="Syariah">Syariah</option>
                          <option value="Personal">Personal</option>
                          <option value="Reflections">Reflections</option>
                          <option value="General">General</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Custom Slug (optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. traditional-jurisprudence"
                          value={artSlug}
                          onChange={(e) => setArtSlug(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl neumorph-input text-sm text-[#1a2e26] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Status</label>
                        <div className="flex gap-4 mt-2">
                          <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                            <input
                              type="radio"
                              name="status"
                              checked={artStatus === 'published'}
                              onChange={() => setArtStatus('published')}
                              className="accent-[#1e4646]"
                            />
                            <span>Published</span>
                          </label>
                          <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                            <input
                              type="radio"
                              name="status"
                              checked={artStatus === 'draft'}
                              onChange={() => setArtStatus('draft')}
                              className="accent-[#1e4646]"
                            />
                            <span>Draft</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Excerpt / Brief Summary</label>
                      <input
                        type="text"
                        placeholder="Short description for list card..."
                        value={artExcerpt}
                        onChange={(e) => setArtExcerpt(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl neumorph-input text-sm text-[#1a2e26] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Content (supports Markdown headings &amp; lists)</label>
                      <textarea
                        required
                        rows={10}
                        placeholder="Write article details..."
                        value={artContent}
                        onChange={(e) => setArtContent(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl neumorph-input text-sm text-[#1a2e26] font-mono resize-none focus:outline-none"
                      />
                    </div>

                    <div className="pt-2 flex gap-3">
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-full neumorph-btn-teal text-xs font-bold cursor-pointer transition-all"
                      >
                        <Save size={12} />
                        <span>Save and Publish</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowArticleForm(false)}
                        className="px-5 py-2.5 rounded-full neumorph-btn text-gray-600 text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Articles Table list */}
                <div className="neumorph-raised rounded-2xl border border-white/40 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#f3f6f6] border-b border-gray-200/50 text-[10px] font-bold text-[#1e4646]/80 uppercase tracking-wider">
                          <th className="px-6 py-4">Title</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Published At</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200/40 text-sm text-[#1a2e26]">
                        {articles.map((art) => (
                          <tr key={art.id} className="hover:bg-gray-150/20">
                            <td className="px-6 py-4 font-bold">{art.title}</td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded-full bg-[#f3f6f6] shadow-[inset_1px_1px_3px_#d5dadb,_inset_-1px_-1px_3px_#ffffff] text-[#1e4646] text-xs font-semibold">
                                {art.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                art.status === 'published' 
                                  ? 'bg-emerald-500/10 text-emerald-800 shadow-[inset_1px_1px_2px_rgba(16,185,129,0.15)]' 
                                  : 'bg-gray-500/10 text-gray-700 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)]'
                              }`}>
                                {art.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs font-mono text-gray-400">
                              {new Date(art.published_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2.5">
                                <button
                                  onClick={() => onUpdateArticle(art.id, { status: art.status === 'published' ? 'draft' : 'published' })}
                                  title="Toggle publish/draft"
                                  className="w-8 h-8 rounded-lg bg-[#f3f6f6] shadow-[2px_2px_4px_#d5dadb,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d5dadb,_inset_-1px_-1px_3px_#ffffff] text-[#1e4646] flex items-center justify-center cursor-pointer transition-all duration-200"
                                >
                                  <Globe size={13} />
                                </button>
                                <button
                                  onClick={() => onDeleteArticle(art.id)}
                                  title="Delete"
                                  className="w-8 h-8 rounded-lg bg-[#f3f6f6] shadow-[2px_2px_4px_#d5dadb,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d5dadb,_inset_-1px_-1px_3px_#ffffff] text-red-600 flex items-center justify-center cursor-pointer transition-all duration-200"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

          </div>
        )}

        {/* ==========================================
            2. MATERIALS TAB
            ========================================== */}
        {activeTab === 'materials' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-gray-500">
                {materials.length} material(s) archived
              </span>
              {!showMaterialForm && (
                <button
                  onClick={() => setShowMaterialForm(true)}
                  className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-full neumorph-btn-teal text-xs font-bold cursor-pointer transition-all"
                >
                  <Plus size={14} />
                  <span>New material</span>
                </button>
              )}
            </div>

            {/* Material Form */}
            {showMaterialForm && (
              <form onSubmit={handleCreateMaterialSubmit} className="neumorph-raised rounded-2xl p-6 border border-white/40 space-y-4 max-w-3xl">
                <div className="flex justify-between items-center">
                  <h3 className="font-sans font-bold text-base text-[#1a2e26]">Upload New Lecture Material</h3>
                  <button type="button" onClick={() => setShowMaterialForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                {/* Drag and Drop File Uploader */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Materi File Upload</label>
                  <div 
                    className="border-2 border-dashed border-[#1e4646]/20 hover:border-[#1e4646]/50 rounded-2xl p-6 text-center bg-[#f3f6f6]/50 hover:bg-[#ebf0f0]/30 transition-all cursor-pointer relative group flex flex-col items-center justify-center space-y-2.5"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileSelected(file);
                    }}
                    onClick={() => document.getElementById('file-upload-input')?.click()}
                  >
                    <input 
                      type="file" 
                      id="file-upload-input" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelected(file);
                      }} 
                    />
                    
                    <div className="w-11 h-11 rounded-full neumorph-raised flex items-center justify-center text-[#1e4646] group-hover:scale-110 transition-transform">
                      <Plus size={18} />
                    </div>
                    
                    {uploadedFileName ? (
                      <div className="space-y-1">
                        <p className="text-sm font-extrabold text-emerald-800 font-sans">
                          ✓ {uploadedFileName}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          {matSize} • {matType.toUpperCase()}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[#1e4646] font-sans">
                          Drag &amp; drop atau klik untuk memilih file materi kuliah
                        </p>
                        <p className="text-[10px] text-gray-400 font-sans">
                          Sistem akan mengekstrak Judul, Ukuran, dan Tipe file secara otomatis!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Talkhis: Fiqh Al-Ibadat"
                    value={matTitle}
                    onChange={(e) => setMatTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl neumorph-input text-sm text-[#1a2e26] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Detailed explanation of what this file contains..."
                    value={matDesc}
                    onChange={(e) => setMatDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl neumorph-input text-sm text-[#1a2e26] resize-none focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">File Size Placeholder</label>
                    <input
                      type="text"
                      placeholder="e.g. 4.2 MB"
                      value={matSize}
                      onChange={(e) => setMatSize(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl neumorph-input text-sm text-[#1a2e26] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">File Type</label>
                    <input
                      type="text"
                      placeholder="e.g. pdf, zip, docx"
                      value={matType}
                      onChange={(e) => setMatType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl neumorph-input text-sm text-[#1a2e26] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Semester</label>
                    <select
                      value={matSemId}
                      onChange={(e) => setMatSemId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl neumorph-input text-sm text-[#1a2e26] focus:outline-none cursor-pointer"
                    >
                      <option value="">Select Semester</option>
                      {semesters.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Course Name</label>
                    <select
                      value={matCourseId}
                      onChange={(e) => setMatCourseId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl neumorph-input text-sm text-[#1a2e26] focus:outline-none cursor-pointer"
                    >
                      <option value="">Select Course</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Material Type</label>
                    <select
                      value={matTypeId}
                      onChange={(e) => setMatTypeId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl neumorph-input text-sm text-[#1a2e26] focus:outline-none cursor-pointer"
                    >
                      <option value="">Select Type</option>
                      {types.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full neumorph-btn-teal text-xs font-bold cursor-pointer transition-all"
                  >
                    <Save size={12} />
                    <span>Archive Material</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMaterialForm(false)}
                    className="px-5 py-2.5 rounded-full neumorph-btn text-gray-600 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Materials Table list */}
            <div className="neumorph-raised rounded-2xl border border-white/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f3f6f6] border-b border-gray-200/50 text-[10px] font-bold text-[#1e4646]/80 uppercase tracking-wider">
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Semester</th>
                      <th className="px-6 py-4">Course</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Downloads</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/40 text-sm text-[#1a2e26]">
                    {materials.map((mat) => (
                      <tr key={mat.id} className="hover:bg-gray-150/20">
                        <td className="px-6 py-4 font-bold">{mat.title}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                          {getTaxName(mat.semester_id)}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                          {getTaxName(mat.course_id)}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                          {getTaxName(mat.type_id)}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">{mat.download_count}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => onDeleteMaterial(mat.id)}
                            className="w-8 h-8 rounded-lg bg-[#f3f6f6] shadow-[2px_2px_4px_#d5dadb,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d5dadb,_inset_-1px_-1px_3px_#ffffff] text-red-600 inline-flex items-center justify-center cursor-pointer transition-all duration-200"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            3. TAXONOMY TAB
            ========================================== */}
        {activeTab === 'taxonomy' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-gray-500">
                {taxonomies.length} organizing terms configured
              </span>
              {!showTaxForm && (
                <button
                  onClick={() => setShowTaxForm(true)}
                  className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-full neumorph-btn-teal text-xs font-bold cursor-pointer transition-all"
                >
                  <Plus size={14} />
                  <span>Add term</span>
                </button>
              )}
            </div>

            {/* Tax Form */}
            {showTaxForm && (
              <form onSubmit={handleCreateTaxSubmit} className="neumorph-raised rounded-2xl p-6 border border-white/40 space-y-4 max-w-md">
                <div className="flex justify-between items-center">
                  <h3 className="font-sans font-bold text-base text-[#1a2e26]">Add Organizing Term</h3>
                  <button type="button" onClick={() => setShowTaxForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Term Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Semester 5, Hadith, Talkhis"
                    value={taxName}
                    onChange={(e) => setTaxName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl neumorph-input text-sm text-[#1a2e26] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Custom Slug (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. semester-5"
                    value={taxSlug}
                    onChange={(e) => setTaxSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl neumorph-input text-sm text-[#1a2e26] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Term Type</label>
                  <select
                    value={taxType}
                    onChange={(e) => setTaxType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl neumorph-input text-sm text-[#1a2e26] focus:outline-none cursor-pointer"
                  >
                    <option value="semester">Semester</option>
                    <option value="course">Course</option>
                    <option value="type">Material Type</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full neumorph-btn-teal text-xs font-bold cursor-pointer transition-all"
                  >
                    <Save size={12} />
                    <span>Save Term</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTaxForm(false)}
                    className="px-5 py-2.5 rounded-full neumorph-btn text-gray-600 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Taxonomy terms split columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="taxonomy-columns-grid">
              
              {/* Semester group */}
              <div className="neumorph-raised rounded-2xl border border-white/40 p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200/50 pb-2.5">
                  <h3 className="text-xs font-extrabold text-[#1e4646] uppercase tracking-wider">Semesters</h3>
                  <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-200/30 px-1.5 py-0.5 rounded-md">{semesters.length}</span>
                </div>
                
                {/* Inline Quick Add Semester */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!quickSemName.trim()) return;
                    const slug = quickSemName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    onCreateTaxonomy({
                      name: quickSemName.trim(),
                      slug,
                      type: 'semester'
                    });
                    setQuickSemName('');
                  }} 
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Tambah semester..."
                    value={quickSemName}
                    onChange={(e) => setQuickSemName(e.target.value)}
                    className="flex-grow px-3 py-1.5 rounded-xl neumorph-input text-xs text-[#1a2e26] focus:outline-none"
                  />
                  <button type="submit" title="Add Semester" className="p-2 rounded-xl neumorph-btn-teal text-xs font-bold shrink-0 flex items-center justify-center">
                    <Plus size={12} />
                  </button>
                </form>

                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {semesters.map((term) => (
                    <div key={term.id} className="flex justify-between items-center text-sm text-[#1a2e26] px-3.5 py-2.5 bg-[#f3f6f6] shadow-[inset_2px_2px_4px_#d5dadb,_inset_-2px_-2px_4px_#ffffff] rounded-xl font-bold">
                      <span>{term.name}</span>
                      <button onClick={() => onDeleteTaxonomy(term.id)} className="text-gray-400 hover:text-red-700 cursor-pointer p-0.5">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course group */}
              <div className="neumorph-raised rounded-2xl border border-white/40 p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200/50 pb-2.5">
                  <h3 className="text-xs font-extrabold text-[#1e4646] uppercase tracking-wider">Courses</h3>
                  <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-200/30 px-1.5 py-0.5 rounded-md">{courses.length}</span>
                </div>

                {/* Inline Quick Add Course */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!quickCourseName.trim()) return;
                    const slug = quickCourseName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    onCreateTaxonomy({
                      name: quickCourseName.trim(),
                      slug,
                      type: 'course'
                    });
                    setQuickCourseName('');
                  }} 
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Tambah course..."
                    value={quickCourseName}
                    onChange={(e) => setQuickCourseName(e.target.value)}
                    className="flex-grow px-3 py-1.5 rounded-xl neumorph-input text-xs text-[#1a2e26] focus:outline-none"
                  />
                  <button type="submit" title="Add Course" className="p-2 rounded-xl neumorph-btn-teal text-xs font-bold shrink-0 flex items-center justify-center">
                    <Plus size={12} />
                  </button>
                </form>

                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {courses.map((term) => (
                    <div key={term.id} className="flex justify-between items-center text-sm text-[#1a2e26] px-3.5 py-2.5 bg-[#f3f6f6] shadow-[inset_2px_2px_4px_#d5dadb,_inset_-2px_-2px_4px_#ffffff] rounded-xl font-bold">
                      <span>{term.name}</span>
                      <button onClick={() => onDeleteTaxonomy(term.id)} className="text-gray-400 hover:text-red-700 cursor-pointer p-0.5">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Material Type group */}
              <div className="neumorph-raised rounded-2xl border border-white/40 p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200/50 pb-2.5">
                  <h3 className="text-xs font-extrabold text-[#1e4646] uppercase tracking-wider">Material Types</h3>
                  <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-200/30 px-1.5 py-0.5 rounded-md">{types.length}</span>
                </div>

                {/* Inline Quick Add Type */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!quickTypeName.trim()) return;
                    const slug = quickTypeName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    onCreateTaxonomy({
                      name: quickTypeName.trim(),
                      slug,
                      type: 'type'
                    });
                    setQuickTypeName('');
                  }} 
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Tambah tipe..."
                    value={quickTypeName}
                    onChange={(e) => setQuickTypeName(e.target.value)}
                    className="flex-grow px-3 py-1.5 rounded-xl neumorph-input text-xs text-[#1a2e26] focus:outline-none"
                  />
                  <button type="submit" title="Add Material Type" className="p-2 rounded-xl neumorph-btn-teal text-xs font-bold shrink-0 flex items-center justify-center">
                    <Plus size={12} />
                  </button>
                </form>

                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {types.map((term) => (
                    <div key={term.id} className="flex justify-between items-center text-sm text-[#1a2e26] px-3.5 py-2.5 bg-[#f3f6f6] shadow-[inset_2px_2px_4px_#d5dadb,_inset_-2px_-2px_4px_#ffffff] rounded-xl font-bold">
                      <span>{term.name}</span>
                      <button onClick={() => onDeleteTaxonomy(term.id)} className="text-gray-400 hover:text-red-700 cursor-pointer p-0.5">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==========================================
            4. COMMENTS TAB
            ========================================== */}
        {activeTab === 'comments' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-gray-500">
                {comments.length} user comment(s) total
              </span>
            </div>

            {/* Comments List */}
            <div className="neumorph-raised rounded-2xl border border-white/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f3f6f6] border-b border-gray-200/50 text-[10px] font-bold text-[#1e4646]/80 uppercase tracking-wider">
                      <th className="px-6 py-4">Author</th>
                      <th className="px-6 py-4">Article ID / Slug</th>
                      <th className="px-6 py-4">Comment Text</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/40 text-sm text-[#1a2e26]">
                    {comments.map((com) => (
                      <tr key={com.id} className="hover:bg-gray-150/20">
                        <td className="px-6 py-4">
                          <div className="font-bold">{com.author_name}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{com.author_email}</div>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-gray-500">
                          {com.article_id}
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate" title={com.content}>
                          {com.content}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            com.status === 'approved' 
                              ? 'bg-emerald-500/10 text-emerald-800 shadow-[inset_1px_1px_2px_rgba(16,185,129,0.15)]' 
                              : com.status === 'spam'
                              ? 'bg-red-500/10 text-red-700 shadow-[inset_1px_1px_2px_rgba(239,68,68,0.15)]'
                              : 'bg-amber-500/10 text-amber-800 shadow-[inset_1px_1px_2px_rgba(245,158,11,0.15)]'
                          }`}>
                            {com.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            {com.status === 'pending' && (
                              <button
                                onClick={() => onApproveComment(com.id)}
                                title="Approve comment"
                                className="w-8 h-8 rounded-lg neumorph-btn-green flex items-center justify-center cursor-pointer transition-all duration-200"
                              >
                                <Check size={13} />
                              </button>
                            )}
                            {com.status !== 'spam' && (
                              <button
                                onClick={() => onRejectComment(com.id)}
                                title="Mark as Spam"
                                className="w-8 h-8 rounded-lg bg-[#f3f6f6] shadow-[2px_2px_4px_#d5dadb,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d5dadb,_inset_-1px_-1px_3px_#ffffff] text-amber-600 flex items-center justify-center cursor-pointer transition-all duration-200"
                              >
                                <X size={13} />
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteComment(com.id)}
                              title="Delete permanently"
                              className="w-8 h-8 rounded-lg bg-[#f3f6f6] shadow-[2px_2px_4px_#d5dadb,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d5dadb,_inset_-1px_-1px_3px_#ffffff] text-red-600 flex items-center justify-center cursor-pointer transition-all duration-200"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            5. REQUESTS TAB
            ========================================== */}
        {activeTab === 'requests' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-gray-500">
                {requests.length} lecture/materials request(s) logged
              </span>
            </div>

            {/* Requests Table list */}
            <div className="neumorph-raised rounded-2xl border border-white/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f3f6f6] border-b border-gray-200/50 text-[10px] font-bold text-[#1e4646]/80 uppercase tracking-wider">
                      <th className="px-6 py-4">From</th>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Message</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/40 text-sm text-[#1a2e26]">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-150/20">
                        <td className="px-6 py-4">
                          <div className="font-bold">{req.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{req.email}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-xs max-w-xs truncate text-[#1e4646]">
                          {req.subject || 'Say Hello'}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-600 max-w-sm" title={req.message}>
                          {req.message}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            req.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-800 shadow-[inset_1px_1px_2px_rgba(16,185,129,0.15)]'
                              : req.status === 'archived'
                              ? 'bg-gray-500/10 text-gray-700 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)]'
                              : 'bg-amber-500/10 text-amber-800 shadow-[inset_1px_1px_2px_rgba(245,158,11,0.15)]'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            {req.status !== 'completed' && (
                              <button
                                onClick={() => onUpdateRequestStatus(req.id, 'completed')}
                                title="Mark as Completed"
                                className="px-3.5 py-1.5 text-xs neumorph-btn-green font-extrabold rounded-full cursor-pointer transition-all duration-200"
                              >
                                Complete
                              </button>
                            )}
                            {req.status !== 'archived' && (
                              <button
                                onClick={() => onUpdateRequestStatus(req.id, 'archived')}
                                title="Archive Request"
                                className="px-3.5 py-1.5 text-xs neumorph-btn font-extrabold rounded-full cursor-pointer transition-all duration-200"
                              >
                                Archive
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteRequest(req.id)}
                              title="Delete request log"
                              className="w-8 h-8 rounded-lg bg-[#f3f6f6] shadow-[2px_2px_4px_#d5dadb,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d5dadb,_inset_-1px_-1px_3px_#ffffff] text-red-600 inline-flex items-center justify-center cursor-pointer transition-all duration-200"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
