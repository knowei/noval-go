import { PlazaCard, StoryDeck, ConversationSave, UserProfile, ModelSettings, Turn } from './types';

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
    const resp = await fetch(`/api/stories?id=${encodeURIComponent(id)}`);
    if (!resp.ok) return null;
    return await resp.json();
  } catch (e) {
    console.error('Error fetching story:', e);
    return null;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('rp_auth_token');
}

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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
    return await resp.json();
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
    const resp = await fetch('/api/conversations', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
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
  try {
    const resp = await fetch(url, options);
    return resp;
  } catch (err) {
    const proxyUrl = `/proxy?target=${encodeURIComponent(url)}`;
    try {
      const proxyResp = await fetch(proxyUrl, options);
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
