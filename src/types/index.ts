// ===== User & Auth Types =====
export type UserRole = 'job_seeker' | 'employer' | 'admin';
export type JobType = 'fulltime' | 'parttime' | 'daily';
export type JobStatus = 'pending' | 'active' | 'inactive' | 'rejected';
export type ApplicationStatus = 'applied' | 'reviewing' | 'interview' | 'hired' | 'rejected';
export type SalaryType = 'monthly' | 'daily' | 'per_piece';
export type SeekerType = 'fulltime' | 'daily';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobSeekerProfile {
  user_id: string;
  seeker_type: SeekerType;
  resume_url: string | null;
  education: string | null;
  experience: string | null;
  skills: string[] | null;
  work_districts: string[] | null;
  expected_salary_min: number | null;
  expected_salary_max: number | null;
  bio: string | null;
}

export interface EmployerProfile {
  user_id: string;
  company_name: string;
  company_address: string | null;
  company_phone: string | null;
  tax_id: string | null;
  company_description: string | null;
  logo_url: string | null;
  is_verified: boolean;
}

// ===== Category =====
export interface Category {
  id: number;
  name_th: string;
  name_en: string | null;
  name_zh: string | null;
  type: 'job_category' | 'district';
  sort_order: number;
}

// ===== Job Post =====
export interface JobPost {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  requirements: string | null;
  job_type: JobType;
  job_category_id: number | null;
  district_id: number | null;
  salary_type: SalaryType;
  salary_min: number | null;
  salary_max: number | null;
  salary_display: string | null;
  status: JobStatus;
  is_featured: boolean;
  views_count: number;
  application_count: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
  // Joined
  employer_profiles?: EmployerProfile;
  job_category?: Category;
  district?: Category;
}

// ===== Application =====
export interface Application {
  id: string;
  job_id: string;
  seeker_id: string;
  status: ApplicationStatus;
  cover_letter: string | null;
  attachment_url: string | null;
  employer_note: string | null;
  applied_at: string;
  updated_at: string;
  // Joined
  job_posts?: JobPost;
  profiles?: Profile;
  job_seeker_profiles?: JobSeekerProfile;
}

// ===== Bookmark =====
export interface Bookmark {
  id: string;
  user_id: string;
  job_id: string;
  created_at: string;
  job_posts?: JobPost;
}

// ===== Ad Slot =====
export interface AdSlot {
  id: number;
  slot_number: number;
  slot_name: string;
  slot_position: string;
  slot_size: string;
  image_url: string | null;
  target_url: string | null;
  advertiser_name: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  contact_line: string;
  created_at: string;
}

// ===== Search/Filter Params =====
export interface JobSearchParams {
  keyword?: string;
  jobType?: JobType | 'all';
  districtId?: number;
  categoryId?: number;
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
  limit?: number;
}
