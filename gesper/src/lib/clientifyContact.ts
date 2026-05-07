import type { ContactFormData } from './contactEmail';

type ClientifyContactPayload = {
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  description?: string;
  message?: string;
  gdpr_accept: boolean;
};

function envValue(name: string) {
  return (process.env[name] || import.meta.env[name])?.trim();
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

function buildContext(data: ContactFormData) {
  return [
    `Empresa: ${data.company}`,
    `Email: ${data.email}`,
    data.phone ? `Telefono: ${data.phone}` : '',
    data.employees ? `Cantidad de empleados: ${data.employees}` : '',
    data.industry ? `Rubro: ${data.industry}` : '',
    data.role ? `Cargo: ${data.role}` : '',
    data.message ? `Mensaje: ${data.message}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export async function createClientifyContact(data: ContactFormData) {
  const apiKey = requiredEnv('CLIENTIFY_API_KEY');
  const baseUrl = envValue('CLIENTIFY_API_URL') || 'https://api-plus.clientify.com/v2';
  const { firstName, lastName } = splitFullName(data.name);
  const context = buildContext(data);

  const payload: ClientifyContactPayload = {
    first_name: firstName,
    last_name: lastName,
    email: data.email,
    company: data.company,
    gdpr_accept: true,
  };

  if (context) {
    payload.description = context;
    payload.message = context;
  }

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
