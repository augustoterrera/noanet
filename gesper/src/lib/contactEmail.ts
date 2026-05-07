import nodemailer from 'nodemailer';

export type ContactFormData = {
  name: string;
  company: string;
  employees: string;
  industry: string;
  role: string;
  phone: string;
  email: string;
  message: string;
};

const fieldLabels: Record<keyof ContactFormData, string> = {
  name: 'Nombre y apellido',
  company: 'Empresa',
  employees: 'Cantidad de empleados',
  industry: 'Rubro',
  role: 'Cargo',
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

  return cleanHeader(`Nueva consulta Gesper - ${sender}`);
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
            <div style="padding: 14px 0; border-bottom: 1px solid #eaddeb;">
              <div style="margin: 0 0 5px; color: #7a2288; font-size: 12px; font-weight: 700; letter-spacing: 0.02em;">
                ${fieldLabels[key]}
              </div>
              <div style="margin: 0; color: #14091a; font-size: 15px; line-height: 1.55; overflow-wrap: anywhere; word-break: break-word;">
                ${value}
              </div>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  return `
    <div style="margin: 0; padding: 24px 12px; background: #fbf9fb; font-family: Arial, Helvetica, sans-serif;">
      <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #eaddeb; border-radius: 14px; overflow: hidden; box-shadow: 0 16px 40px rgba(20, 9, 26, 0.08);">
        <div style="background: #2a0e2f; padding: 22px 22px 24px; border-bottom: 4px solid #ef3d3a;">
          <p style="margin: 0 0 8px; color: #dbb5e1; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">
            Gesper
          </p>
          <h1 style="margin: 0; color: #ffffff; font-size: 22px; line-height: 1.25; font-weight: 800;">
            Nueva consulta desde la web
          </h1>
          <p style="margin: 8px 0 0; color: #efdff2; font-size: 14px; line-height: 1.5;">
            Un usuario completo el formulario de contacto.
          </p>
        </div>
        <div style="height: 8px; background: linear-gradient(90deg, #7a2288, #9d4aab, #ef3d3a);"></div>
        <table role="presentation" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; table-layout: fixed;">
          <tr><td style="height: 8px; line-height: 8px;">&nbsp;</td></tr>
          ${fields}
        </table>
        <div style="padding: 18px 22px 22px; background: #f9f2fb;">
          <p style="margin: 0; color: #5a4d62; font-size: 12px; line-height: 1.5;">
            Este mensaje fue generado automaticamente desde el formulario de contacto de Gesper.
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
      name: cleanHeader(envValue('SMTP_FROM_NAME') || 'Gesper Web'),
      address: requiredEnv('SMTP_FROM_EMAIL'),
    },
    to: requiredEnv('CONTACT_TO_EMAIL'),
    replyTo: data.email,
    subject: buildSubject(data),
    text: buildPlainText(data),
    html: buildHtml(data),
  });
}
