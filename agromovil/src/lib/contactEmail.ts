import nodemailer from 'nodemailer';

export type ContactFormData = {
  name: string;
  company: string;
  phone: string;
  email: string;
  message: string;
};

const fieldLabels: Record<keyof ContactFormData, string> = {
  name: 'Nombre y apellido',
  company: 'Empresa / Establecimiento',
  phone: 'Telefono',
  email: 'Correo electronico',
  message: 'Mensaje',
};

let transporter: ReturnType<typeof nodemailer.createTransport> | undefined;

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

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function cleanHeader(value: string) {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

function buildSubject(data: ContactFormData) {
  const sender = cleanHeader(data.company || data.name);

  return cleanHeader(`Nueva consulta Agromovil - ${sender}`);
}

function buildPlainText(data: ContactFormData) {
  return (Object.keys(fieldLabels) as Array<keyof ContactFormData>)
    .map((key) => `${fieldLabels[key]}: ${data[key] || '-'}`)
    .join('\n');
}

function buildHtml(data: ContactFormData) {
  const fields = (Object.keys(fieldLabels) as Array<keyof ContactFormData>)
    .map((key) => {
      const value = key === 'message'
        ? escapeHtml(data[key] || '-').replaceAll('\n', '<br>')
        : escapeHtml(data[key] || '-');

      return `
        <tr>
          <td style="padding: 0 22px 14px;">
            <div style="padding: 14px 0; border-bottom: 1px solid #dcebdc;">
              <div style="margin: 0 0 5px; color: #356b36; font-size: 12px; font-weight: 700; letter-spacing: 0.02em;">
                ${fieldLabels[key]}
              </div>
              <div style="margin: 0; color: #0d1a0d; font-size: 15px; line-height: 1.55; overflow-wrap: anywhere; word-break: break-word;">
                ${value}
              </div>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  return `
    <div style="margin: 0; padding: 24px 12px; background: #f5fbf5; font-family: Arial, Helvetica, sans-serif;">
      <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #dcebdc; border-radius: 14px; overflow: hidden; box-shadow: 0 16px 40px rgba(13, 26, 13, 0.08);">
        <div style="background: #071407; padding: 22px 22px 24px; border-bottom: 4px solid #4a9a22;">
          <p style="margin: 0 0 8px; color: #73c474; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">
            Agromovil
          </p>
          <h1 style="margin: 0; color: #ffffff; font-size: 22px; line-height: 1.25; font-weight: 800;">
            Nueva consulta desde la web
          </h1>
          <p style="margin: 8px 0 0; color: #cceecb; font-size: 14px; line-height: 1.5;">
            Un usuario completo el formulario de contacto.
          </p>
        </div>
        <div style="height: 8px; background: linear-gradient(90deg, #356b36, #4a9a22, #73c474);"></div>
        <table role="presentation" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; table-layout: fixed;">
          <tr><td style="height: 8px; line-height: 8px;">&nbsp;</td></tr>
          ${fields}
        </table>
        <div style="padding: 18px 22px 22px; background: #f5fbf5;">
          <p style="margin: 0; color: #3d5a3d; font-size: 12px; line-height: 1.5;">
            Este mensaje fue generado automaticamente desde el formulario de contacto de Agromovil.
          </p>
        </div>
      </div>
    </div>
  `;
}

export async function sendContactEmail(data: ContactFormData) {
  if (!transporter) {
    const port = Number.parseInt(requiredEnv('SMTP_PORT'), 10);

    if (!Number.isInteger(port) || port <= 0) {
      throw new Error('SMTP_PORT must be a valid port number');
    }

    transporter = nodemailer.createTransport({
      host: requiredEnv('SMTP_HOST'),
      port,
      secure: requiredEnv('SMTP_SECURE').toLowerCase() === 'true',
      auth: {
        user: requiredEnv('SMTP_USER'),
        pass: requiredEnv('SMTP_PASS'),
      },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }

  await transporter.sendMail({
    from: {
      name: cleanHeader(envValue('SMTP_FROM_NAME') || 'Agromovil Web'),
      address: requiredEnv('SMTP_FROM_EMAIL'),
    },
    to: requiredEnv('CONTACT_TO_EMAIL'),
    replyTo: data.email,
    subject: buildSubject(data),
    text: buildPlainText(data),
    html: buildHtml(data),
  });
}
