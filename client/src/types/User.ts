export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  tenantId: number | null;
  profilePicture?: string;
  profile_picture_path?: string;
}
