'use client';

import { useState, useEffect } from 'react';
import { useWalletStore } from '@/lib/store';
import { getTransactionHistory } from '@/lib/api';
import type { TxHistoryItem } from '@/types';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Coins } from 'lucide-react';

export default function TxHistory({ onBack }: { onBack: () => void }) {
  const { address } = useWalletStore();
  const [txs, setTxs] = useState<TxHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    getTransactionHistory(address)
      .then((data) => setTxs(data.transactions || []))
      .catch(() => setTxs([]))
      .finally(() => setLoading(false));
  }, [address]);

  const truncate = (s: string) => s.length > 14 ? s.slice(0, 8) + '...' + s.slice(-4) : s;

  const formatTime = (ts: number) => {
    const d = new Date(ts * 1000);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const SENTRI = 100_000_000;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-1 text-zinc-500 hover:text-white mb-4 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-white">Transaction History</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-zinc-500 text-sm">Loading...</div>
          ) : txs.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">No transactions yet</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {txs.map((tx) => (
                <div key={tx.txid} className="p-4 hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.direction === 'in' ? 'bg-emerald-950 text-emerald-400' :
                        tx.direction === 'reward' ? 'bg-amber-950 text-amber-400' :
                        'bg-red-950 text-red-400'
                      }`}>
                        {tx.direction === 'in' ? <ArrowDownLeft className="w-4 h-4" /> :
                         tx.direction === 'reward' ? <Coins className="w-4 h-4" /> :
                         <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm text-white">
                          {tx.direction === 'reward' ? 'Block Reward' :
                           tx.direction === 'in' ? `From ${truncate(tx.from)}` :
                           `To ${truncate(tx.to)}`}
                        </p>
                        <p className="text-xs text-zinc-500">{formatTime(tx.block_timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        tx.direction === 'out' ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        {tx.direction === 'out' ? '-' : '+'}
                        {(tx.amount / SENTRI).toLocaleString(undefined, { maximumFractionDigits: 4 })} SRX
                      </p>
                      {tx.fee > 0 && <p className="text-xs text-zinc-600">fee: {tx.fee / SENTRI} SRX</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
