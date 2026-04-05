/**
 * Workspace layout — SSR (Server Component).
 * Fetches workspace + channels on every request (user-specific data).
 * Renders the sidebar shell; the chat area is a CSR client component.
 */
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { apiFetch } from '@/lib/api';
import { Workspace, Channel } from '@/types';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';
import { API_URL } from '@/lib/constants';

interface Props {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
}

async function getWorkspaceBySlug(slug: string): Promise<(Workspace & { channels: Channel[] }) | null> {
  try {
    // Server-side fetch — no auth headers needed for workspace lookup by slug
    const res = await fetch(`${API_URL}/api/workspaces/slug/${slug}`, {
      cache: 'no-store', // SSR: always fresh
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function WorkspaceLayout({ children, params }: Props) {
  const { workspaceSlug } = await params;

  const workspace = await getWorkspaceBySlug(workspaceSlug);

  if (!workspace) {
    notFound();
  }

  return (
    <WorkspaceShell workspace={workspace} channels={workspace.channels ?? []}>
      {children}
    </WorkspaceShell>
  );
}
