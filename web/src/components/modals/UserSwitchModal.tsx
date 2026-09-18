"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { loginApi, registerApi } from '@/lib/api';
import { User, X, Check, Lock, LogIn, UserPlus, LogOut, ShieldCheck, Sparkles, Loader2, KeyRound } from 'lucide-react';

export function UserSwitchModal() {
  const {
    isUserSwitchOpen,
    setIsUserSwitchOpen,
    currentUserId,
    currentUser,
    authToken,
    login,
    logout
  } = useAppStore();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isUserSwitchOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('请填写完整的账号与密码');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await loginApi(username.trim(), password);
      if (res.success && res.token && res.user) {
        login(res.user, res.token);
        setSuccessMsg(`欢迎回来，${res.user.nickname || res.user.username}！`);
        setTimeout(() => {
          setIsUserSwitchOpen(false);
          setUsername('');
          setPassword('');
          setSuccessMsg('');
        }, 800);
      } else {
        setErrorMsg(res.error || '登录失败，请检查账号或密码');
      }
    } catch (err: any) {
      setErrorMsg(err.message || '网络连接异常');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('请填写账号与密码');
      return;
    }
    if (password.length < 3) {
      setErrorMsg('密码长度建议至少 3 位字符');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('两次输入的密码不一致');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await registerApi(username.trim(), password, nickname.trim() || username.trim());
      if (res.success && res.token && res.user) {
        login(res.user, res.token);
        setSuccessMsg(`注册并登录成功！你好，${res.user.nickname || res.user.username}`);
        setTimeout(() => {
          setIsUserSwitchOpen(false);
          setUsername('');
          setPassword('');
          setConfirmPassword('');
          setNickname('');
          setSuccessMsg('');
        }, 800);
      } else {
        setErrorMsg(res.error || '注册失败，该账号可能已被占用');
      }
    } catch (err: any) {
      setErrorMsg(err.message || '网络连接异常');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setSuccessMsg('已安全退出登录，已切换为全新设备隔离访客');
    setTimeout(() => {
      setSuccessMsg('');
    }, 1500);
  };

  const isLoggedIn = !!authToken && !currentUserId.startsWith('guest_') && currentUserId !== 'default_user';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#151620] border border-[#2b2e3e] rounded-3xl p-6 shadow-2xl text-gray-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#252836] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-gray-100">执笔账号与安全中心</h2>
              <p className="text-[11px] text-gray-400">多设备剧本存档同步与密码隐私加锁</p>
            </div>
          </div>
          <button
            onClick={() => setIsUserSwitchOpen(false)}
            className="p-1.5 rounded-xl hover:bg-[#222532] text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Card */}
        {isLoggedIn ? (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#181a26] to-[#161722] border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500 via-rose-500 to-purple-600 border border-amber-300/40 flex items-center justify-center text-lg shadow-lg">
                  {currentUser?.avatar || '🎭'}
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-100 flex items-center gap-1.5">
                    <span>{currentUser?.nickname || currentUser?.username}</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                      VIP执笔者
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">@{currentUser?.username}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-amber-400 font-bold font-mono flex items-center gap-1">
                  <span>💎</span>
                  <span>{currentUser?.points?.toLocaleString() || '9,999'}</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>已认证会话</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#222536] text-[11px] text-gray-400 flex items-start gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>您的推演记录与自定义模型密钥已与私有账号绑定，享有云端密码加密防护。</span>
            </div>

            <div className="pt-1 flex gap-2">
              <button
                onClick={handleLogout}
                className="w-full py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 hover:text-red-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>退出登录 (恢复为纯设备访客)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-[#181a26] border border-amber-500/25 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-bold text-amber-300">当前身份: 设备物理隔离访客</span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">{currentUserId.slice(0, 14)}...</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              当前为未登录的设备独立空间。您的对话存档与 API Key 仅保存在本机浏览器中，其他任何访客均无法查看或共用。登录或注册账号可在多设备同步云端存档。
            </p>
          </div>
        )}

        {/* If Not Logged In: Login & Register Tabs */}
        {!isLoggedIn && (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex p-1 bg-[#111218] rounded-xl border border-[#242636]">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-[#232638] text-amber-300 shadow-sm border border-amber-500/30'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>登录账号</span>
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-[#232638] text-pink-300 shadow-sm border border-pink-500/30'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>注册新账号</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-3">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">账号用户名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入您的账号 (英文/字母/拼音)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#191a26] border border-[#2c2e3e] focus:border-amber-500 text-gray-100 outline-none text-xs"
                  required
                />
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">个性昵称 (选填)</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="如: 纯爱战神 / 幕后黑手"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#191a26] border border-[#2c2e3e] focus:border-pink-500 text-gray-100 outline-none text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">登录密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#191a26] border border-[#2c2e3e] focus:border-amber-500 text-gray-100 outline-none text-xs"
                  required
                />
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">确认密码</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入密码"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#191a26] border border-[#2c2e3e] focus:border-pink-500 text-gray-100 outline-none text-xs"
                    required
                  />
                </div>
              )}

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-lg shadow-amber-900/30'
                    : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg shadow-pink-900/30'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>正在验证中...</span>
                  </>
                ) : authMode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>验证密码并登录</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>立即注册并登录</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
