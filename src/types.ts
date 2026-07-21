// Global TypeScript types for Rusd.Pen platform

export type TaxonomyType = 'semester' | 'course' | 'type';

export interface Taxonomy {
  id: string;
  name: string;
  slug: string;
  type: TaxonomyType;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category: string;
  status: 'draft' | 'published';
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_size?: string;
  file_type?: string; // 'pdf', 'docx', 'zip', etc.
  semester_id?: string; // references Taxonomy
  course_id?: string; // references Taxonomy
  type_id?: string; // references Taxonomy
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  article_id: string;
  author_name: string;
  author_email: string;
  content: string;
  status: 'pending' | 'approved' | 'spam';
  created_at: string;
}

export interface MaterialRequest {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'pending' | 'completed' | 'archived';
  created_at: string;
}

export interface AdminUser {
  email: string;
  role: string;
}

export interface MaterialReview {
  id: string;
  material_id: string;
  author_name: string;
  author_email: string;
  rating: number; // 1 to 5 stars
  content: string;
  created_at: string;
}

