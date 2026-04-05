import { redirect } from 'next/navigation';
import { API_URL } from '@/lib/constants';
import { Channel } from '@/types';

interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

/**
 * Workspace index — redirects to the first channel.
 * SSR: runs server-side to pick the first channel.
 */
export default async function WorkspacePage({ params }: Props) {
  const { workspaceSlug } = await params;

  try {
    // We need the workspace ID to fetch channels — get it via slug endpoint
    const wsRes = await fetch(`${API_URL}/api/workspaces/slug/${workspaceSlug}`, {
      cache: 'no-store',
    });

    if (!wsRes.ok) {
      redirect('/');
    }

    const ws = await wsRes.json() as { id: string; channels: Channel[] };

    if (ws.channels && ws.channels.length > 0) {
      redirect(`/${workspaceSlug}/channels/${ws.channels[0].id}`);
    }
  } catch {
    // Fallback — just show nothing; layout will show sidebar
  }

  return (
    <div className="flex-1 flex items-center justify-center text-gray-600">
      <p>No channels yet. Create one using the + button in the sidebar.</p>
    </div>
  );
}
