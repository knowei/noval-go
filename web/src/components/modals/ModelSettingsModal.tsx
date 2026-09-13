"use client";

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { saveModelSettings } from '@/lib/api';
import { X, Check, Cpu, Key, Globe, Sliders, Zap } from 'lucide-react';

const PRESET_MODELS = [
  { name: 'deepseek-flash', label: 'DeepSeek Flash (极速极简推荐)', desc: '毫秒级响应，超低消耗，风月默认高频引擎', provider: 'deepseek' },
  { name: 'deepseek-chat', label: 'DeepSeek V3 (沉浸文学推荐)', desc: '文学描写极具张力，多轨心理反差解析力拔群', provider: 'deepseek' },
  { name: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet (顶级推演)', desc: '超强常识与情景推演，极度真实自然', provider: 'anthropic' },
  { name: 'gpt-4o', label: 'GPT-4o (全能旗舰)', desc: '多角色节奏掌控稳定，情境推进流畅', provider: 'openai' },
  { name: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', desc: '百万超长上下文，记忆承载力极高', provider: 'google' },
  { name: 'qwen-max', label: '通义千问 Qwen-Max', desc: '中文地道成语与中式网文张力', provider: 'qwen' }
];

export function ModelSettingsModal() {
  const { isSettingsOpen, setIsSettingsOpen, modelSettings, setModelSettings, currentUserId } = useAppStore();
  
  const [model, setModel] = useState(modelSettings.model || 'deepseek-flash');
  const [baseUrl, setBaseUrl] = useState(modelSettings.baseUrl || 'https://api.deepseek.com/v1');
  const [apiKey, setApiKey] = useState(modelSettings.apiKey || '');
  const [temperature, setTemperature] = useState(modelSettings.temperature ?? 0.85);

  useEffect(() => {
    if (isSettingsOpen) {
      setModel(modelSettings.model || 'deepseek-flash');
      setBaseUrl(modelSettings.baseUrl || 'https://api.deepseek.com/v1');
      setApiKey(modelSettings.apiKey || '');
      setTemperature(modelSettings.temperature ?? 0.85);
    }
  }, [isSettingsOpen, modelSettings]);

  if (!isSettingsOpen) return null;

  const handleSelectPreset = (preset: typeof PRESET_MODELS[0]) => {
    setModel(preset.name);
    if (preset.provider === 'deepseek' && !baseUrl.includes('deepseek')) {
      setBaseUrl('https://api.deepseek.com/v1');
    }
  };

  const handleSave = async () => {
    const updated = { model, baseUrl, apiKey, temperature };
    setModelSettings(updated);
    await saveModelSettings(currentUserId, updated);
    setIsSettingsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[#161720] border border-[#2b2e3c] rounded-2xl p-6 shadow-2xl text-gray-200 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#252836] pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-bold text-base text-gray-100">AI 推演模型与接口配置</h2>
              <p className="text-[11px] text-gray-400">随时切换推演大模型或配置自定义 API 密钥</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 rounded-lg hover:bg-[#222532] text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Provider Chips */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="text-gray-400 text-[11px]">快捷预设:</span>
          <button
            type="button"
            onClick={() => {
              setBaseUrl('https://api.deepseek.com/v1');
              setModel('deepseek-flash');
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 text-[11px] transition"
          >
            ⚡ DeepSeek 官方
          </button>
          <button
            type="button"
            onClick={() => {
              setBaseUrl('https://api.siliconflow.cn/v1');
              setModel('deepseek-ai/DeepSeek-V3');
            }}
            className="px-2.5 py-1 rounded-lg bg-sky-950/40 border border-sky-500/40 text-sky-300 hover:bg-sky-900/60 text-[11px] transition"
          >
            🌊 硅基流动
          </button>
          <button
            type="button"
            onClick={() => {
              setBaseUrl('https://api.openai.com/v1');
              setModel('gpt-4o');
            }}
            className="px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-500/40 text-purple-300 hover:bg-purple-900/60 text-[11px] transition"
          >
            🌐 OpenAI 官方
          </button>
        </div>

        {/* Model Presets */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
            <span>选择核心大模型</span>
            <span className="text-[11px] text-amber-400 font-mono">当前: {model}</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_MODELS.map((m) => (
              <div
                key={m.name}
                onClick={() => handleSelectPreset(m)}
                className={`p-2.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  model === m.name
                    ? 'border-amber-500 bg-amber-500/15 text-amber-200 shadow-md shadow-amber-500/10'
                    : 'border-[#262836] bg-[#1a1b25] hover:border-gray-600 text-gray-300'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span className="truncate">{m.label}</span>
                  {model === m.name && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />}
                </div>
                <div className="text-[10px] text-gray-400 mt-1 leading-relaxed">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Name Input */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>模型标识符 (Model ID，可手动修改任意模型)</span>
          </label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="deepseek-flash / gpt-4o / claude-3-5-sonnet"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1b25] border border-[#2b2e3c] focus:border-amber-500 text-gray-100 outline-none font-mono text-xs"
          />
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
