
import React from 'react';
import { Icons } from '../constants';
import { AssetRecord, VerificationHistoryItem, Verdict } from '../types';

interface StorageProps {
  assets: AssetRecord[];
  verifications: VerificationHistoryItem[];
  onNewSign: () => void;
  activeView: 'signed' | 'forensics';
  setActiveView: (view: 'signed' | 'forensics') => void;
}

export const Storage: React.FC<StorageProps> = ({ 
  assets, 
  verifications, 
  onNewSign, 
  activeView, 
  setActiveView 
}) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-black/5 pb-8">
        <div className="space-y-3">
          <h2 className="text-4xl font-bold tracking-tight text-[#121317]">Storage & History</h2>
          <p className="text-[#6B6F76] text-lg font-medium">Your cryptographic ledger of provenance and forensic audits.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveView('signed')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${activeView === 'signed' ? 'border-[#121317] text-[#121317]' : 'border-transparent text-[#6B6F76] hover:text-[#121317]'}`}
          >
            Signed Assets
          </button>
          <button 
            onClick={() => setActiveView('forensics')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${activeView === 'forensics' ? 'border-[#121317] text-[#121317]' : 'border-transparent text-[#6B6F76] hover:text-[#121317]'}`}
          >
            Forensic Logs
          </button>
        </div>
      </div>

      {activeView === 'signed' ? (
        <div className="space-y-8">
          {assets.length === 0 ? (
            <div className="hex-card p-40 text-center text-[#6B6F76] space-y-6 border-dashed">
              <div className="w-16 h-16 border border-black/5 rounded-2xl flex items-center justify-center mx-auto opacity-40">
                <Icons.Layout />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em]">No signed works found</p>
                <button onClick={onNewSign} className="text-xs font-bold text-[#121317] underline decoration-black/20 hover:decoration-black transition-all">
                  Sign your first asset
                </button>
              </div>
            </div>
          ) : (
            <div className="hex-card overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#F7F6F4] text-[10px] text-[#6B6F76] font-bold uppercase tracking-[0.3em] border-b border-black/5">
                  <tr>
                    <th className="py-6 px-10">Resource</th>
                    <th className="py-6 px-10">Signature ID</th>
                    <th className="py-6 px-10">Status</th>
                    <th className="py-6 px-10 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {assets.map(asset => (
                    <tr key={asset.id} className="hover:bg-black/[0.01] transition-colors group">
                      <td className="py-6 px-10">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 border border-black/5 rounded-lg bg-white flex items-center justify-center text-[#6B6F76]">
                            <Icons.Shield />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#121317]">{asset.name}</p>
                            <p className="text-[9px] text-[#6B6F76] font-bold uppercase tracking-widest">{new Date(asset.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-10">
                        <span className="mono text-[10px] font-bold text-[#2B2D33] bg-[#F7F6F4] px-2 py-1 rounded">
                          {asset.watermarkId}
                        </span>
                      </td>
                      <td className="py-6 px-10">
                        <div className="flex items-center gap-2 text-green-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></div>
                          <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Active</span>
                        </div>
                      </td>
                      <td className="py-6 px-10 text-right">
                        <a href={asset.url} download className="text-[10px] font-bold text-[#6B6F76] hover:text-[#121317] underline transition-all">Export</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {verifications.length === 0 ? (
            <div className="hex-card p-40 text-center text-[#6B6F76] space-y-6 border-dashed">
              <div className="w-16 h-16 border border-black/5 rounded-2xl flex items-center justify-center mx-auto opacity-40">
                <Icons.Lock />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em]">No forensic logs yet</p>
            </div>
          ) : (
            <div className="hex-card overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#F7F6F4] text-[10px] text-[#6B6F76] font-bold uppercase tracking-[0.3em] border-b border-black/5">
                  <tr>
                    <th className="py-6 px-10">Scanned File</th>
                    <th className="py-6 px-10">Verdict</th>
                    <th className="py-6 px-10">Confidence</th>
                    <th className="py-6 px-10 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {verifications.map(log => (
                    <tr key={log.id} className="hover:bg-black/[0.01] transition-colors group">
                      <td className="py-6 px-10">
                        <div>
                          <p className="text-sm font-bold text-[#121317]">{log.fileName}</p>
                          <p className="text-[9px] text-[#6B6F76] font-bold uppercase tracking-widest">ID: {log.watermarkId || 'None'}</p>
                        </div>
                      </td>
                      <td className="py-6 px-10">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${
                          log.verdict === Verdict.VERIFIED ? 'bg-green-100 text-green-800' : 
                          log.verdict === Verdict.ALTERED ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {log.verdict}
                        </span>
                      </td>
                      <td className="py-6 px-10">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1 bg-black/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[#121317]" style={{ width: `${log.confidence * 100}%` }}></div>
                          </div>
                          <span className="text-[10px] font-bold text-[#121317]">{(log.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-6 px-10 text-right">
                        <p className="text-[10px] font-bold text-[#6B6F76]">{new Date(log.timestamp).toLocaleDateString()}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
