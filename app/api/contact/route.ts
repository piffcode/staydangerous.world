import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_SIZE = 64 * 1024; // 64KB
const MAX_SHORT_FIELD = 512;
const MAX_LONG_FIELD = 8_192;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 5;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

type RateLimitStore = Map<string, number[]>;

const rateLimitStore: RateLimitStore = new Map();

class ValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ValidationError';
    this.status = status;
  }
}

function getClientIp(req: NextRequest): string {
  const headerKeys = ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip'];

  for (const key of headerKeys) {
    const headerValue = req.headers.get(key);
    if (!headerValue) continue;

    const [ip] = headerValue
      .split(',')
      .map((segment) => segment.trim())
      .filter(Boolean);

    if (ip) {
      return ip;
    }
  }

  return req.ip ?? 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const recentRequests = (rateLimitStore.get(ip) ?? []).filter((timestamp) => timestamp > windowStart);

  if (recentRequests.length >= RATE_LIMIT_MAX) {
    if (recentRequests.length > 0) {
      rateLimitStore.set(ip, recentRequests);
    } else {
      rateLimitStore.delete(ip);
    }
    return true;
  }

  recentRequests.push(now);
  rateLimitStore.set(ip, recentRequests);
  return false;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

function parseRequestBody(contentTypeHeader: string | null, rawBody: string): Record<string, string> {
  if (!rawBody) {
    return {};
  }

  const contentType = contentTypeHeader?.split(';')[0].trim().toLowerCase();

  if (!contentType || contentType === 'application/json') {
    try {
      const parsed = JSON.parse(rawBody);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid JSON payload');
      }
      return Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>).map(([key, value]) => [key, normalizeValue(value)]),
      );
    } catch (error) {
      if (contentType) {
        throw error;
      }
      // If no content type was provided, fall through to attempt URL-encoded parsing.
    }
  }

  if (contentType === 'application/x-www-form-urlencoded' || !contentType) {
    const params = new URLSearchParams(rawBody);
    const entries: Record<string, string> = {};
    for (const [key, value] of params.entries()) {
      entries[key] = value;
    }
    return entries;
  }

  throw new Error('Unsupported content type');
}

function formatMultilineHtml(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, '<br />');
}

function validateField(
  name: string,
  value: string,
  {
    required,
    maxLength,
    validator,
    errorMessage,
  }: {
    required: boolean;
    maxLength: number;
    validator?: (input: string) => boolean;
    errorMessage: string;
  },
): string {
  const trimmed = value.trim();

  if (required && !trimmed) {
    throw new ValidationError(errorMessage);
  }

  if (trimmed && trimmed.length > maxLength) {
    throw new ValidationError(`${name} must be ${maxLength} characters or fewer.`);
  }

  if (trimmed && validator && !validator(trimmed)) {
    throw new ValidationError(errorMessage);
  }

  return trimmed;
}

