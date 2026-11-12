/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public access key from web3forms.com (safe to expose in the browser). */
  readonly VITE_WEB3FORMS_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
