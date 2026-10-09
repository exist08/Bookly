/**
 * Google Sign-In (original API) — https://react-native-google-signin.github.io/docs/original
 *
 * Client IDs come from Google Cloud Console (project 153004524173):
 *  - Web client: used as `webClientId` so the returned idToken's audience is the
 *    web client — that's what the backend verifies in POST /v1/auth/google.
 *  - iOS client: used as `iosClientId`; its reversed form is the URL scheme in Info.plist.
 *  - Android client: not passed in code. Google matches it by package name
 *    (com.anurag.bookly) + the signing key's SHA-1 registered in the console.
 */
import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
  type User as GoogleUser,
} from '@react-native-google-signin/google-signin';

export const GOOGLE_WEB_CLIENT_ID =
  '153004524173-79farmg2350m8opb24ehebbfvb589kut.apps.googleusercontent.com';
export const GOOGLE_IOS_CLIENT_ID =
  '153004524173-6tgdlk10bupn425s6c66qpoiqr2rdrag.apps.googleusercontent.com';

let configured = false;

/** Call once at startup (App.tsx). Safe to call again. */
export function configureGoogleSignIn() {
  if (configured) return;
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    offlineAccess: false, // no server auth code; the backend only needs the idToken
    profileImageSize: 240, // iOS
  });
  configured = true;
}

export type GoogleProfile = GoogleUser['user'] & { idToken: string };

export class GoogleSignInError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

/**
 * Opens the Google account picker.
 * Resolves `null` if the reader cancels, so callers can stay quiet instead of toasting.
 */
export async function googleSignIn(): Promise<GoogleProfile | null> {
  configureGoogleSignIn();
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (isCancelledResponse(response)) return null;
    if (!isSuccessResponse(response)) return null;

    const { user, idToken } = response.data;
    if (!idToken) {
      throw new GoogleSignInError('Google didn’t return an ID token. Check the web client ID.', 'no_id_token');
    }
    return { ...user, idToken };
  } catch (error) {
    if (error instanceof GoogleSignInError) throw error;
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          return null;
        case statusCodes.IN_PROGRESS:
          throw new GoogleSignInError('Google sign-in is already open.', 'in_progress');
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          throw new GoogleSignInError('Google Play Services is missing or out of date.', 'play_services');
        default:
          // DEVELOPER_ERROR (code 10) on Android = SHA-1 / package not registered for the Android client.
          if (__DEV__) console.warn('[google-signin]', error.code, error.message);
          throw new GoogleSignInError('Couldn’t sign in with Google. Please try again.', String(error.code));
      }
    }
    throw new GoogleSignInError('Couldn’t sign in with Google. Please try again.', 'unknown');
  }
}

/** Clears the Google session so the account picker shows next time. Never throws. */
export async function googleSignOut() {
  try {
    if (GoogleSignin.hasPreviousSignIn()) await GoogleSignin.signOut();
  } catch {}
}

/** Disconnects Bookly from the Google account (used on account deletion). Never throws. */
export async function googleRevokeAccess() {
  try {
    if (GoogleSignin.hasPreviousSignIn()) await GoogleSignin.revokeAccess();
  } catch {}
}
