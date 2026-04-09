'use client';

import { useState } from 'react';
import { useWalletStore } from '@/lib/store';
import { getNonce, sendTransaction } from '@/lib/api';
import { buildSigningPayload, signTransaction, buildTxid, privateKeyToPublicKey } from '@/lib/crypto';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 7119);
const MIN_FEE = 10000; // 0.0001 SRX in sentri
const SENTRI = 100_000_000;

export default function SendSRX({ onBack }: { onBack: () => void }) {
  const { address, privateKey } = useWalletStore();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [txid, setTxid] = useState('');

  const handleSend = async () => {
    if (!address || !privateKey) return;
    if (!toAddress.startsWith('0x') || toAddress.length !== 42) {
      toast.error('Invalid address');
      return;
    }
    const amountSrx = parseFloat(amount);
    if (isNaN(amountSrx) || amountSrx <= 0) {
      toast.error('Invalid amount');
      return;
    }

    setSending(true);
    try {
      const nonce = await getNonce(address);
      const amountSentri = Math.floor(amountSrx * SENTRI);
      const timestamp = Math.floor(Date.now() / 1000);

      const payload = {
        from: address,
        to: toAddress,
        amount: amountSentri,
        fee: MIN_FEE,
        nonce,
        data: '',
        timestamp,
        chain_id: CHAIN_ID,
      };

      const signature = await signTransaction(payload, privateKey);
      const publicKey = privateKeyToPublicKey(privateKey);
      const computedTxid = buildTxid(payload);

      const tx = {
        txid: computedTxid,
        from_address: address,
        to_address: toAddress,
        amount: amountSentri,
        fee: MIN_FEE,
        nonce,
        data: '',
        timestamp,
        chain_id: CHAIN_ID,
        signature,
        public_key: publicKey,
      };

      const result = await sendTransaction(tx);
      if (result.success) {
        setTxid(computedTxid);
        toast.success('Transaction sent!');
      } else {
        toast.error(result.error || 'Failed');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-1 text-zinc-500 hover:text-white mb-4 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Send SRX</h2>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">To Address</label>
            <input
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="0x..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white text-sm font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Amount (SRX)</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              type="number"
              step="0.0001"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-3 text-xs text-zinc-500">
            Fee: 0.0001 SRX (50% burned, 50% to validator)
          </div>

          {txid ? (
            <div className="bg-emerald-950/50 border border-emerald-800 rounded-lg p-3">
              <p className="text-xs text-emerald-400">Transaction sent!</p>
              <p className="text-xs text-zinc-400 font-mono mt-1 break-all">{txid}</p>
            </div>
          ) : (
            <button
              onClick={handleSend}
              disabled={sending}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending && <Loader2 className="w-4 h-4 animate-spin" />}
              {sending ? 'Signing & Sending...' : 'Send SRX'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
