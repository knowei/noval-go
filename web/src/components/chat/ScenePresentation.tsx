'use client';
import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { resolveSnapshot } from '@/lib/sessionEngine';
import { activeSceneAssets } from '@/lib/mediaRuntime';

export function ScenePresentation() {
  const { sessionSettings, conversationHistory, currentConversationId } = useAppStore();
  const media = sessionSettings.media;
  const assets = activeSceneAssets(media, resolveSnapshot(conversationHistory).state);
  const musicUrl = assets.music?.url;
  const latest = [...conversationHistory].reverse().find(t => !t.isUser && !t.incomplete && !t.isError);
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    const player = audio.current;
    if (!player) return;
    player.volume = media.volume;
    if (playing && musicUrl) void player.play().catch(() => { setPlaying(false); setMessage('请点击播放音乐，或检查素材地址。'); });
    else player.pause();
  }, [musicUrl, media.volume, playing]);
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, [currentConversationId, latest]);
  const speak = () => {
    const synthesis = window.speechSynthesis;
    if (!synthesis) { setMessage('此浏览器不支持语音朗读。'); return; }
    const voices = synthesis.getVoices().filter(v => v.localService);
    const voice = voices.find(v => v.lang.startsWith('zh')) || voices[0];
    if (!voice) { setMessage('没有可用的本机声音，请安装系统语音包后重试。'); return; }
    synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance((latest?.displayText || latest?.story || latest?.text || '').replace(/<[^>]+>/g, '').slice(0, 10000));
    utterance.voice = voice; utterance.lang = voice.lang;
    utterance.onerror = () => setMessage('朗读中断，可重试。');
    synthesis.speak(utterance); setMessage('正在朗读最近回复。');
  };
  if (!media.enabled && !media.speech) return null;
  return <section aria-label="场景视听" className="space-y-2 rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-200">
    {(assets.background || assets.portrait) && <div className="relative flex h-48 items-end justify-center overflow-hidden rounded-lg bg-slate-950">
      {assets.background && <img src={assets.background.url} alt={assets.background.label} referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />}
      {assets.portrait && <img src={assets.portrait.url} alt={assets.portrait.label} referrerPolicy="no-referrer" className="relative h-full max-w-full object-contain" />}
    </div>}
    <div className="flex flex-wrap gap-3 text-sm">
      {assets.music && <><audio ref={audio} src={assets.music.url} loop preload="none" onError={() => { setPlaying(false); setMessage('音乐加载失败，请检查素材地址。'); }} /><button onClick={() => { setMessage(''); setPlaying(v => !v); }}>{playing ? '暂停音乐' : `播放音乐 · ${assets.music.label}`}</button></>}
      {media.speech && <><button disabled={!latest} onClick={speak}>朗读最近回复</button><button onClick={() => { window.speechSynthesis?.cancel(); setMessage('朗读已停止。'); }}>停止朗读</button></>}
    </div>
    {!assets.portrait && !assets.background && !assets.music && media.enabled && <p className="text-xs text-slate-400">当前状态未匹配素材，可在工作台“视听”配置。</p>}
    {message && <p role="status" className="text-xs text-sky-200">{message}</p>}
  </section>;
}
