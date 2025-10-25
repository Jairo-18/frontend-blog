/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UserMetadata {
  [key: string]: any;
  full_name?: string;
  provider?: string;
  avatar_url?: string;
}

export interface AppUser {
  id: string;
  aud?: string | null;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
  confirmed_at?: string | null;
  last_sign_in_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  user_metadata?: UserMetadata;
}

export interface AppAuthSession {
  access_token: string;
  expires_in?: number;
  expires_at?: number;
  refresh_token: string;
  token_type?: string;
  provider_token?: string | null;
  user: AppUser;
  [key: string]: any;
}

export interface UnifiedSession {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    roleTypeId: string;
    roleType: {
      id: string;
      code: string;
      name: string;
    }[];
  };
}
export interface UserWithRoleInterface {
  id: string;
  roleTypeId: string;
  roleType: {
    id: string;
    code: string;
    name: string;
  }[];
}
