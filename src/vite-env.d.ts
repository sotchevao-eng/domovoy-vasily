/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_MODE?: 'standalone' | 'website' | 'vk';
  readonly VITE_MAIN_SITE_URL?: string;
  readonly VITE_BASE_PATH?: string;
  readonly VITE_OG_IMAGE_URL?: string;
  readonly VITE_VK_APP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
