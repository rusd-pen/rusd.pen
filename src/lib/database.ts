import { createClient } from '@supabase/supabase-js';
import { Taxonomy, Article, Material, Comment, MaterialRequest, AdminUser, MaterialReview } from '../types';

// Check if credentials are set and not placeholder
const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || 'https://xoeqntxiodwqdvbgvvjx.supabase.co';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MQNu6dFKMl-Q1g66f9nEsw_aQFSi-D4';

const isRealSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') && 
  !supabaseAnonKey.includes('placeholder');

export const supabase = isRealSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// ==========================================
// LOCAL STORAGE BACKEND ENGINE (100% Offline)
// ==========================================

const LOCAL_STORAGE_KEYS = {
  TAXONOMY: 'rusd_pen_taxonomy',
  ARTICLES: 'rusd_pen_articles',
  MATERIALS: 'rusd_pen_materials',
  COMMENTS: 'rusd_pen_comments',
  REQUESTS: 'rusd_pen_requests',
  ADMIN_AUTH: 'rusd_pen_admin_auth',
  REVIEWS: 'rusd_pen_material_reviews',
};

// Initial Seed Data matching the screenshots
const seedTaxonomies: Taxonomy[] = [
  { id: 'tax-sem-1', name: 'Semester 1', slug: 'semester-1', type: 'semester', created_at: new Date().toISOString() },
  { id: 'tax-sem-2', name: 'Semester 2', slug: 'semester-2', type: 'semester', created_at: new Date().toISOString() },
  { id: 'tax-sem-3', name: 'Semester 3', slug: 'semester-3', type: 'semester', created_at: new Date().toISOString() },
  { id: 'tax-sem-4', name: 'Semester 4', slug: 'semester-4', type: 'semester', created_at: new Date().toISOString() },
  { id: 'tax-course-fiqh', name: 'Fiqh Islam', slug: 'fiqh-islam', type: 'course', created_at: new Date().toISOString() },
  { id: 'tax-course-ushul', name: 'Ushul Fiqh', slug: 'ushul-fiqh', type: 'course', created_at: new Date().toISOString() },
  { id: 'tax-course-tafsir', name: 'Tafsir Ayat', slug: 'tafsir-ayat', type: 'course', created_at: new Date().toISOString() },
  { id: 'tax-course-hadith', name: 'Hadith Ahkam', slug: 'hadith-hadkam', type: 'course', created_at: new Date().toISOString() },
  { id: 'tax-type-imla', name: 'Dictation / Imla', slug: 'dictation', type: 'type', created_at: new Date().toISOString() },
  { id: 'tax-type-question', name: 'Question Bank / Ikhtibar', slug: 'question-bank', type: 'type', created_at: new Date().toISOString() },
  { id: 'tax-type-summary', name: 'Summary / Talkhis', slug: 'summary', type: 'type', created_at: new Date().toISOString() },
];

