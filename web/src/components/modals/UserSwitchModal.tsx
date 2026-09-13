"use client";

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { fetchUserList, fetchUserProfile } from '@/lib/api';
import { User, X, Check, UserPlus } from 'lucide-react';

export function UserSwitchModal() {
  const { isUserSwitchOpen, setIsUserSwitchOpen, currentUserId, setCurrentUserId, setCurrentUser } = useAppStore();
  const [users, setUsers] = useState<any[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newNickname, setNewNickname] = useState('');

  useEffect(() => {
    if (isUserSwitchOpen) {
      fetchUserList().then(setUsers);
    }
  }, [isUserSwitchOpen]);

  if (!isUserSwitchOpen) return null;

  const handleSelectUser = async (uId: string) => {
    setCurrentUserId(uId);
    const profile = await fetchUserProfile(uId);
    if (profile) setCurrentUser(profile);
    setIsUserSwitchOpen(false);
  };

  const handleCreateUser = async () => {
    if (!newUsername.trim()) return;
    try {
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: '123',
          nickname: newNickname.trim() || newUsername.trim()
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        setNewUsername('');
        setNewNickname('');
        const list = await fetchUserList();
        setUsers(list);
        if (data.user?.id) {
          handleSelectUser(data.user.id);
        }
      }
    } catch (e) {
      console.error('Create user error:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#161720] border border-[#2b2e3c] rounded-2xl p-6 shadow-2xl text-gray-200 space-y-5">
        <div className="flex items-center justify-between border-b border-[#252836] pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            <h2 className="font-bold text-base text-gray-100">切换 / 管理执笔者账号</h2>
          </div>
          <button
            onClick={() => setIsUserSwitchOpen(false)}
            className="p-1 rounded-lg hover:bg-[#222532] text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Existing Users */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {users.map((u) => {
            const isCurrent = u.id === currentUserId;
            return (
              <div
                key={u.id}
                onClick={() => handleSelectUser(u.id)}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  isCurrent
                    ? 'border-purple-500 bg-purple-500/15 text-purple-200'
                    : 'border-[#262836] bg-[#1a1b25] hover:border-gray-600 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-sm">
                    {u.avatar || '👤'}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-gray-100">{u.nickname || u.username}</div>
                    <div className="text-[10px] text-gray-400 font-mono">@{u.username}</div>
                  </div>
                </div>
                {isCurrent && <Check className="w-4 h-4 text-purple-400" />}
              </div>
            );
          })}
        </div>

        {/* Create New User */}
        <div className="pt-3 border-t border-[#252836] space-y-2.5">
          <div className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-pink-400" />
            <span>添加新角色/读者账号</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="账号ID (英文/拼音)"
              className="px-3 py-2 rounded-xl bg-[#1a1b25] border border-[#2b2e3c] focus:border-purple-500 text-gray-100 outline-none text-xs"
            />
            <input
              type="text"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              placeholder="昵称 (如: 纯爱战神)"
              className="px-3 py-2 rounded-xl bg-[#1a1b25] border border-[#2b2e3c] focus:border-purple-500 text-gray-100 outline-none text-xs"
            />
          </div>
          <button
            onClick={handleCreateUser}
            className="w-full py-2 rounded-xl bg-[#232033] hover:bg-[#2d2844] border border-purple-500/40 text-purple-300 hover:text-purple-200 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>+ 注册并切换至该用户</span>
          </button>
        </div>
      </div>
    </div>
  );
}
