'use client';

import { useState } from 'react';
import { useWalletStore } from '@/lib/store';
import { generatePrivateKey, privateKeyToAddress, isValidPrivateKey } from '@/lib/crypto';
import { KeyRound, Plus, AlertTriangle, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WalletSetup() {
  const [tab, setTab] = useState<'import' | 'generate'>('import');
  const [inputKey, setInputKey] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [previewAddress, setPreviewAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const { setWallet } = useWalletStore();

  const handleImport = () => {
    const key = inputKey.trim().replace(/^0x/, '');
    if (!isValidPrivateKey(key)) {
      toast.error('Invalid private key');
      return;
    }
    const address = privateKeyToAddress(key);
    setWallet(key, address);
    toast.success('Wallet imported');
  };

  const handleGenerate = () => {
    const key = generatePrivateKey();
    const address = privateKeyToAddress(key);
    setGeneratedKey(key);
    setPreviewAddress(address);
  };

  const handleConfirmGenerate = () => {
    if (!generatedKey) return;
    setWallet(generatedKey, previewAddress);
    toast.success('Wallet created');
  };

  const handlePreview = () => {
    const key = inputKey.trim().replace(/^0x/, '');
    if (!isValidPrivateKey(key)) {
      toast.error('Invalid private key');
      return;
    }
    setPreviewAddress(privateKeyToAddress(key));
  };

  const copyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Sentrix Wallet</h1>
          <p className="text-zinc-500 mt-2">Chain ID: 7119</p>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-zinc-800">
            <button
              onClick={() => setTab('import')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === 'import' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <KeyRound className="inline w-4 h-4 mr-1" /> Import Wallet
            </button>
            <button
              onClick={() => setTab('generate')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === 'generate' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Plus className="inline w-4 h-4 mr-1" /> Generate New
            </button>
          </div>

          <div className="p-6">
            {tab === 'import' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Private Key (hex)</label>
                  <textarea
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="Enter 64-character hex private key..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white text-sm font-mono resize-none h-20 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {previewAddress && (
                  <div className="bg-zinc-800 rounded-lg p-3">
                    <p className="text-xs text-zinc-500">Address</p>
                    <p className="text-sm text-emerald-400 font-mono break-all">{previewAddress}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handlePreview}
                    className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg text-sm hover:bg-zinc-700 transition-colors"
                  >
                    Preview
                  </button>
                  <button
                    onClick={handleImport}
                    className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors"
                  >
                    Import
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {!generatedKey ? (
                  <button
                    onClick={handleGenerate}
                    className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-500 transition-colors"
                  >
                    Generate New Wallet
                  </button>
                ) : (
                  <>
                    <div className="bg-amber-950/50 border border-amber-800 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-300">
                          Save this private key NOW. It will NOT be shown again. Anyone with this key controls your funds.
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-zinc-500">Private Key</label>
                        <button onClick={copyKey} className="text-xs text-zinc-500 hover:text-emerald-400 flex items-center gap-1">
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="bg-zinc-800 rounded-lg p-3">
                        <p className="text-xs text-amber-400 font-mono break-all">{generatedKey}</p>
                      </div>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-3">
                      <p className="text-xs text-zinc-500">Address</p>
                      <p className="text-sm text-emerald-400 font-mono break-all">{previewAddress}</p>
                    </div>
                    <button
                      onClick={handleConfirmGenerate}
                      className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors"
                    >
                      I saved the key — Continue
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
