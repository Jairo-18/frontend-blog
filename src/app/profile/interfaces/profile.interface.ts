export interface ProfileInterface {
  id: string;
  fullName: string;
  country?: string;
  phone?: string;
  username?: string;
  bibliography?: string;
  email?: string;
  roleTypeId?: string;
  created_at: Date;
}
export interface RoleTypeInterface {
  id: string;
  code: string;
  name: string;
}
