'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWalletStore } from '@/lib/store';
import { getAddressInfo, getTokenBalance } from '@/lib/api';
import SendSRX from './SendSRX';
import SendSNTX from './SendSNTX';
import TxHistory from './TxHistory';
import { Copy, Check, RefreshCw, LogOut, Send, Flame } from 'lucide-react';
import toast from 'react-hot-toast';

const SNTX_CONTRACT = process.env.NEXT_PUBLIC_SNTX_CONTRACT || '';

export default function Dashboard() {
  const { address, clearWallet } = useWalletStore();
  const [srxBalance, setSrxBalance] = useState<number>(0);
  const [sntxBalance, setSntxBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<'main' | 'send-srx' | 'send-sntx' | 'history'>('main');

  const fetchBalances = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [addrInfo, tokenInfo] = await Promise.all([
        getAddressInfo(address).catch(() => null),
        SNTX_CONTRACT ? getTokenBalance(SNTX_CONTRACT, address).catch(() => null) : null,
      ]);
      setSrxBalance(addrInfo?.balance_srx ?? 0);
      setSntxBalance(tokenInfo?.balance ?? 0);
    } catch {
      toast.error('Failed to fetch balances');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => { fetchBalances(); }, [fetchBalances]);

  const copyAddress = () => {
    if (address) navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncate = (s: string) => s.slice(0, 8) + '...' + s.slice(-6);

  if (view === 'send-srx') return <SendSRX onBack={() => { setView('main'); fetchBalances(); }} />;
  if (view === 'send-sntx') return <SendSNTX onBack={() => { setView('main'); fetchBalances(); }} />;
  if (view === 'history') return <TxHistory onBack={() => setView('main')} />;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Sentrix Wallet</h1>
          <button onClick={clearWallet} className="text-zinc-500 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Address Card */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={copyAddress} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors font-mono">
              {address ? truncate(address) : ''}
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button onClick={fetchBalances} disabled={loading} className="text-zinc-500 hover:text-white transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* SRX Balance */}
          <div className="mb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">SRX Balance</p>
            <p className="text-3xl font-bold text-white mt-1">
              {loading ? '...' : srxBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              <span className="text-lg text-zinc-500 ml-2">SRX</span>
            </p>
          </div>

          {/* SNTX Balance */}
          <div className="bg-zinc-800/50 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">SNTX Balance</p>
                <p className="text-lg font-semibold text-emerald-400">
                  {loading ? '...' : sntxBalance.toLocaleString()}
                </p>
              </div>
              <Flame className="w-5 h-5 text-emerald-500/50" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setView('send-srx')}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left hover:border-emerald-800 transition-colors group"
          >
            <Send className="w-5 h-5 text-emerald-500 mb-2 group-hover:translate-x-0.5 transition-transform" />
            <p className="text-sm font-medium text-white">Send SRX</p>
            <p className="text-xs text-zinc-500">Native transfer</p>
          </button>
          <button
            onClick={() => setView('send-sntx')}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left hover:border-emerald-800 transition-colors group"
          >
            <Send className="w-5 h-5 text-blue-500 mb-2 group-hover:translate-x-0.5 transition-transform" />
            <p className="text-sm font-medium text-white">Send SNTX</p>
            <p className="text-xs text-zinc-500">Token transfer</p>
          </button>
        </div>

        {/* History Link */}
        <button
          onClick={() => setView('history')}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
        >
          View Transaction History
        </button>
      </div>
    </div>
  );
}
