import { PlazaCard, StoryDeck, ConversationSave, UserProfile, ModelSettings, Turn } from './types';
import { readPrivateCards } from './cardImport';

export async function fetchPlazaFeatured(keyword: string = ''): Promise<PlazaCard[]> {
  try {
    const url = keyword ? `/api/plaza/featured?keyword=${encodeURIComponent(keyword)}` : '/api/plaza/featured';
    const resp = await fetch(url);
    if (!resp.ok) return [];
    return await resp.json();
  } catch (e) {
    console.error('Error fetching plaza featured:', e);
    return [];
  }
}

export async function fetchPlazaCategories(): Promise<string[]> {
  try {
    const resp = await fetch('/api/plaza/categories');
    if (!resp.ok) return ['全部', '都市', '科幻', '同人', '恋爱', '玄幻', '悬疑'];
    const data = await resp.json();
    if (Array.isArray(data)) {
      return data
        .map((item: any) => (typeof item === 'string' ? item : item.name || item.title || ''))
        .filter(Boolean);
    }
    return ['全部', '都市', '科幻', '同人', '恋爱', '玄幻', '悬疑'];
  } catch (e) {
    return ['全部', '都市', '科幻', '同人', '恋爱', '玄幻', '悬疑'];
  }
}

export async function fetchStory(id: string): Promise<StoryDeck | null> {
  try {
    if (id.startsWith('local_') && typeof localStorage !== 'undefined') {
      const user = localStorage.getItem('rp_current_user_id') || localStorage.getItem('noval_user_id') || '';
      const local = readPrivateCards(user).find(card => card.id === id);
      if (local) return local;
      if (!getAuthToken()) return null;
      return (await fetchPrivateCards(id)).find(card => !card.deleted)?.deck || null;
    }
    const resp = await fetch(`/api/stories?id=${encodeURIComponent(id)}`);
    if (!resp.ok) return null;
    return await resp.json();
  } catch (e) {
    console.error('Error fetching story:', e);
    return null;
  }
}

export interface PrivateCardRecord { id: string; deck: StoryDeck; revision: number; deleted: boolean; updated_at: string }
export async function fetchPrivateCards(id?: string): Promise<PrivateCardRecord[]> {
  const response = await fetch('/api/private-cards' + (id ? `?id=${encodeURIComponent(id)}` : ''), { headers: getAuthHeaders() });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '无法读取云端角色卡');
  if (!Array.isArray(data)) throw new Error('云端角色卡格式无效');
  return data;
}
export async function updatePrivateCard(id: string, revision: number, action: 'save' | 'trash' | 'restore', deck?: StoryDeck): Promise<PrivateCardRecord> {
  const response = await fetch('/api/private-cards', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ id, revision, action, deck }) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '云端保存失败');
  return data;
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('rp_auth_token');
}

export function getSiteToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('noval_site_access_token');
  } catch {
    return null;
  }
}

export function setSiteToken(token: string) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('noval_site_access_token', token);
    } catch {}
    try {
      document.cookie = `site_access_token=${token}; path=/; max-age=2592000; SameSite=Lax`;
    } catch {}
  }
}

export function clearSiteToken() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('noval_site_access_token');
    } catch {}
    try {
      document.cookie = `site_access_token=; path=/; max-age=0; SameSite=Lax`;
    } catch {}
  }
}

async function safeParseJson<T = any>(resp: Response): Promise<{ ok: boolean; data?: T; error?: string }> {
  const text = await resp.text();
  try {
    const data = JSON.parse(text);
    return { ok: true, data };
  } catch {
    if (!resp.ok) {
      return {
        ok: false,
        error: '后端服务未响应 (HTTP ' + resp.status + ')，请检查服务器 Python 后端 (server.py) 是否正常启动'
      };
    }
    return { ok: false, error: '服务返回了无法解析的数据，请刷新后重试' };
  }
}

export async function verifySitePasswordApi(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const resp = await fetch('/api/auth/site-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const parsed = await safeParseJson(resp);
    if (!parsed.ok) {
      return { success: false, error: parsed.error };
    }
    const data = parsed.data;
    if (!resp.ok || !data?.success) {
      return { success: false, error: data?.error || '访问密码错误，请重新输入' };
    }
    if (data.token) {
      setSiteToken(data.token);
    }
    return { success: true, token: data.token };
  } catch (e: any) {
    return { success: false, error: e.message || '网络连接异常' };
  }
}

export async function checkSiteStatusApi(): Promise<{ isProtected: boolean; authenticated: boolean }> {
  try {
    const token = getSiteToken();
    const headers: Record<string, string> = {};
    if (token) headers['X-Site-Token'] = token;

    // 保护性快速超时：防止移动端弱网或环境阻断时死等卡在初始化加载
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const resp = await fetch('/api/auth/site-status', {
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!resp.ok) return { isProtected: true, authenticated: false };
    return await resp.json();
  } catch {
    return { isProtected: true, authenticated: !!getSiteToken() };
  }
}

export async function changeSitePasswordApi(oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const resp = await fetch('/api/auth/site-change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword })
    });
    const data = await resp.json();
    if (!resp.ok || !data.success) {
      return { success: false, error: data.error || '修改密码失败' };
    }
    if (data.token) {
      setSiteToken(data.token);
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || '网络连接异常' };
  }
}

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const siteToken = getSiteToken();
  if (siteToken) {
    headers['X-Site-Token'] = siteToken;
  }
  return headers;
}

