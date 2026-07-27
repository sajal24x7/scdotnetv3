import React, { useEffect, useState } from 'react';
import { getLogin, getToken, signInWithToken, signOut, subscribe, TOKEN_HELP_URL } from './session';

// The site's sign-in, in one component, used anywhere a page needs write
// access to the repo (/practice today; anything else that grows an edit
// affordance later). Signing in here signs you in everywhere — see
// public/auth/session.js.
//
// Two shapes, one behaviour:
//
//   <SignInPanel/> — the standalone panel: a button that opens a token box,
//     or the signed-in line with a way out.
//   <RequireAuth>  — wraps whatever needs a token, showing the panel with a
//     custom lead until there is one.
//
// The token is verified against the repo before it's stored (/api/auth-check),
// so a typo or a wrongly-scoped token fails here with something readable
// rather than surfacing later as a mystery sync error.

// Keeps every mounted island on the page in step: sign in from the panel and
// whatever it gates re-renders, without either knowing about the other.
export function useSession(): { token: string | null; login: string | null } {
	const [token, setToken] = useState<string | null>(null);
	const [login, setLogin] = useState<string | null>(null);

	useEffect(() => {
		const sync = () => {
			setToken(getToken());
			setLogin(getLogin());
		};
		sync(); // after hydration, so the first render matches the prerendered HTML
		return subscribe(sync);
	}, []);

	return { token, login };
}

export function SignInPanel({
	lead,
	compact = false,
}: {
	lead?: React.ReactNode;
	compact?: boolean;
}) {
	const { token, login } = useSession();
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState('');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		if (!value.trim() || busy) return;
		setBusy(true);
		setError(null);
		try {
			await signInWithToken(value);
			setValue('');
			setOpen(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Could not sign in.');
		} finally {
			setBusy(false);
		}
	}

	if (token) {
		return (
			<div className={`auth-panel${compact ? ' auth-panel--compact' : ''}`}>
				<p className="auth-panel__signed-in">
					<span className="auth-panel__dot" aria-hidden="true" />
					Signed in{login ? ` as ${login}` : ''}
				</p>
				<button type="button" className="auth-button auth-button--quiet" onClick={() => signOut()}>
					Sign out
				</button>
			</div>
		);
	}

	return (
		<div className={`auth-panel${compact ? ' auth-panel--compact' : ''}`}>
			{lead && <p className="auth-panel__lead">{lead}</p>}

			{open ? (
				<form className="auth-form" onSubmit={submit}>
					<label className="auth-form__field">
						<span>GitHub personal access token</span>
						<input
							type="password"
							autoFocus
							autoComplete="off"
							spellCheck={false}
							placeholder="github_pat_…"
							value={value}
							onChange={(e) => setValue(e.target.value)}
							disabled={busy}
						/>
					</label>
					<div className="auth-form__actions">
						<button type="submit" className="auth-button auth-button--primary" disabled={busy || !value.trim()}>
							{busy ? 'Checking…' : 'Sign in'}
						</button>
						<button
							type="button"
							className="auth-button auth-button--quiet"
							onClick={() => {
								setOpen(false);
								setError(null);
								setValue('');
							}}
							disabled={busy}
						>
							Cancel
						</button>
					</div>
					{error && <p className="auth-form__error">{error}</p>}
					<p className="auth-form__help">
						A{' '}
						<a href={TOKEN_HELP_URL} target="_blank" rel="noopener noreferrer">
							fine-grained token
						</a>{' '}
						for this repository, with <strong>Contents: read and write</strong>. It's stored in this browser only and
						never sent anywhere but this site.
					</p>
				</form>
			) : (
				<button type="button" className="auth-button auth-button--primary" onClick={() => setOpen(true)}>
					Sign in with a GitHub token
				</button>
			)}
		</div>
	);
}

export function RequireAuth({ lead, children }: { lead?: React.ReactNode; children: React.ReactNode }) {
	const { token } = useSession();
	if (!token) return <SignInPanel lead={lead} />;
	return <>{children}</>;
}
