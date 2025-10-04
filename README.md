# Stay Dangerous

Next.js 14 App Router site styled with Tailwind CSS for Stay Dangerous.

## Getting Started

```bash
npm install
npm run dev
```

The development server starts at http://localhost:3000. Update environment variables in `.env.local` before running locally.

## Environment Variables

The contact form depends on these variables:

```
ZOHO_SMTP_HOST=smtp.zoho.com
ZOHO_SMTP_PORT=465
ZOHO_SMTP_SECURE=true
ZOHO_USER=you@staydangerous.world
ZOHO_PASS=APP_PASSWORD
MAIL_FROM="Stay Dangerous <you@staydangerous.world>"
MAIL_TO=you@staydangerous.world
MAIL_BCC=you@staydangerous.world
```

Create a `.env.local` file with the values above (or your production credentials). Do not commit secrets to git.

## Deployment Notes

The project is ready for Vercel. After pushing to GitHub:

1. Import the repository in Vercel (`Add New Project`).
2. Ensure the environment variables listed above are added in **Project → Settings → Environment Variables**.
3. Deploy the project. Once deployed, test `/start` by submitting the form to confirm emails arrive.

### Domain & DNS

To connect `staydangerous.world` on Vercel:

1. In Vercel, open **Project → Settings → Domains** and add `staydangerous.world`.
2. If DNS stays with your registrar, configure:
   - `A` record (`@`) → `76.76.21.21`
   - `CNAME` (`www`) → `cname.vercel-dns.com`
   - Enable redirect from `www` to `staydangerous.world`.
3. Wait for SSL status to report **Ready** before switching traffic.

If you delegate DNS to Vercel, update the registrar with the Vercel-provided name servers instead.

### Email DNS Records

Ensure Zoho Mail DNS entries are active so messages from the contact form land reliably:

- **MX**: use the Zoho Mail MX records provided in the Zoho admin console (typically `mx.zoho.com`, `mx2.zoho.com`, `mx3.zoho.com`) with the recommended priorities.
- **SPF (TXT)**: `v=spf1 include:zoho.com ~all`
- **DKIM (TXT)**: add the selector/value generated in Zoho Mail (e.g., `zoho._domainkey` with the TXT value Zoho supplies).
- **DMARC (TXT, optional)**: `v=DMARC1; p=none; rua=mailto:you@staydangerous.world`

After updating DNS, allow time for propagation and confirm alignment using Zoho's post-setup verification tools.

## Rate Limiting & Spam Protection

The `/api/contact` route enforces a 64KB payload limit, drops submissions where the hidden `company` field is filled, and rate-limits each IP to 5 requests per minute.

