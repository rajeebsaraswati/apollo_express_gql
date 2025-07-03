export interface AuthInfo {
    id: number;
    email: string;
    mobile_number: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    mobile_number: string;
    password: string;
}

export interface Otp {
    id: number;
    user_id: number;
    otp: string;
    expires_at: string;
}

export interface CreateUserInput {
    email: string;
    name: string;
    mobile_number: string;
    password: string;
}

export interface CreateProfileInput {
    user_id: number;
    bio?: string;
    avatar_url?: string;
    handle: string;
    permanent_address: string;
    current_address: string;
    gender: string;
    topics?: [number];
    communities?: [number];
}

export interface CreateCommunityInput {
    name: string;
    description?: string;
    logo_url?: string;
}

export interface CreatePostInput {
    community_id: number;
    topic_id: number;
    title: string;
    content: string;
    image: string;
    location_tag: string;
}