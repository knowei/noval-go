"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { loginApi, registerApi } from '@/lib/api';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { 
  User, 
  Lock, 
  LogIn, 
  LogOut, 
  UserPlus, 
  ShieldCheck, 
  Sparkles, 
  Palette, 
  HardDrive, 
  Settings, 
  ArrowLeft, 
  Check, 
  Loader2, 
  KeyRound, 
  Coins, 
  Zap, 
  CloudCheck,
  Laptop
} from 'lucide-react';

export default function ProfilePage() {
  const {
    currentUserId,
    currentUser,
    authToken,
    login,
    logout,
    setIsSettingsOpen,
    setIsDrawerOpen
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = !!authToken && !currentUserId.startsWith('guest_') && currentUserId !== 'default_user';

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
        setUsername('');
        setPassword('');
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
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setNickname('');
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
    if (window.confirm('确定要退出当前账号吗？退出后将切换为设备独立访客模式。')) {
      logout();
      setSuccessMsg('已安全退出登录，已切换为本地隔离访客');
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[var(--app-bg-main,#0c0d12)] text-[var(--app-text-main,#f1f5f9)] transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[var(--app-card-bg,#141622)]/90 backdrop-blur-md border-b border-[var(--app-card-border,#252836)] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--app-text-muted,#94a3b8)] hover:text-[var(--app-text-main,#f1f5f9)] transition flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">回到大厅</span>
          </Link>
          <div className="h-4 w-px bg-[var(--app-card-border,#252836)]" />
          <h1 className="font-bold text-base sm:text-lg flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500">
              <User className="w-4 h-4" />
            </span>
            <span>个人中心</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--app-text-muted,#94a3b8)] hover:text-[var(--app-text-main,#f1f5f9)] transition cursor-pointer"
            title="系统与模型设定"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Alerts */}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <span>❌</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Profile Hero Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--app-card-bg,#141622)] border border-[var(--app-card-border,#252836)] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-transparent blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-500 via-rose-500 to-purple-600 border-2 border-amber-300/40 flex items-center justify-center text-3xl sm:text-4xl shadow-xl shrink-0">
                  {currentUser?.avatar || '🎭'}
                </div>
                {isLoggedIn && (
                  <span className="absolute bottom-0 right-0 p-1 rounded-full bg-emerald-500 text-white text-[10px] shadow" title="已加密云端同步">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {currentUser?.nickname || currentUser?.username || '设备访客'}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    isLoggedIn
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30'
                      : 'bg-black/5 dark:bg-white/5 text-[var(--app-text-muted,#94a3b8)] border-[var(--app-card-border,#252836)]'
                  }`}>
                    {isLoggedIn ? 'VIP 认证执笔人' : '本地隔离访客'}
                  </span>
                </div>

                <div className="text-xs text-[var(--app-text-muted,#94a3b8)] flex items-center gap-3 flex-wrap">
                  <span>ID: <code className="font-mono">{currentUserId}</code></span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Laptop className="w-3.5 h-3.5 text-sky-400" />
                    <span>{isLoggedIn ? '多端云端存档实时同步' : '当前仅限本地浏览器隔离储存'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action: Log Out (if logged in) */}
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer self-stretch sm:self-auto justify-center"
              >
                <LogOut className="w-4 h-4" />
                <span>退出登录</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('auth-form-card');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer self-stretch sm:self-auto justify-center flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>立即登录 / 注册</span>
              </button>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[var(--app-card-border,#252836)] text-center">
            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--app-card-border,#252836)]">
              <div className="text-[11px] text-[var(--app-text-muted,#94a3b8)] flex items-center justify-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>点数能量</span>
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-amber-500 mt-1">
                {(currentUser as any)?.points || '9,999'}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--app-card-border,#252836)]">
              <div className="text-[11px] text-[var(--app-text-muted,#94a3b8)] flex items-center justify-center gap-1">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>文思算力</span>
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-purple-500 dark:text-purple-300 mt-1">
                无限畅享
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--app-card-border,#252836)]">
              <div className="text-[11px] text-[var(--app-text-muted,#94a3b8)] flex items-center justify-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                <span>存档状态</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-300 mt-1">
                {isLoggedIn ? '云端加密' : '本地存储'}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--app-card-border,#252836)]">
              <div className="text-[11px] text-[var(--app-text-muted,#94a3b8)] flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>隐私防护</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-sky-600 dark:text-sky-300 mt-1">
                设备隔离
              </div>
            </div>
          </div>
        </div>

        {/* 2. Login / Register Form (when guest or switching) */}
        {!isLoggedIn ? (
          <div id="auth-form-card" className="p-6 sm:p-8 rounded-3xl bg-[var(--app-card-bg,#141622)] border border-[var(--app-card-border,#252836)] shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--app-card-border,#252836)] pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">执笔人身份绑定</h3>
                  <p className="text-xs text-[var(--app-text-muted,#94a3b8)]">登录后可在手机、平板、电脑间无缝同步多角色剧情存档</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex rounded-xl bg-black/5 dark:bg-white/5 p-1 border border-[var(--app-card-border,#252836)]">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'text-[var(--app-text-muted,#94a3b8)] hover:text-[var(--app-text-main,#f1f5f9)]'
                  }`}
                >
                  账号登录
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'text-[var(--app-text-muted,#94a3b8)] hover:text-[var(--app-text-main,#f1f5f9)]'
                  }`}
                >
                  注册新号
                </button>
              </div>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4 max-w-lg">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--app-text-muted,#94a3b8)]">账号 / 用户名</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="输入用户名"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--app-card-border,#252836)] focus:border-amber-500 text-sm outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--app-text-muted,#94a3b8)]">登录密码</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="输入密码"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--app-card-border,#252836)] focus:border-amber-500 text-sm outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  <span>{loading ? '正在验证账号...' : '立即登录并同步'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4 max-w-lg">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--app-text-muted,#94a3b8)]">账号 / 用户名</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="设置唯一用户名（英文/数字）"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--app-card-border,#252836)] focus:border-amber-500 text-sm outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--app-text-muted,#94a3b8)]">执笔人昵称（选填）</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="显示在剧场中的称谓"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--app-card-border,#252836)] focus:border-amber-500 text-sm outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[var(--app-text-muted,#94a3b8)]">设置密码</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="至少 3 位字符"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--app-card-border,#252836)] focus:border-amber-500 text-sm outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[var(--app-text-muted,#94a3b8)]">确认密码</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="再次输入相同密码"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--app-card-border,#252836)] focus:border-amber-500 text-sm outline-none transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>{loading ? '正在创建账号...' : '创建账号并开启多端漫游'}</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Account Settings & Quick Navigation */
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--app-card-bg,#141622)] border border-[var(--app-card-border,#252836)] shadow-xl space-y-6">
            <div className="flex items-center gap-2 border-b border-[var(--app-card-border,#252836)] pb-4">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base">账号安全与云端服务</h3>
                <p className="text-xs text-[var(--app-text-muted,#94a3b8)]">您的私密剧情和自定义角色数据已通过端到端加密云备份</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--app-card-border,#252836)] space-y-2">
                <span className="text-xs font-bold text-[var(--app-text-main,#f1f5f9)] flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-amber-500" />
                  <span>剧情存档管理</span>
                </span>
                <p className="text-xs text-[var(--app-text-muted,#94a3b8)]">
                  随时查看或回溯已创作的剧情存档分支，或一键导出为离线文本。
                </p>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-medium transition cursor-pointer"
                >
                  打开存档抽屉
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--app-card-border,#252836)] space-y-2">
                <span className="text-xs font-bold text-[var(--app-text-main,#f1f5f9)] flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-purple-400" />
                  <span>AI 推演引擎配置</span>
                </span>
                <p className="text-xs text-[var(--app-text-muted,#94a3b8)]">
                  自定义接入 DeepSeek, SiliconFlow, OpenAI 或本地大模型 API。
                </p>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-xs font-medium transition cursor-pointer"
                >
                  配置模型接入
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Theme & Preferences Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--app-card-bg,#141622)] border border-[var(--app-card-border,#252836)] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-pink-500/10 text-pink-500 border border-pink-500/30">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base">视觉主题与显示偏好</h3>
                <p className="text-xs text-[var(--app-text-muted,#94a3b8)]">切换深色沉浸、清爽蓝白或浪漫樱花粉主题风格</p>
              </div>
            </div>

            <ThemeToggle />
          </div>
        </div>
      </main>
    </div>
  );
}
