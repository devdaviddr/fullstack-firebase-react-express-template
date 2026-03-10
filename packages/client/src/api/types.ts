export interface MeResponse {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

// reuse the same shape for other user-related endpoints
export type UserProfile = MeResponse;
