import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, FileText, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import LecturesView from './components/LecturesView';
import ArticlesView from './components/ArticlesView';
import AboutView from './components/AboutView';
import ContactView from './components/ContactView';
import LoginView from './components/LoginView';
import AdminDashboardView from './components/AdminDashboardView';
import { dbService } from './lib/database';
import { formatCloudinaryDownloadUrl } from './lib/cloudinary';
import { Article, Material, Taxonomy, Comment, MaterialRequest, AdminUser } from './types';

function RedirectToHome({ onRedirect }: { onRedirect: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRedirect();
    }, 1000);
    return () => clearTimeout(timer);
  }, [onRedirect]);

  return null;
}

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Dark Mode State & Persistence
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Core Entity States
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [requests, setRequests] = useState<MaterialRequest[]>([]);

  // Selected article for detailed reading
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Search Overlay Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Pre-filled subject for lecture requests
  const [prefilledContactSubject, setPrefilledContactSubject] = useState('');

  // Initial Data Fetch
  useEffect(() => {
    async function initData() {
      try {
        const taxData = await dbService.getTaxonomies();
        const artData = await dbService.getArticles();
        const matData = await dbService.getMaterials();
        const comData = await dbService.getComments();
        const reqData = await dbService.getRequests();

        setTaxonomies(taxData);
        setArticles(artData);
        setMaterials(matData);
        setComments(comData);
        setRequests(reqData);

        // Check local session
        const currentAdmin = dbService.getCurrentUser();
        if (currentAdmin) {
          setAdminUser(currentAdmin);
        }
      } catch (err) {
        console.error('Error fetching initial database state:', err);
      }
    }
    initData();
  }, []);

  // Sync state helpers to re-read localStorage / Supabase
  const refreshAllStates = async () => {
    const taxData = await dbService.getTaxonomies();
    const artData = await dbService.getArticles();
    const matData = await dbService.getMaterials();
    const comData = await dbService.getComments();
    const reqData = await dbService.getRequests();

    setTaxonomies(taxData);
    setArticles(artData);
    setMaterials(matData);
    setComments(comData);
    setRequests(reqData);
  };

  // View Navigation wrapper
  const handleNavigate = (view: string) => {
    setCurrentView(view);
    setSelectedArticle(null); // clear reading state
    setPrefilledContactSubject(''); // clear prefill
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================
  // ACTIONS & HANDLERS
  // ==========================================

  const handleDownloadMaterial = async (id: string) => {
    try {
      await dbService.incrementDownload(id);
      // Refresh local materials download count in state
      setMaterials(prev =>
        prev.map(m => m.id === id ? { ...m, download_count: m.download_count + 1 } : m)
      );
      
      const mat = materials.find(m => m.id === id);
      if (!mat) return;

      let fileUrl = (mat.file_url || '').trim();
      fileUrl = formatCloudinaryDownloadUrl(fileUrl);
      const ext = (mat.file_type || 'pdf').toLowerCase();
      const sanitizedTitle = mat.title.replace(/[/\\?%*:|"<>]/g, '_');
      const filename = sanitizedTitle.endsWith(`.${ext}`) ? sanitizedTitle : `${sanitizedTitle}.${ext}`;

      if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://') || fileUrl.startsWith('//')) {
        // Direct file URL (Cloudinary or external HTTP/HTTPS link)
        try {
          const res = await fetch(fileUrl);
          if (!res.ok) throw new Error('Download request failed');
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } catch {
          // If CORS or network prevents direct fetch, open or trigger download via target="_blank"
          const link = document.createElement('a');
          link.href = fileUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else if (fileUrl.startsWith('data:')) {
        // Real Base64 file download trigger
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Missing URL or sample seed item
        alert(`Materi "${mat.title}" belum memiliki file PDF yang diunggah. Silakan unggah file PDF materi ini melalui Dashboard Admin.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestMaterialRedirect = (searchQuery: string) => {
    setPrefilledContactSubject(searchQuery ? `Request: ${searchQuery}` : 'Request: Lecture Material');
    setCurrentView('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitRequest = async (name: string, email: string, subject: string, message: string) => {
    try {
      await dbService.createRequest({ name, email, subject, message });
      await refreshAllStates();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitComment = async (articleId: string, name: string, email: string, text: string) => {
    try {
      await dbService.createComment({
        article_id: articleId,
        author_name: name,
        author_email: email,
        content: text
      });
      await refreshAllStates();
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // ADMIN AUTHENTICATION HANDLERS
  // ==========================================

  const handleLogin = async (email: string, pass: string): Promise<boolean> => {
    const res = await dbService.loginAdmin(email, pass);
    if (res.success && res.user) {
      setAdminUser(res.user);
      handleNavigate('admin');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    dbService.logoutAdmin();
    setAdminUser(null);
    handleNavigate('home');
  };

  // ==========================================
  // INTERMEDIATE SEARCH HANDLERS
  // ==========================================

  const filteredSearchArticles = articles.filter(
    art =>
      art.status === 'published' &&
      (art.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
        art.content.toLowerCase().includes(globalSearch.toLowerCase()))
  );

  const filteredSearchMaterials = materials.filter(
    mat =>
      mat.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
      (mat.description && mat.description.toLowerCase().includes(globalSearch.toLowerCase()))
  );

  // ==========================================
  // RENDER SELECTION ENGINE
  // ==========================================

  const renderActiveView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomeView
            articles={articles}
            materials={materials}
            taxonomies={taxonomies}
            onNavigate={handleNavigate}
            onDownloadMaterial={handleDownloadMaterial}
            onSelectArticle={(art) => {
              setSelectedArticle(art);
              setCurrentView('articles');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );
      case 'lectures':
        return (
          <LecturesView
            materials={materials}
            taxonomies={taxonomies}
            onDownloadMaterial={handleDownloadMaterial}
            onRequestMaterial={handleRequestMaterialRedirect}
          />
        );
      case 'articles':
        return (
          <ArticlesView
            articles={articles}
            comments={comments}
            selectedArticle={selectedArticle}
            onSelectArticle={(art) => {
              setSelectedArticle(art);
            }}
            onSubmitComment={handleSubmitComment}
          />
        );
      case 'about':
        return <AboutView onNavigate={handleNavigate} />;
      case 'contact':
        return (
          <ContactView
            prefilledSubject={prefilledContactSubject}
            onSubmitRequest={handleSubmitRequest}
          />
        );
      case 'login':
        return <LoginView onLogin={handleLogin} />;
      case 'admin':
        if (!adminUser) {
          return <LoginView onLogin={handleLogin} />;
        }
        return (
          <AdminDashboardView
            adminUser={adminUser}
            articles={articles}
            materials={materials}
            taxonomies={taxonomies}
            comments={comments}
            requests={requests}
            onLogout={handleLogout}
            // Article Admin Handlers
            onCreateArticle={async (art) => {
              await dbService.createArticle(art);
              await refreshAllStates();
            }}
            onUpdateArticle={async (id, updates) => {
              await dbService.updateArticle(id, updates);
              await refreshAllStates();
            }}
            onDeleteArticle={async (id) => {
              await dbService.deleteArticle(id);
              await refreshAllStates();
            }}
            // Material Admin Handlers
            onCreateMaterial={async (mat) => {
              await dbService.createMaterial(mat);
              await refreshAllStates();
            }}
            onDeleteMaterial={async (id) => {
              await dbService.deleteMaterial(id);
              await refreshAllStates();
            }}
            // Taxonomy Admin Handlers
            onCreateTaxonomy={async (tax) => {
              await dbService.createTaxonomy(tax);
              await refreshAllStates();
            }}
            onDeleteTaxonomy={async (id) => {
              await dbService.deleteTaxonomy(id);
              await refreshAllStates();
            }}
            // Comment Admin Handlers
            onApproveComment={async (id) => {
              await dbService.approveComment(id);
              await refreshAllStates();
            }}
            onRejectComment={async (id) => {
              await dbService.rejectComment(id);
              await refreshAllStates();
            }}
            onDeleteComment={async (id) => {
              await dbService.deleteComment(id);
              await refreshAllStates();
            }}
            // Request Admin Handlers
            onUpdateRequestStatus={async (id, status) => {
              await dbService.updateRequestStatus(id, status);
              await refreshAllStates();
            }}
            onDeleteRequest={async (id) => {
              await dbService.deleteRequest(id);
              await refreshAllStates();
            }}
          />
        );
      default:
        return (
          <div className="text-center py-20 text-gray-500">
            View not found. Redirecting to home...
            <RedirectToHome onRedirect={() => handleNavigate('home')} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between ambient-grid radial-glow" id="applet-viewport">
      
      {/* Top Capsule Floating Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        adminUser={adminUser}
        onOpenSearch={() => {
          setIsSearchOpen(true);
          setGlobalSearch('');
        }}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main Content Area */}
      <main className="flex-grow pb-16 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView === 'articles' && selectedArticle ? `article-${selectedArticle.id}` : currentView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Footer Section & Floating Bar */}
      <Footer
        onNavigate={handleNavigate}
        adminUser={adminUser}
        onLogout={handleLogout}
      />

      {/* ==========================================
          UNIVERSAL SEARCH GLASS OVERLAY MODAL
          ========================================== */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1a2e26]/30 backdrop-blur-xl z-100 flex items-start justify-center pt-24 px-4"
            id="global-search-modal"
          >
            <motion.div
              initial={{ scale: 0.95, y: -20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -20, opacity: 0 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
              className="bg-white/95 border border-white max-w-2xl w-full rounded-3xl p-6 shadow-2xl flex flex-col space-y-4 max-h-[75vh]"
            >
              
              {/* Search Header */}
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-xs font-bold text-[#1e4646] uppercase tracking-wider font-sans">
                  Universal Search
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 15 }}
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </motion.button>
              </div>

              {/* Input search box */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  autoFocus
                  placeholder="Type keywords to search articles &amp; lecture files..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1e4646] bg-white text-gray-800 font-sans"
                />
              </div>

              {/* Live Search results */}
              <div className="flex-grow overflow-y-auto space-y-4 pr-1 text-sm text-[#1a2e26]" id="search-modal-results">
                {globalSearch.trim() ? (
                  <>
                    {/* Articles Segment */}
                    {filteredSearchArticles.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-[#1e4646]/60 uppercase tracking-widest font-mono">
                          Essays &amp; Journal Articles ({filteredSearchArticles.length})
                        </h4>
                        <div className="space-y-1">
                          {filteredSearchArticles.map((art) => (
                            <motion.button
                              whileHover={{ scale: 1.01, x: 4 }}
                              whileTap={{ scale: 0.99 }}
                              transition={{ type: 'spring' as const, stiffness: 300, damping: 15 }}
                              key={art.id}
                              onClick={() => {
                                setSelectedArticle(art);
                                setCurrentView('articles');
                                setIsSearchOpen(false);
                              }}
                              className="w-full text-left p-3 rounded-xl hover:bg-[#1e4646]/5 border border-transparent hover:border-[#1e4646]/10 transition-all flex items-center justify-between cursor-pointer group"
                            >
                              <div className="flex items-center gap-2">
                                <FileText size={14} className="text-[#1e4646]/60" />
                                <span className="font-semibold">{art.title}</span>
                              </div>
                              <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#1e4646]" />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Materials Segment */}
                    {filteredSearchMaterials.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <h4 className="text-[10px] font-bold text-[#1e4646]/60 uppercase tracking-widest font-mono">
                          Lecture Archive Materials ({filteredSearchMaterials.length})
                        </h4>
                        <div className="space-y-1">
                          {filteredSearchMaterials.map((mat) => (
                            <motion.button
                              whileHover={{ scale: 1.01, x: 4 }}
                              whileTap={{ scale: 0.99 }}
                              transition={{ type: 'spring' as const, stiffness: 300, damping: 15 }}
                              key={mat.id}
                              onClick={() => {
                                setCurrentView('lectures');
                                setIsSearchOpen(false);
                              }}
                              className="w-full text-left p-3 rounded-xl hover:bg-[#1e4646]/5 border border-transparent hover:border-[#1e4646]/10 transition-all flex items-center justify-between cursor-pointer group"
                            >
                              <div className="flex items-center gap-2">
                                <BookOpen size={14} className="text-[#1e4646]/60" />
                                <span className="font-semibold">{mat.title}</span>
                              </div>
                              <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#1e4646]" />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {filteredSearchArticles.length === 0 && filteredSearchMaterials.length === 0 && (
                      <p className="text-xs text-gray-400 italic text-center py-6">
                        No matches found for &ldquo;{globalSearch}&rdquo;. Try another term.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-400 space-y-1">
                    <p className="text-xs italic font-sans">Begin typing to instantly scour the digital desk.</p>
                    <p className="text-[10px] font-mono opacity-80">Searches titles, notes, content summaries &amp; categories.</p>
                  </div>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
