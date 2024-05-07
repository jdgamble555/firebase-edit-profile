import {
    GoogleAuthProvider,
    onIdTokenChanged,
    signInWithPopup,
    signOut,
    updateProfile,
    type User
} from "firebase/auth";
import { readable, type Subscriber } from "svelte/store";
import { auth } from "./firebase";
import { useSharedStore } from "./use-shared";
import { FirebaseError } from "firebase/app";

export const loginWithGoogle = async () =>
    await signInWithPopup(auth, new GoogleAuthProvider());
export const logout = async () => await signOut(auth);

const user = (defaultUser: UserType | null = null) =>
    readable<UserType | null>(
        defaultUser,
        (set: Subscriber<UserType | null>) => {
            return onIdTokenChanged(auth, (_user: User | null) => {
                if (!_user) {
                    set(null);
                    return;
                }
                const { displayName, photoURL, uid, email } = _user;
                set({ displayName, photoURL, uid, email });
            });
        }
    );

export const useUser = (defaultUser: UserType | null = null) =>
    useSharedStore('user', user, defaultUser);

export const updateUser = async (
    displayName: string,
    photoURL: string
) => {

    if (!auth.currentUser) {
        return {
            error: 'Not Logged In!'
        };
    }
    try {
        await updateProfile(auth.currentUser, {
            displayName,
            photoURL
        });
    } catch (e) {
        if (e instanceof FirebaseError) {
            return {
                error: e.message
            };
        }
    }
    return {};
};