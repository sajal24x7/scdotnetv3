// Typed view of the site's shared sign-in session.
//
// The implementation is public/auth/session.js — see that file for why it
// lives there (the /write composer is outside the Astro build and imports it
// over the wire, so the two consumers share one physical module rather than
// two copies that drift). This file adds types and nothing else; never
// reimplement any of it here.

// Plain-JS module, shared verbatim with the standalone /write app.
import * as session from '../../../public/auth/session.js';

export interface AuthCheckResult {
	login: string | null;
	canPush: boolean;
}

export const TOKEN_KEY: string = session.TOKEN_KEY;
export const LOGIN_KEY: string = session.LOGIN_KEY;
export const LEGACY_TOKEN_KEYS: string[] = session.LEGACY_TOKEN_KEYS;
export const TOKEN_HELP_URL: string = session.TOKEN_HELP_URL;

export const adoptLegacyToken: () => string | null = session.adoptLegacyToken;
export const getToken: () => string | null = session.getToken;
export const getLogin: () => string | null = session.getLogin;
export const isSignedIn: () => boolean = session.isSignedIn;
export const signIn: (token: string, login?: string | null) => void = session.signIn;
export const signOut: () => void = session.signOut;
export const verifyToken: (token: string) => Promise<string | null> = session.verifyToken;
export const signInWithToken: (rawToken: string) => Promise<string | null> = session.signInWithToken;
export const subscribe: (listener: (token: string | null) => void) => () => void = session.subscribe;
