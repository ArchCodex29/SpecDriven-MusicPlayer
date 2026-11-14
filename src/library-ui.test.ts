import { describe, expect, it } from 'vitest';
import { renderAlbumArtwork } from './library-ui';

describe('album artwork presentation', () => {
  it('renders a lazy-loaded authenticated image with an error fallback', () => {
    const markup = renderAlbumArtwork('https://music.example/art?token=abc&size=160');
    expect(markup).toContain('src="https://music.example/art?token=abc&amp;size=160"');
    expect(markup).toContain('loading="lazy"');
    expect(markup).toContain('class="album-art-placeholder" aria-hidden="true" hidden');
  });

  it('renders a placeholder when artwork is not available', () => {
    const markup = renderAlbumArtwork();
    expect(markup).toContain('class="album-art-placeholder"');
    expect(markup).not.toContain('<img');
  });
});
