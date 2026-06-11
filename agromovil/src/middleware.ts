import { defineMiddleware } from 'astro:middleware';

const isProd = import.meta.env.PROD;

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isProd ? ['upgrade-insecure-requests'] : []),
].join('; ');

const securityHeaders: Record<string, string> = {
  'Content-Security-Policy': csp,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  ...(isProd ? { 'Strict-Transport-Security': 'max-age=63072000; includeSubDomains' } : {}),
};

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();

  for (const [header, value] of Object.entries(securityHeaders)) {
    if (!response.headers.has(header)) {
      response.headers.set(header, value);
    }
  }

  return response;
});
