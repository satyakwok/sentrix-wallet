import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
  privateKey: string | null;
  address: string | null;
  setWallet: (privateKey: string, address: string) => void;
  clearWallet: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      privateKey: null,
      address: null,
      setWallet: (privateKey, address) => set({ privateKey, address }),
      clearWallet: () => set({ privateKey: null, address: null }),
    }),
    {
      name: 'sentrix-wallet',
      partialize: (state) => ({ address: state.address }),
    }
  )
);
