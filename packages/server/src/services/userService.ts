import admin from '../firebase';

// business logic layer – for now it simply formats the decoded token
export function getUserProfile(decoded: admin.auth.DecodedIdToken) {
  const { uid, email, name, picture } = decoded;
  return { uid, email, name, picture };
}
