"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { saveModelSettings } from '@/lib/api';
import { X, Check, Cpu, Key, Globe, Sliders } from 'lucide-react';

const PRESET_MODELS = [
  { name: 'deepseek-v3.2', label: 'DeepSeek V3 (沉浸文学推荐)', desc: '文学描写极具张力，心理反差解析力拔群' },
  { name: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet (高逻辑对峙)', desc: '超强常识与情景推演，极度真实自然' },
  { name: 'gpt-4o', label: 'GPT-4o (全能旗舰)', desc: '多角色节奏掌控稳定' },
  { name: 'qwen-max', label: '通义千问 Qwen-Max', desc: '中文地道成语与中式网文张力' }
];

export function ModelSettingsModal() {
  const { isSettingsOpen, setIsSettingsOpen, modelSettings, setModelSettings, currentUserId } = useAppStore();
  
  const [model, setModel] = useState(modelSettings.model || 'deepseek-v3.2');
  const [baseUrl, setBaseUrl] = useState(modelSettings.baseUrl || 'https://api.openai.com/v1');
  const [apiKey, setApiKey] = useState(modelSettings.apiKey || '');
  const [temperature, setTemperature] = useState(modelSettings.temperature ?? 0.85);

  if (!isSettingsOpen) return null;

  const handleSave = async () => {
    const updated = { model, baseUrl, apiKey, temperature };
    setModelSettings(updated);
    await saveModelSettings(currentUserId, updated);
    setIsSettingsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[#161720] border border-[#2b2e3c] rounded-2xl p-6 shadow-2xl text-gray-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#252836] pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base text-gray-100">AI 推演模型与接口配置</h2>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 rounded-lg hover:bg-[#222532] text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Model Presets */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
            <span>选择核心模型</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_MODELS.map((m) => (
              <div
                key={m.name}
                onClick={() => setModel(m.name)}
                className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  model === m.name
                    ? 'border-amber-500 bg-amber-500/10 text-amber-200'
                    : 'border-[#262836] bg-[#1a1b25] hover:border-gray-600 text-gray-300'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>{m.name}</span>
                  {model === m.name && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <div className="text-[10px] text-gray-400 mt-1 leading-normal">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Inputs */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-gray-400 mb-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>Base URL (API 接入点)</span>
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1b25] border border-[#2b2e3c] focus:border-amber-500 text-gray-100 outline-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-rose-400" />
              <span>API Key</span>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1b25] border border-[#2b2e3c] focus:border-amber-500 text-gray-100 outline-none font-mono text-xs"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-gray-400 mb-1">
              <span className="flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>文学温度 (Temperature)</span>
              </span>
              <span className="font-mono text-amber-300">{temperature}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.5"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#252836] flex items-center justify-end gap-2">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-2 rounded-xl bg-[#20222e] hover:bg-[#282a3a] text-gray-300 text-xs transition cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-stone-900 font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            保存并生效
          </button>
        </div>
      </div>
    </div>
  );
}
