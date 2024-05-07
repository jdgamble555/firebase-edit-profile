import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const auth = admin.auth();

export const updateAuthProfile = functions.firestore
    .document('users/{userId}')
    .onUpdate(async (change, context) => {
        const beforeData = change.before.data();
        const afterData = change.after.data();
        const userId = context.params.userId;

        // Initialize an object to hold updates
        let updates = {};

        // Check if displayName has been modified
        if (beforeData.displayName !== afterData.displayName) {
            updates.displayName = afterData.displayName;
        }

        // Check if photoURL has been modified
        if (beforeData.photoURL !== afterData.photoURL) {
            updates.photoURL = afterData.photoURL;
        }

        // If there are updates, apply them to the Firebase Auth user
        if (Object.keys(updates).length > 0) {
            try {
                await auth.updateUser(userId, updates);
                console.log(`Updated user profile for user ${userId}:`, updates);
            } catch (error) {
                console.error('Error updating user profile:', error);
                throw new functions.https.HttpsError('internal', 'Failed to update user profile in Auth', error);
            }
        } else {
            console.log('No relevant changes detected in user profile');
        }
    });
