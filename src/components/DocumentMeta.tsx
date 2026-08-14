import { useEffect } from 'react';
import {
  APP_DESCRIPTION,
  APP_TITLE,
  OG_IMAGE_URL,
} from '../config/appConfig';

export function DocumentMeta() {
  useEffect(() => {
    document.title = APP_TITLE;
    upsertMeta('name', 'description', APP_DESCRIPTION);
    upsertMeta('property', 'og:title', APP_TITLE);
    upsertMeta('property', 'og:description', APP_DESCRIPTION);
    upsertMeta('property', 'og:type', 'website');

    if (OG_IMAGE_URL) {
      upsertMeta('property', 'og:image', OG_IMAGE_URL);
    }
  }, []);

  return null;
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attribute}="${key}"]`;
  const existing = document.head.querySelector(selector);

  if (existing instanceof HTMLMetaElement) {
    existing.content = content;
    return;
  }

  const meta = document.createElement('meta');
  meta.setAttribute(attribute, key);
  meta.content = content;
  document.head.appendChild(meta);
}
