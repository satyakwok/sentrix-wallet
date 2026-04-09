'use client';

import { useWalletStore } from '@/lib/store';
import WalletSetup from '@/components/WalletSetup';
import Dashboard from '@/components/Dashboard';

export default function WalletPage() {
  const { address } = useWalletStore();

  if (!address) {
    return <WalletSetup />;
  }

  return <Dashboard />;
}
