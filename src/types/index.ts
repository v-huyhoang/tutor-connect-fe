export interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: 'student' | 'tutor' | 'admin';
    status: 'active' | 'suspended';
}

export interface District {
    id: number;
    name: string;
    city: string;
    is_active: boolean;
}

export interface Subject {
    id: number;
    name: string;
    is_active: boolean;
}

export interface TutorDocument {
    id: number;
    type: string;
    file_path: string;
    status: 'submitted' | 'approved' | 'rejected';
    admin_note: string | null;
    created_at: string;
}

export interface TutorProfile {
    id: number;
    user_id: number;
    bio: string | null;
    experience_description: string;
    education_description: string | null;
    district_id: number | null;
    hourly_rate_min: number;
    hourly_rate_max: number;
    avg_rating: number;
    total_reviews: number;
    verification_status: 'pending' | 'verified' | 'rejected' | 'suspended';
    rejection_reason: string | null;
    daily_outreach_count: number;
    user?: User;
    documents?: TutorDocument[];
    district?: District;
}

export interface StudentProfile {
    id: number;
    user_id: number;
    grade_level: string | null;
    district_id: number | null;
    address_note: string | null;
    user?: User;
    district?: District;
}

export interface BookingRequest {
    id: number;
    student_id: number;
    tutor_id: number;
    subject_id: number | null;
    status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
    message: string | null;
    schedule_note: string | null;
    price_offer: number | null;
    tutor_response_note: string | null;
    created_at: string;
    student?: User;
    tutor?: User;
    subject?: Subject;
}

// API Error Response Types
export interface ApiErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
}

export enum ActiveStatus {
    ACTIVE = '1',
    INACTIVE = '0'
}

export const ActiveStatusLabel: Record<ActiveStatus, string> = {
    [ActiveStatus.ACTIVE]: 'Active',
    [ActiveStatus.INACTIVE]: 'Inactive',
};

