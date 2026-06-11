import type { ContactFormData } from './contactEmail';

type ClientifyContactPayload = {
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  phone: string;
  description?: string;
  gdpr_accept: boolean;
};

function envValue(name: string) {
  // No usar import.meta.env: el acceso dinámico hace que Vite incruste todo el .env en el bundle.
  return process.env[name]?.trim();
}

function requiredEnv(name: string) {
  const value = envValue(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);

  if (parts.length <= 1) {
    return {
      firstName: parts[0] || '',
      lastName: '',
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

export async function createClientifyContact(data: ContactFormData) {
  const apiKey = requiredEnv('CLIENTIFY_API_KEY');
  const baseUrl = envValue('CLIENTIFY_API_URL') || 'https://api-plus.clientify.com/v2';
  const { firstName, lastName } = splitFullName(data.name);

  const payload: ClientifyContactPayload = {
    first_name: firstName,
    last_name: lastName,
    email: data.email,
    company: data.company,
    phone: data.phone,
    description: 'Origen: Agromovil',
    gdpr_accept: true,
  };

  const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/contacts/`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`Clientify contact creation failed with status ${response.status}: ${details.slice(0, 500)}`);
  }
}
