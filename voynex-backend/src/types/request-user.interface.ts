export interface RequestUser {
  sub: string;
  email: string;
  role: string;
  organizationId?: string;
}