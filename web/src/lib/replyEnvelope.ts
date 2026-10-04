/** Separate protocol data from visible prose without attempting to repair JSON. */
export function inspectReplyEnvelope(raw: string, requireEndMarker = false) {
  const hasEndMarker = /<reply_end\s*\/>\s*$/i.test(raw);
  const blocks: { tag: string; content: string }[] = [];
  let story = raw.replace(/<reply_end\s*\/>/gi, '').replace(/<(state|memory|options)\s*>([\s\S]*?)<\/\1\s*>/gi, (_, tag: string, content: string) => {
    blocks.push({ tag: tag.toLowerCase(), content });
    return '';
  });
  const unclosed = /<(state|memory|options)\s*>/i.exec(story);
  let incomplete = Boolean(unclosed);
  if (unclosed) story = story.slice(0, unclosed.index);
  // A network chunk can end in the middle of the protocol tag itself.
  const partial = /<\/?([a-z_]+)\/?\s*$/i.exec(story);
  if (partial && partial[1].length >= 2 && ['state', 'memory', 'options', 'reply_end'].some(tag => tag.startsWith(partial[1].toLowerCase()))) {
    incomplete = true;
    story = story.slice(0, partial.index);
  }
  // Older replies lack a protocol version. Flag suspicious prose conservatively,
  // without declaring every unpunctuated short reply to be truncated.
  const prose = story.trim();
  const suspected = !hasEndMarker && !blocks.length && prose.length >= 120 && !/[。！？.!?…][”」』\u0022\u0027）)\]*_\s]*$/.test(prose);
  return { story: prose, blocks, incomplete: incomplete || requireEndMarker && !hasEndMarker, malformed: incomplete, hasEndMarker, suspected };
}

export function mergeReplyContinuation(prefix: string, suffix: string) {
  if (suffix.startsWith(prefix)) return suffix;
  // Only remove substantial exact overlap; never guess at semantic duplication.
  for (let size = Math.min(512, prefix.length, suffix.length); size >= 24; size--) {
    if (prefix.endsWith(suffix.slice(0, size))) return prefix + suffix.slice(size);
  }
  return prefix + suffix;
}
