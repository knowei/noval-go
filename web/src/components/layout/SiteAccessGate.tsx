"use client";

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { verifySitePasswordApi, checkSiteStatusApi } from '@/lib/api';
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck, Sparkles, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

interface SiteAccessGateProps {
  children: React.ReactNode;
}

export function SiteAccessGate({ children }: SiteAccessGateProps) {
  const { isSiteUnlocked, setIsSiteUnlocked } = useAppStore();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [hasCheckedInit, setHasCheckedInit] = useState(false);

  // 初始化检查客户端或服务端状态
  useEffect(() => {
    const localToken = typeof window !== 'undefined' ? localStorage.getItem('noval_site_access_token') : null;
    if (localToken) {
      setIsSiteUnlocked(true);
      setHasCheckedInit(true);
      return;
    }

    // 后端鉴权状态兜底探测
    checkSiteStatusApi().then((status) => {
      if (status.authenticated) {
        setIsSiteUnlocked(true);
      }
      setHasCheckedInit(true);
    }).catch(() => {
      setHasCheckedInit(true);
    });
  }, [setIsSiteUnlocked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('请输入站点访问密码');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await verifySitePasswordApi(password.trim());
      if (res.success) {
        setSuccessAnimation(true);
        setTimeout(() => {
          setIsSiteUnlocked(true);
          setPassword('');
          setErrorMsg('');
          setSuccessAnimation(false);
        }, 500);
      } else {
        setErrorMsg(res.error || '访问密码错误，请重新输入');
      }
    } catch (err: any) {
      setErrorMsg(err.message || '网络连接异常，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 若还在客户端挂载与 token 探针中，先展示暗黑背景占位避免闪烁
  if (!hasCheckedInit) {
    return (
      <div className="fixed inset-0 bg-[#0a0b10] flex items-center justify-center z-[99999]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 animate-pulse flex items-center justify-center text-white text-xs font-black shadow-lg shadow-rose-500/30">
            风月
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
            <span>正在校验站点安全环境...</span>
          </div>
        </div>
      </div>
    );
  }

  // 已解锁状态，正常渲染整个网站应用
  if (isSiteUnlocked) {
    return <>{children}</>;
  }

  // 未解锁状态：全屏高沉浸私密剧场门禁卡
  return (
    <div className="fixed inset-0 bg-[#090a0f] z-[99999] flex items-center justify-center p-4 overflow-y-auto selection:bg-rose-500/30 select-none">
      {/* 氛围背景装饰光源 */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[340px] bg-gradient-to-tr from-rose-600/15 via-purple-600/15 to-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-rose-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* 门禁核心主体卡片 */}
      <div className={`relative w-full max-w-md bg-[#13151f]/95 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-950/40 backdrop-blur-xl transition-all duration-500 ${
        successAnimation ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}>
        {/* 顶部发光微光线 */}
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

        {/* 标题徽章区 */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-600 flex items-center justify-center text-white shadow-xl shadow-rose-500/30 transform hover:scale-105 transition duration-300">
              <Lock className="w-8 h-8 text-white drop-shadow-md" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#13151f] flex items-center justify-center text-white text-[10px] shadow">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>NOVAL-GO · 私密剧场保护</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-gray-100 tracking-tight">
            请输入站点访问密码
          </h2>
          <p className="text-xs text-gray-400 mt-1.5 max-w-xs leading-relaxed">
            本站点已开启专属访问保护，仅允许持有通行码的授权访客进入使用。
          </p>
        </div>

        {/* 错误提示栏 */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 密码输入表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>访问通行密码</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                autoFocus
                placeholder="请输入站点访问通行码..."
                className="w-full bg-[#0d0e14] border border-[#2a2d3d] focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 rounded-xl px-3.5 py-3 text-sm text-gray-100 placeholder-gray-500 outline-none transition pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 解锁进入按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 hover:from-amber-400 hover:via-rose-400 hover:to-pink-400 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>正在校验通行码...</span>
              </>
            ) : (
              <>
                <span>解锁并进入剧场</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* 底部贴心提示 */}
        <div className="mt-6 pt-4 border-t border-[#1c1f2e] text-center">
          <p className="text-[11px] text-gray-500 leading-normal">
            💡 初始默认访问密码为：<code className="text-amber-400 font-mono bg-amber-400/10 px-1.5 py-0.5 rounded">888888</code>
          </p>
          <p className="text-[10px] text-gray-600 mt-1">
            （您可以在项目根目录的 <span className="font-mono text-gray-500">.env</span> 文件中修改 <span className="font-mono text-gray-500">SITE_PASSWORD</span>，或在系统设置中随时修改）
          </p>
        </div>
      </div>
    </div>
  );
}
