export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  about_me: string;
  is_volunteer: boolean;
  avg_rating?: number;
  created_at: string;
  updated_at: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  date_of_birth: string;
  about_me: string;
  is_volunteer: boolean;
}

export interface RegisterFormInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  date_of_birth: string;
  about_me: string;
  is_volunteer: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message: string;
}
