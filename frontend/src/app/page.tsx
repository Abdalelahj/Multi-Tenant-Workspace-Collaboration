/**
 * Landing page — SSG (no dynamic data, statically generated at build time).
 * Shows workspace + user selector to simulate picking a session.
 * On select, redirects to the workspace slug route.
 */
import type { Metadata } from 'next';
import { LandingClient } from '@/components/workspace/LandingClient';

export const metadata: Metadata = {
  title: 'Reasonix — Choose Workspace',
};

// SSG — this page has no dynamic data
export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <LandingClient />
    </main>
  );
}
