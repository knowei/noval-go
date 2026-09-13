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
    return await resp.json();
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

export async function fetchConversations(userId: string): Promise<ConversationSave[]> {
  try {
    const resp = await fetch(`/api/conversations?user_id=${encodeURIComponent(userId)}`);
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
    const resp = await fetch(`/api/conversations?id=${encodeURIComponent(id)}`);
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    return resp.ok;
  } catch (e) {
    return false;
  }
}

export async function fetchUserList(): Promise<UserProfile[]> {
  try {
    const resp = await fetch('/api/user/list');
    if (!resp.ok) return [];
    const data = await resp.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const resp = await fetch(`/api/user/profile?id=${encodeURIComponent(userId)}`);
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, ...settings })
    });
    return resp.ok;
  } catch (e) {
    return false;
  }
}