const seedArticles: Article[] = [
  {
    id: 'art-1',
    title: 'The Importance of Intent (Niyyah) in Shariah Jurisprudence',
    slug: 'importance-of-intent-shariah',
    content: `In Islamic law, **niyyah** (intent) is the foundation of every action. As the famous prophetic tradition states, *"Actions are judged by intentions."*

This essay explores the legal and spiritual dimensions of intent in Syariah studies, detailing how classic Al-Azhar jurists from different madhabs treated niyyah in worship (*ibadah*) and transactions (*muamalat*).

### Why Intent Matters
Without a clear specification of intent, legal acts remain ambiguous. A bath could be for cleanliness or for ritual purity (Ghusl). Giving money could be a gift, a loan, or Zakāt. The niyyah acts as the defining separator.

### Comparative Fiqh Perspectives
1. **Shafi'i School**: Mandates expressing intent internally at the exact onset of the act (e.g. at the first Takbir of prayer).
2. **Hanafi School**: Allows a broader window, where the intent can precede the act slightly, provided no contradictory action intervenes.

Studying these structures helps Al-Azhar students realize how meticulous classical jurisprudence was.`,
    excerpt: 'An exploration of how intent shapes judicial and personal actions under traditional Islamic jurisprudence.',
    category: 'Syariah',
    status: 'published',
    published_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'art-2',
    title: 'A Guide to Surviving Al-Azhar: Notebooks and Quiet Corners',
    slug: 'guide-surviving-al-azhar',
    content: `Studying at Al-Azhar is as much about finding the right corner to read as it is about attending massive lecture halls.

This personal log shares the quiet study spots around Cairo, the process of procuring authentic *talkhis* (summaries), and how to organize complex fiqh matrices into simple reference pages.

### Recommended Study Spots
- **Al-Azhar Mosque Library**: The classical atmosphere is unbeatable, though it can get crowded before exams.
- **Darb al-Ahmar Cafes**: Quiet in the mornings, perfect for dictation review over tea.

### Notes Organization System
To keep track of multiple madhab opinions, I recommend creating grid sheets. Horizontal axis for the opinions, vertical axis for the issues. It saves hours of flipping textbooks!`,
    excerpt: 'Practical study routines, notebook habits, and silent library corners for the modern Azhari student.',
    category: 'Personal',
    status: 'published',
    published_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString(), // 7 days ago
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const seedMaterials: Material[] = [
  {
    id: 'mat-1',
    title: 'Talkhis: Fiqh Al-Ibadat - Semester 3 Midterm',
    description: 'Comprehensive handwritten talkhis covering the chapters of Thaharah, Shalah, and Janaiz according to the Shafi\'i school. Clear diagrams and comparative tables included.',
    file_url: '#', // download mock-up
    file_size: '4.2 MB',
    file_type: 'pdf',
    semester_id: 'tax-sem-3',
    course_id: 'tax-course-fiqh',
    type_id: 'tax-type-summary',
    download_count: 48,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mat-2',
    title: 'Ikhtibar: Ushul Fiqh Past Year Questions (2023-2025)',
    description: 'Compilation of official examination papers for Ushul Fiqh from previous years, complete with model answers compiled and reviewed by senior Al-Azhar students.',
    file_url: '#',
    file_size: '1.8 MB',
    file_type: 'pdf',
    semester_id: 'tax-sem-4',
    course_id: 'tax-course-ushul',
    type_id: 'tax-type-question',
    download_count: 29,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const seedComments: Comment[] = [
  {
    id: 'com-1',
    article_id: 'art-1',
    author_name: 'Ahmad Rafli',
    author_email: 'rafli@example.com',
    content: 'This was an incredibly helpful comparative analysis. Jazakallah khair!',
    status: 'approved',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
  },
  {
    id: 'com-2',
    article_id: 'art-1',
    author_name: 'Fathima Cairo',
    author_email: 'fathima@example.com',
    content: 'Could you do a post detailing the Hanbali school\'s view on intent in trade contracts?',
    status: 'pending',
    created_at: new Date().toISOString()
  }
];

const seedRequests: MaterialRequest[] = [
  {
    id: 'req-1',
    name: 'Nizar',
    email: 'nizarar42@gmail.com',
    subject: 'Request: Semester 3 - Data Structures midterm',
    message: 'Hello, do you happen to have any resources or lecture sheets for Data Structures? Thank you for putting this site together, it is a lifesaver.',
    status: 'pending',
    created_at: new Date().toISOString()
  }
];

const seedReviews: MaterialReview[] = [
  {
    id: 'rev-1',
    material_id: 'mat-1',
    author_name: 'Ahmad Rafli',
    author_email: 'rafli@example.com',
    rating: 5,
    content: 'Penjelasan Talkhis ini sangat padat, runtut, dan mudah dipahami. Sangat membantu menyusun materi fikh ibadah!',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'rev-2',
    material_id: 'mat-1',
    author_name: 'Fathima Cairo',
    author_email: 'fathima@example.com',
    rating: 4,
    content: 'Sangat bagus untuk dijadikan rujukan cepat, ulasannya cukup objektif dan representatif.',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 'rev-3',
    material_id: 'mat-2',
    author_name: 'Zulfa Az-Zahra',
    author_email: 'zulfa@example.com',
    rating: 5,
    content: 'Kumpulan soal ushul fiqh dari tahun lalu ini sangat akurat dengan ujian yang sebenarnya. Highly recommended!',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

// Helper to initialize Local Storage
const getLocalStorageItem = <T>(key: string, seed: T[]): T[] => {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(item);
};

const saveLocalStorageItem = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Expose API Database Access
export const dbService = {
  // Config status
  isSupabaseConnected: () => isRealSupabaseConfigured,

  // ==========================================
  // TAXONOMY SERVICE
  // ==========================================
  getTaxonomies: async (): Promise<Taxonomy[]> => {
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('taxonomy').select('*').order('name');
      if (error) {
        console.error('Error fetching taxonomies from Supabase:', error);
      } else if (data) {
        return data;
      }
    }
    return getLocalStorageItem<Taxonomy>(LOCAL_STORAGE_KEYS.TAXONOMY, seedTaxonomies);
  },

  createTaxonomy: async (tax: Omit<Taxonomy, 'id' | 'created_at'>): Promise<Taxonomy> => {
    const newTax: Taxonomy = {
      ...tax,
      id: 'tax-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('taxonomy').insert([tax]).select().single();
      if (error) {
        console.error('Error creating taxonomy in Supabase:', error);
        alert('Gagal membuat kategori/term di Supabase: ' + error.message);
        throw error;
      }
      if (data) return data;
    }
    const current = getLocalStorageItem<Taxonomy>(LOCAL_STORAGE_KEYS.TAXONOMY, seedTaxonomies);
    current.push(newTax);
    saveLocalStorageItem(LOCAL_STORAGE_KEYS.TAXONOMY, current);
    return newTax;
  },

  updateTaxonomy: async (id: string, name: string, slug: string): Promise<boolean> => {
    if (isRealSupabaseConfigured && supabase) {
      const { error } = await supabase.from('taxonomy').update({ name, slug }).eq('id', id);
      if (error) {
        console.error('Error updating taxonomy in Supabase:', error);
        alert('Gagal memperbarui kategori/term di Supabase: ' + error.message);
        throw error;
      }
      return true;
    }
    const current = getLocalStorageItem<Taxonomy>(LOCAL_STORAGE_KEYS.TAXONOMY, seedTaxonomies);
    const index = current.findIndex(t => t.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], name, slug };
      saveLocalStorageItem(LOCAL_STORAGE_KEYS.TAXONOMY, current);
      return true;
    }
    return false;
  },

  deleteTaxonomy: async (id: string): Promise<boolean> => {
    if (isRealSupabaseConfigured && supabase) {
      const { error } = await supabase.from('taxonomy').delete().eq('id', id);
      if (error) {
        console.error('Error deleting taxonomy from Supabase:', error);
        alert('Gagal menghapus kategori/term di Supabase: ' + error.message);
        throw error;
      }
      return true;
    }
    const current = getLocalStorageItem<Taxonomy>(LOCAL_STORAGE_KEYS.TAXONOMY, seedTaxonomies);
    const filtered = current.filter(t => t.id !== id);
    saveLocalStorageItem(LOCAL_STORAGE_KEYS.TAXONOMY, filtered);
    return true;
  },

  // ==========================================
  // ARTICLES SERVICE
  // ==========================================
  getArticles: async (): Promise<Article[]> => {
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('articles').select('*').order('published_at', { ascending: false });
      if (error) {
        console.error('Error fetching articles from Supabase:', error);
      } else if (data) {
        return data;
      }
    }
    return getLocalStorageItem<Article>(LOCAL_STORAGE_KEYS.ARTICLES, seedArticles);
  },

  createArticle: async (art: Omit<Article, 'id' | 'created_at' | 'updated_at'>): Promise<Article> => {
    const newArt: Article = {
      ...art,
      id: 'art-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('articles').insert([art]).select().single();
      if (error) {
        console.error('Error creating article in Supabase:', error);
        alert('Gagal membuat artikel di Supabase: ' + error.message + '\n\nPastikan Anda sudah login menggunakan akun Admin Supabase yang valid (nizarar42@gmail.com).');
        throw error;
      }
      if (data) return data;
    }
    const current = getLocalStorageItem<Article>(LOCAL_STORAGE_KEYS.ARTICLES, seedArticles);
    current.push(newArt);
    saveLocalStorageItem(LOCAL_STORAGE_KEYS.ARTICLES, current);
    return newArt;
  },

  updateArticle: async (id: string, updates: Partial<Article>): Promise<boolean> => {
    if (isRealSupabaseConfigured && supabase) {
      const { error } = await supabase.from('articles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) {
        console.error('Error updating article in Supabase:', error);
        alert('Gagal memperbarui artikel di Supabase: ' + error.message);
        throw error;
      }
      return true;
    }
    const current = getLocalStorageItem<Article>(LOCAL_STORAGE_KEYS.ARTICLES, seedArticles);
    const index = current.findIndex(a => a.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updates, updated_at: new Date().toISOString() };
      saveLocalStorageItem(LOCAL_STORAGE_KEYS.ARTICLES, current);
      return true;
    }
    return false;
  },

  deleteArticle: async (id: string): Promise<boolean> => {
    if (isRealSupabaseConfigured && supabase) {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) {
        console.error('Error deleting article from Supabase:', error);
        alert('Gagal menghapus artikel di Supabase: ' + error.message);
        throw error;
      }
      return true;
    }
    const current = getLocalStorageItem<Article>(LOCAL_STORAGE_KEYS.ARTICLES, seedArticles);
    const filtered = current.filter(a => a.id !== id);
    saveLocalStorageItem(LOCAL_STORAGE_KEYS.ARTICLES, filtered);
    return true;
  },

  // ==========================================
  // MATERIALS SERVICE
  // ==========================================
  getMaterials: async (): Promise<Material[]> => {
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('materials').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching materials from Supabase:', error);
      } else if (data) {
        return data;
      }
    }
    return getLocalStorageItem<Material>(LOCAL_STORAGE_KEYS.MATERIALS, seedMaterials);
  },

  createMaterial: async (mat: Omit<Material, 'id' | 'download_count' | 'created_at' | 'updated_at'>): Promise<Material> => {
    const newMat: Material = {
      ...mat,
      id: 'mat-' + Math.random().toString(36).substr(2, 9),
      download_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('materials').insert([mat]).select().single();
      if (error) {
        console.error('Error creating material in Supabase:', error);
        alert('Gagal membuat materi di Supabase: ' + error.message);
        throw error;
      }
      if (data) return data;
    }
    const current = getLocalStorageItem<Material>(LOCAL_STORAGE_KEYS.MATERIALS, seedMaterials);
    current.push(newMat);
    saveLocalStorageItem(LOCAL_STORAGE_KEYS.MATERIALS, current);
    return newMat;
  },

  updateMaterial: async (id: string, updates: Partial<Material>): Promise<boolean> => {
    if (isRealSupabaseConfigured && supabase) {
      const { error } = await supabase.from('materials').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) {
        console.error('Error updating material in Supabase:', error);
        alert('Gagal memperbarui materi di Supabase: ' + error.message);
        throw error;
      }
      return true;
    }
    const current = getLocalStorageItem<Material>(LOCAL_STORAGE_KEYS.MATERIALS, seedMaterials);
    const index = current.findIndex(m => m.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updates, updated_at: new Date().toISOString() };
      saveLocalStorageItem(LOCAL_STORAGE_KEYS.MATERIALS, current);
      return true;
    }
    return false;
  },

  incrementDownload: async (id: string): Promise<void> => {
    if (isRealSupabaseConfigured && supabase) {
      // Supabase rpc or fetch and add
      const { data, error } = await supabase.from('materials').select('download_count').eq('id', id).single();
      if (!error && data) {
        await supabase.from('materials').update({ download_count: (data.download_count || 0) + 1 }).eq('id', id);
      }
      return;
    }
    const current = getLocalStorageItem<Material>(LOCAL_STORAGE_KEYS.MATERIALS, seedMaterials);
    const index = current.findIndex(m => m.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], download_count: current[index].download_count + 1 };
      saveLocalStorageItem(LOCAL_STORAGE_KEYS.MATERIALS, current);
    }
  },

  deleteMaterial: async (id: string): Promise<boolean> => {
    if (isRealSupabaseConfigured && supabase) {
      const { error } = await supabase.from('materials').delete().eq('id', id);
      if (error) {
        console.error('Error deleting material in Supabase:', error);
        alert('Gagal menghapus materi di Supabase: ' + error.message);
        throw error;
      }
      return true;
    }
    const current = getLocalStorageItem<Material>(LOCAL_STORAGE_KEYS.MATERIALS, seedMaterials);
    const filtered = current.filter(m => m.id !== id);
    saveLocalStorageItem(LOCAL_STORAGE_KEYS.MATERIALS, filtered);
    return true;
  },

  // ==========================================
  // COMMENTS SERVICE
  // ==========================================
  getComments: async (): Promise<Comment[]> => {
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('comments').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching comments from Supabase:', error);
      } else if (data) {
        return data;
      }
    }
    return getLocalStorageItem<Comment>(LOCAL_STORAGE_KEYS.COMMENTS, seedComments);
  },

  createComment: async (com: Omit<Comment, 'id' | 'created_at' | 'status'>): Promise<Comment> => {
    const newCom: Comment = {
      ...com,
      id: 'com-' + Math.random().toString(36).substr(2, 9),
      status: 'pending', // all public comments start pending
      created_at: new Date().toISOString()
    };
    if (isRealSupabaseConfigured && supabase) {
      const { error } = await supabase.from('comments').insert([{ ...com, status: 'pending' }]);
      if (error) {
        console.error('Error creating comment in Supabase:', error);
        alert('Gagal mengirim komentar: ' + error.message);
        throw error;
      }
      return newCom;
    }
    const current = getLocalStorageItem<Comment>(LOCAL_STORAGE_KEYS.COMMENTS, seedComments);
    current.push(newCom);
    saveLocalStorageItem(LOCAL_STORAGE_KEYS.COMMENTS, current);
    return newCom;
  },

  approveComment: async (id: string): Promise<boolean> => {
    if (isRealSupabaseConfigured && supabase) {
      const { error } = await supabase.from('comments').update({ status: 'approved' }).eq('id', id);
      if (error) {
        console.error('Error approving comment in Supabase:', error);
        alert('Gagal menyetujui komentar: ' + error.message);
        throw error;
      }
      return true;
    }
    const current = getLocalStorageItem<Comment>(LOCAL_STORAGE_KEYS.COMMENTS, seedComments);
    const index = current.findIndex(c => c.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], status: 'approved' };
      saveLocalStorageItem(LOCAL_STORAGE_KEYS.COMMENTS, current);
      return true;
    }
    return false;
  },

  rejectComment: async (id: string): Promise<boolean> => {
    if (isRealSupabaseConfigured && supabase) {
      const { error } = await supabase.from('comments').update({ status: 'spam' }).eq('id', id);
      if (error) {
        console.error('Error rejecting comment in Supabase:', error);
        alert('Gagal menolak komentar: ' + error.message);
        throw error;
      }
      return true;
    }
    const current = getLocalStorageItem<Comment>(LOCAL_STORAGE_KEYS.COMMENTS, seedComments);
    const index = current.findIndex(c => c.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], status: 'spam' };
      saveLocalStorageItem(LOCAL_STORAGE_KEYS.COMMENTS, current);
      return true;
    }
    return false;
  },

  deleteComment: async (id: string): Promise<boolean> => {
    if (isRealSupabaseConfigured && supabase) {
      const { error } = await supabase.from('comments').delete().eq('id', id);
      if (error) {
        console.error('Error deleting comment from Supabase:', error);
        alert('Gagal menghapus komentar: ' + error.message);
        throw error;
      }
      return true;
    }
    const current = getLocalStorageItem<Comment>(LOCAL_STORAGE_KEYS.COMMENTS, seedComments);
    const filtered = current.filter(c => c.id !== id);
    saveLocalStorageItem(LOCAL_STORAGE_KEYS.COMMENTS, filtered);
    return true;
  },

  // ==========================================
  // REQUESTS / CONTACT SERVICE
  // ==========================================
  getRequests: async (): Promise<MaterialRequest[]> => {
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching requests from Supabase:', error);
      } else if (data) {
        return data;
      }
    }
    return getLocalStorageItem<MaterialRequest>(LOCAL_STORAGE_KEYS.REQUESTS, seedRequests);
  },

  createRequest: async (req: Omit<MaterialRequest, 'id' | 'created_at' | 'status'>): Promise<MaterialRequest> => {
    const newReq: MaterialRequest = {
      ...req,
      id: 'req-' + Math.random().toString(36).substr(2, 9),
      status: 'pending',
      created_at: new Date().toISOString()
    };
    if (isRealSupabaseConfigured && supabase) {
      const { error } = await supabase.from('requests').insert([{ ...req, status: 'pending' }]);
      if (error) {
        console.error('Error creating request in Supabase:', error);
        alert('Gagal mengirim permohonan: ' + error.message);
        throw error;
      }
      return newReq;
    }
    const current = getLocalStorageItem<MaterialRequest>(LOCAL_STORAGE_KEYS.REQUESTS, seedRequests);
    current.push(newReq);
    saveLocalStorageItem(LOCAL_STORAGE_KEYS.REQUESTS, current);
    return newReq;
  },

  updateRequestStatus: async (id: string, status: 'pending' | 'completed' | 'archived'): Promise<boolean> => {
    if (isRealSupabaseConfigured && supabase) {
      const { error } = await supabase.from('requests').update({ status }).eq('id', id);
      if (error) {
        console.error('Error updating request in Supabase:', error);
        alert('Gagal memperbarui status permohonan: ' + error.message);
        throw error;
      }
      return true;
    }
    const current = getLocalStorageItem<MaterialRequest>(LOCAL_STORAGE_KEYS.REQUESTS, seedRequests);
    const index = current.findIndex(r => r.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], status };
      saveLocalStorageItem(LOCAL_STORAGE_KEYS.REQUESTS, current);
      return true;
    }
    return false;
  },

  deleteRequest: async (id: string): Promise<boolean> => {
    if (isRealSupabaseConfigured && supabase) {
      const { error } = await supabase.from('requests').delete().eq('id', id);
      if (error) {
        console.error('Error deleting request in Supabase:', error);
        alert('Gagal menghapus permohonan: ' + error.message);
        throw error;
      }
      return true;
    }
    const current = getLocalStorageItem<MaterialRequest>(LOCAL_STORAGE_KEYS.REQUESTS, seedRequests);
    const filtered = current.filter(r => r.id !== id);
    saveLocalStorageItem(LOCAL_STORAGE_KEYS.REQUESTS, filtered);
    return true;
  },

  // ==========================================
  // AUTH SERVICE
  // ==========================================
  getCurrentUser: (): AdminUser | null => {
    const session = localStorage.getItem(LOCAL_STORAGE_KEYS.ADMIN_AUTH);
    if (session) {
      return JSON.parse(session) as AdminUser;
    }
    return null;
  },

  verifySupabaseSession: async (): Promise<boolean> => {
    if (isRealSupabaseConfigured && supabase) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!error && session && session.user) {
          const userEmail = session.user.email || '';
          if (userEmail.toLowerCase() === 'nizarar42@gmail.com') {
            return true;
          }
        }
      } catch (e) {
        console.error('Error verifying Supabase session:', e);
      }
      return false;
    }
    return true; // if not configured, local fallback is always "valid"
  },

  signUpAdmin: async (email: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> => {
    if (isRealSupabaseConfigured && supabase) {
      try {
        const normalizedEmail = email.trim().toLowerCase();
        if (normalizedEmail !== 'nizarar42@gmail.com') {
          return { success: false, error: 'Akses ditolak: Hanya email nizarar42@gmail.com yang diizinkan untuk mendaftar sebagai administrator.' };
        }

        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: password,
          options: {
            data: {
              role: 'administrator'
            }
          }
        });

        if (error) {
          return { success: false, error: `Pendaftaran gagal: ${error.message}` };
        }

        if (data && data.user) {
          const userEmail = data.user.email || '';
          const admin: AdminUser = { email: userEmail, role: 'administrator' };
          
          if (data.session) {
            localStorage.setItem(LOCAL_STORAGE_KEYS.ADMIN_AUTH, JSON.stringify(admin));
            return { success: true, user: admin };
          } else {
            return { success: true, error: 'Pendaftaran berhasil! Silakan periksa kotak masuk email Anda untuk memverifikasi akun Anda, lalu masuk.' };
          }
        }
      } catch (err: any) {
        return { success: false, error: `Kesalahan tidak terduga: ${err.message || err}` };
      }
    }
    return { success: false, error: 'Supabase tidak terkonfigurasi untuk pendaftaran.' };
  },

  loginAdmin: async (email: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> => {
    // 1. If Supabase is configured, use the real Supabase Auth API
    if (isRealSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password
        });

        if (error) {
          return { success: false, error: `Login gagal: ${error.message}` };
        }

        if (data && data.user) {
          const userEmail = data.user.email || '';
          // Enforce administrator validation - only the site owner can access the admin dashboard
          if (userEmail.toLowerCase() !== 'nizarar42@gmail.com') {
            await supabase.auth.signOut();
            return { success: false, error: 'Akses ditolak: Email Anda bukan administrator situs.' };
          }

          const admin: AdminUser = { email: userEmail, role: 'administrator' };
          localStorage.setItem(LOCAL_STORAGE_KEYS.ADMIN_AUTH, JSON.stringify(admin));
          return { success: true, user: admin };
        }
      } catch (err: any) {
        return { success: false, error: `Kesalahan tidak terduga: ${err.message || err}` };
      }
    }

    // 2. Fallback / Mock Mode (If Supabase keys are not set yet)
    // Enforce specific email and a safe local password (e.g., admin123) to prevent random entries.
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === 'nizarar42@gmail.com' && password === 'admin123') {
      const admin: AdminUser = { email: 'nizarar42@gmail.com', role: 'administrator' };
      localStorage.setItem(LOCAL_STORAGE_KEYS.ADMIN_AUTH, JSON.stringify(admin));
      return { success: true, user: admin };
    }

    return { 
      success: false, 
      error: 'Kredensial tidak valid. (Gunakan email nizarar42@gmail.com dan password admin123 untuk mode lokal)' 
    };
  },

  logoutAdmin: (): void => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ADMIN_AUTH);
    if (isRealSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(err => console.error('Supabase signout error:', err));
    }
  },

  // ==========================================
  // REVIEWS SERVICE
  // ==========================================
  getMaterialReviews: async (materialId: string): Promise<MaterialReview[]> => {
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('material_reviews').select('*').eq('material_id', materialId).order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching reviews from Supabase:', error);
      } else if (data) {
        return data;
      }
    }
    const allReviews = getLocalStorageItem<MaterialReview>(LOCAL_STORAGE_KEYS.REVIEWS, seedReviews);
    return allReviews.filter(r => r.material_id === materialId);
  },

  createMaterialReview: async (review: Omit<MaterialReview, 'id' | 'created_at'>): Promise<MaterialReview> => {
    const newReview: MaterialReview = {
      ...review,
      id: 'rev-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('material_reviews').insert([review]).select().single();
      if (error) {
        console.error('Error creating review in Supabase:', error);
        alert('Gagal mengirim ulasan ke Supabase: ' + error.message);
        throw error;
      }
      if (data) return data;
    }
    const current = getLocalStorageItem<MaterialReview>(LOCAL_STORAGE_KEYS.REVIEWS, seedReviews);
    current.push(newReview);
    saveLocalStorageItem(LOCAL_STORAGE_KEYS.REVIEWS, current);
    return newReview;
  },
};
