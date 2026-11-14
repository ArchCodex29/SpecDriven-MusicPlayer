function escapeAttribute(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return entities[character];
  });
}

export function renderAlbumArtwork(coverArtUrl?: string): string {
  const placeholder = '<span class="album-art-placeholder" aria-hidden="true">No artwork</span>';
  if (!coverArtUrl) {
    return `<span class="album-art">${placeholder}</span>`;
  }
  return `<span class="album-art"><img class="album-art-image" src="${escapeAttribute(coverArtUrl)}" alt="" loading="lazy" /><span class="album-art-placeholder" aria-hidden="true" hidden>No artwork</span></span>`;
}