function parseAddressList(value?: string): string | string[] | undefined {
  if (!value) return undefined;
  const parts = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return undefined;
  }

  return parts.length === 1 ? parts[0] : parts;
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = requiredEnv('ZOHO_SMTP_HOST');
  const port = Number(process.env.ZOHO_SMTP_PORT ?? '465');
  const secureEnv = process.env.ZOHO_SMTP_SECURE ?? 'true';
  const secure = String(secureEnv).toLowerCase() === 'true';
  const user = requiredEnv('ZOHO_USER');
  const pass = requiredEnv('ZOHO_PASS');

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  return cachedTransporter;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'retry-after': Math.ceil(RATE_LIMIT_WINDOW_MS / 1000).toString(),
        },
      },
    );
  }

  const rawBody = await req.text();
  const bodySize = Buffer.byteLength(rawBody, 'utf8');

  if (bodySize > MAX_BODY_SIZE) {
    return NextResponse.json({ ok: false, error: 'Payload too large' }, { status: 413 });
  }

  let parsedBody: Record<string, string>;

  try {
    parsedBody = parseRequestBody(req.headers.get('content-type'), rawBody);
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Invalid request body' }, { status: 400 });
  }

  const name = normalizeValue(parsedBody.name ?? '');
  const email = normalizeValue(parsedBody.email ?? '');
  const service = normalizeValue(parsedBody.service ?? '');
  const project = normalizeValue(parsedBody.project ?? '');
  const budget = normalizeValue(parsedBody.budget ?? '');
  const timeline = normalizeValue(parsedBody.timeline ?? '');
  const success = normalizeValue(parsedBody.success ?? '');
  const company = normalizeValue(parsedBody.company ?? '');

  if (company.trim()) {
    return NextResponse.json({ ok: true });
  }

  let safeEmail: string;
  let safeService: string;
  let safeProject: string;
  let safeTimeline: string;
  let safeSuccess: string;
  let safeBudget: string;
  let safeName: string;

  try {
    safeEmail = validateField('Email', email, {
      required: true,
      maxLength: MAX_SHORT_FIELD,
      validator: (value) => EMAIL_REGEX.test(value),
      errorMessage: 'A valid email is required.',
    });

    safeService = validateField('Service', service, {
      required: true,
      maxLength: MAX_SHORT_FIELD,
      errorMessage: 'Service is required.',
    });

    safeTimeline = validateField('Timeline', timeline, {
      required: true,
      maxLength: MAX_SHORT_FIELD,
      errorMessage: 'Timeline is required.',
    });

    safeProject = validateField('Project details', project, {
      required: true,
      maxLength: MAX_LONG_FIELD,
      errorMessage: 'Project details are required.',
    });

    safeSuccess = validateField('Success criteria', success, {
      required: true,
      maxLength: MAX_LONG_FIELD,
      errorMessage: 'Success criteria are required.',
    });

    safeBudget = validateField('Budget', budget, {
      required: true,
      maxLength: MAX_SHORT_FIELD,
      errorMessage: 'Budget is required.',
    });

    safeName = validateField('Name', name, {
      required: true,
      maxLength: MAX_SHORT_FIELD,
      errorMessage: 'Name is required.',
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json({ ok: false, error: 'Invalid form submission.' }, { status: 400 });
  }

  const mailFrom = process.env.MAIL_FROM ?? requiredEnv('ZOHO_USER');
  const mailTo = process.env.MAIL_TO ?? requiredEnv('ZOHO_USER');
  const mailBcc = process.env.MAIL_BCC;
  const parsedMailTo = parseAddressList(mailTo) ?? requiredEnv('ZOHO_USER');
  const parsedMailBcc = parseAddressList(mailBcc);
  const safeIp = ip || 'unknown';

  const textBody = [
    `Name: ${safeName}`,
    `Email: ${safeEmail}`,
    `Service: ${safeService}`,
    `Budget: ${safeBudget}`,
    `Timeline: ${safeTimeline}`,
    '',
    'Project Details:',
    safeProject,
    '',
    'Success Definition:',
    safeSuccess,
    '',
    `IP Address: ${safeIp}`,
  ].join('\n');

  const htmlBody = `
    <h2>New Inquiry</h2>
    <ul>
      <li><strong>Name:</strong> ${escapeHtml(safeName)}</li>
      <li><strong>Email:</strong> ${escapeHtml(safeEmail)}</li>
      <li><strong>Service:</strong> ${escapeHtml(safeService)}</li>
      <li><strong>Budget:</strong> ${escapeHtml(safeBudget)}</li>
      <li><strong>Timeline:</strong> ${escapeHtml(safeTimeline)}</li>
      <li><strong>IP Address:</strong> ${escapeHtml(safeIp)}</li>
    </ul>
    <p><strong>Project Details</strong></p>
    <p>${formatMultilineHtml(safeProject)}</p>
    <p><strong>Success Definition</strong></p>
    <p>${formatMultilineHtml(safeSuccess)}</p>
  `;

  try {
    const transporter = getTransporter();

    await transporter.sendMail({
      from: mailFrom,
      to: parsedMailTo,
      ...(parsedMailBcc ? { bcc: parsedMailBcc } : {}),
      replyTo: safeEmail,
      subject: `New Inquiry — ${safeService} — ${safeEmail}`,
      text: textBody,
      html: htmlBody,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send email';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export { escapeHtml };
