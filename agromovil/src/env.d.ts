/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_SECURE?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    SMTP_FROM_EMAIL?: string;
    SMTP_FROM_NAME?: string;
    CONTACT_TO_EMAIL?: string;
    CLIENTIFY_API_KEY?: string;
    CLIENTIFY_API_URL?: string;
    PUBLIC_SITE_URL?: string;
  }
}
