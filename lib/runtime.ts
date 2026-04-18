// Single source of truth for "am I running on Vercel/serverless?"
// Consolidates the four IS_SERVERLESS consts that were copy-pasted across
// /api/agents/control, /api/git/log, /api/git/contributions, /api/git/revert.
export const IS_SERVERLESS = Boolean(
  process.env.VERCEL ||
  process.env.AWS_EXECUTION_ENV ||
  process.env.NETLIFY,
)

// Standard payload when a route can't run on serverless because it needs
// local tooling (pm2, git, file-system writes, etc.).
export function remotePayload<T extends object>(extra: T, note?: string) {
  return {
    ...extra,
    remote:     true,
    remoteNote: note ?? 'This endpoint only runs on your local PC (http://localhost:3000). The hosted copy on Vercel cannot access local tools.',
  }
}
