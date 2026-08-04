import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';

// Initialize firebase admin to verify tokens
admin.initializeApp({
  projectId: 'stayzen1',
});

export const auth = getAuth();