export async function loginApi(username: string, password: string): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  try {
    const resp = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await resp.json();
    if (!resp.ok) {
      return { success: false, error: data.error || '登录失败' };
    }
    return data;
  } catch (e: any) {
    return { success: false, error: e.message || '网络请求异常' };
  }
}

export async function registerApi(username: string, password: string, nickname?: string): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  try {
    const resp = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, nickname })
    });
    const data = await resp.json();
    if (!resp.ok) {
      return { success: false, error: data.error || '注册失败' };
    }
    return data;
  } catch (e: any) {
    return { success: false, error: e.message || '网络请求异常' };
  }
}

export async function fetchConversations(userId: string): Promise<ConversationSave[]> {
  try {
    const resp = await fetch(`/api/conversations?user_id=${encodeURIComponent(userId)}`, {
      headers: getAuthHeaders()
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Error fetching conversations:', e);
    return [];
  }
}

export async function fetchConversation(id: string): Promise<ConversationSave | null> {
  try {
    const resp = await fetch(`/api/conversations?id=${encodeURIComponent(id)}`, {
      headers: getAuthHeaders()
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data && Array.isArray(data.history)) {
      data.history = data.history.filter((t: any) => Boolean(t && typeof t === 'object'));
    }
    return data;
  } catch (e) {
    return null;
  }
}

export async function saveConversation(payload: {
  id: string;
  user_id: string;
  deck_id: string;
  deck_title: string;
  title: string;
  history: Turn[];
}): Promise<boolean> {
  try {
    const cleanPayload = {
      ...payload,
      history: Array.isArray(payload.history)
        ? payload.history.filter((t) => Boolean(t && typeof t === 'object'))
        : []
    };
    const resp = await fetch('/api/conversations', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(cleanPayload)
    });
    return resp.ok;
  } catch (e) {
    return false;
  }
}

export async function deleteConversation(id: string): Promise<boolean> {
  try {
    const resp = await fetch('/api/conversations/delete', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id })
    });
    return resp.ok;
  } catch (e) {
    return false;
  }
}

export async function fetchUserList(): Promise<UserProfile[]> {
  try {
    const resp = await fetch('/api/user/list', {
      headers: getAuthHeaders()
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const resp = await fetch(`/api/user/profile?user_id=${encodeURIComponent(userId)}`, {
      headers: getAuthHeaders()
    });
    if (!resp.ok) return null;
    return await resp.json();
  } catch (e) {
    return null;
  }
}

export async function saveModelSettings(userId: string, settings: ModelSettings): Promise<boolean> {
  try {
    const resp = await fetch('/api/user/model-settings', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        user_id: userId,
        model_config: {
          api_model: settings.model,
          api_base: settings.baseUrl,
          api_key: settings.apiKey,
          roleplay_mode: settings.roleplayMode,
          temperature: settings.temperature,
          top_p: settings.topP
        }
      })
    });
    return resp.ok;
  } catch (e) {
    return false;
  }
}

export async function smartFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const siteToken = getSiteToken();
  try {
    const resp = await fetch(url, options);
    return resp;
  } catch (err) {
    const proxyUrl = `/proxy?target=${encodeURIComponent(url)}`;
    const mergedHeaders = new Headers(options.headers || {});
    if (siteToken && !mergedHeaders.has('x-site-token')) {
      mergedHeaders.set('x-site-token', siteToken);
    }
    try {
      const proxyResp = await fetch(proxyUrl, {
        ...options,
        headers: mergedHeaders
      });
      return proxyResp;
    } catch (proxyErr: any) {
      throw new Error(`直连与代理均失败: ${proxyErr?.message || proxyErr}`);
    }
  }
}

export async function testModelConnection(
  baseUrl: string,
  apiKey: string,
  model: string
): Promise<{ success: boolean; latencyMs: number; reply?: string; error?: string }> {
  const cleanUrl = baseUrl.trim().replace(/\/+$/, '');
  const startTime = Date.now();
  try {
    const resp = await smartFetch(`${cleanUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: model.trim(),
        messages: [{ role: 'user', content: 'Hi, please reply OK.' }],
        max_tokens: 30,
        temperature: 0.1
      })
    });

    let data: any = {};
    try {
      data = await resp.json();
    } catch {
      const txt = await resp.text();
      data = { error: { message: txt || resp.statusText } };
    }

    const latencyMs = Date.now() - startTime;
    if (resp.ok && data.choices && data.choices[0]) {
      const reply = (data.choices[0].message?.content || '').trim();
      return { success: true, latencyMs, reply: reply || 'OK' };
    } else {
      return {
        success: false,
        latencyMs,
        error: data?.error?.message || resp.statusText || '请求失败'
      };
    }
  } catch (err: any) {
    return {
      success: false,
      latencyMs: Date.now() - startTime,
      error: err.message || '网络连接异常'
    };
  }
}

export async function fetchRemoteModels(baseUrl: string, apiKey: string): Promise<string[]> {
  const cleanUrl = baseUrl.trim().replace(/\/+$/, '');
  const resp = await smartFetch(`${cleanUrl}/models`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    }
  });
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
  }
  const data = await resp.json();
  const list = (data.data || data || []).map((m: any) => m.id || m.name || m);
  return list.filter((m: any) => typeof m === 'string' && m.length > 0);
}
