/**
 * Hardcoded seed users — matches prisma/seed.ts exactly.
 * Used for the UserSwitcher and API call headers (simulates auth).
 */
export const SEED_USERS = [
  {
    id: 'user_alice_acme',
    name: 'Alice',
    email: 'alice@acme.com',
    workspaceSlug: 'acme-corp',
    avatarColor: '#6366f1',
  },
  {
    id: 'user_bob_acme',
    name: 'Bob',
    email: 'bob@acme.com',
    workspaceSlug: 'acme-corp',
    avatarColor: '#f59e0b',
  },
  {
    id: 'user_carol_globex',
    name: 'Carol',
    email: 'carol@globex.com',
    workspaceSlug: 'globex',
    avatarColor: '#10b981',
  },
  {
    id: 'user_dave_globex',
    name: 'Dave',
    email: 'dave@globex.com',
    workspaceSlug: 'globex',
    avatarColor: '#ef4444',
  },
] as const;

export type SeedUser = (typeof SEED_USERS)[number];

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';
