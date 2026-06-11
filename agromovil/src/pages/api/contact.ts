import type { APIRoute } from 'astro';
import { createClientifyContact } from '@/lib/clientifyContact';
import { sendContactEmail, type ContactFormData } from '@/lib/contactEmail';

export const prerender = false;

const MAX_BODY_BYTES = 16 * 1024;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

const rateLimit = new Map<string, { count: number; resetAt: number }>();

type ContactPayload = Partial<ContactFormData> & {
  website?: string;
};

const limits: Record<keyof ContactFormData, number> = {
  name: 90,
  company: 120,
  phone: 40,
  email: 160,
  message: 1200,
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}

function clean(value: unknown, maxLength: number) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function cleanMessage(value: unknown, maxLength: number) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\r\n/g, '\n').slice(0, maxLength);
}

function getClientId(request: Request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function isRateLimited(clientId: string) {
  const now = Date.now();
  const current = rateLimit.get(clientId);

  for (const [key, value] of rateLimit) {
    if (value.resetAt <= now) {
      rateLimit.delete(key);
    }
  }

  if (!current || current.resetAt <= now) {
    rateLimit.set(clientId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  const allowedOrigins = new Set([
    new URL(request.url).origin,
    'https://agromovil.noanet.com.ar',
    'https://www.agromovil.noanet.com.ar',
  ]);
  const publicSiteUrl = import.meta.env.PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL;

  if (publicSiteUrl) {
    try {
      allowedOrigins.add(new URL(publicSiteUrl).origin);
    } catch {
      console.warn('Ignoring invalid PUBLIC_SITE_URL for contact origin check.');
    }
  }

  if (origin) {
    return allowedOrigins.has(origin);
  }

  if (referer) {
    try {
      return allowedOrigins.has(new URL(referer).origin);
    } catch {
      return false;
    }
  }

  return false;
}

function isPlainObject(value: unknown): value is ContactPayload {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseContactPayload(payload: ContactPayload) {
  const data: ContactFormData = {
    name: clean(payload.name, limits.name),
    company: clean(payload.company, limits.company),
    phone: clean(payload.phone, limits.phone),
    email: clean(payload.email, limits.email).toLowerCase(),
    message: cleanMessage(payload.message, limits.message),
  };

  if (payload.website) {
    return { error: 'spam' as const };
  }

  if (!data.name || !data.company || !data.phone || !data.email) {
    return { error: 'required_fields' as const };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) {
    return { error: 'invalid_email' as const };
  }

  return { data };
}

export const POST: APIRoute = async ({ request }) => {
  if (!isAllowedOrigin(request)) {
    return jsonResponse({ message: 'Origen no permitido.' }, 403);
  }

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return jsonResponse({ message: 'Formato de solicitud no soportado.' }, 415);
  }

  const contentLength = Number.parseInt(request.headers.get('content-length') || '0', 10);

  if (contentLength > MAX_BODY_BYTES) {
    return jsonResponse({ message: 'La consulta es demasiado extensa.' }, 413);
  }

  if (isRateLimited(getClientId(request))) {
    return jsonResponse({ message: 'Demasiados intentos. Probá nuevamente en unos minutos.' }, 429);
  }

  let payload: ContactPayload;

  try {
    const body = await request.text();

    if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
      return jsonResponse({ message: 'La consulta es demasiado extensa.' }, 413);
    }

    const parsedBody: unknown = JSON.parse(body);

    if (!isPlainObject(parsedBody)) {
      return jsonResponse({ message: 'No pudimos leer los datos del formulario.' }, 400);
    }

    payload = parsedBody;
  } catch {
    return jsonResponse({ message: 'No pudimos leer los datos del formulario.' }, 400);
  }

  const parsed = parseContactPayload(payload);

  if ('error' in parsed) {
    return jsonResponse({ message: 'Revisá los datos ingresados.' }, parsed.error === 'spam' ? 400 : 422);
  }

  try {
    await sendContactEmail(parsed.data);
  } catch (error) {
    console.error('Contact email delivery failed:', error instanceof Error ? error.message : error);
    return jsonResponse({ message: 'No pudimos enviar tu consulta. Probá nuevamente.' }, 502);
  }

  try {
    await createClientifyContact(parsed.data);
    console.info('Clientify contact created:', parsed.data.email);
  } catch (error) {
    console.error('Clientify contact creation failed:', error instanceof Error ? error.message : error);
    return jsonResponse({ message: 'Recibimos tu consulta, pero no pudimos registrarla en Clientify.' }, 502);
  }

  return jsonResponse({ message: 'Gracias. Te contactamos pronto.' });
};
