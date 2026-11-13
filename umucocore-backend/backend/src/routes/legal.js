import { Router } from 'express';
import { env } from '../config/env.js';

/**
 * Public HTML pages that Google Play requires: a privacy policy and a way to
 * request account deletion without installing the app.
 */
const router = Router();

const UPDATED = '12 November 2026';

const contact = () =>
  env.SUPPORT_EMAIL
    ? `<a href="mailto:${env.SUPPORT_EMAIL}">${env.SUPPORT_EMAIL}</a>`
    : 'the support email listed on our Google Play page';

const page = (title, body) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · CodeHills</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px 16px 48px; line-height: 1.6; color: #2b1b10; background: #f7f0e5; }
  h1 { color: #4a2e1c; } h2 { color: #4a2e1c; margin-top: 2em; font-size: 1.15em; }
  a { color: #a87542; } li { margin: 4px 0; }
</style>
</head>
<body>
${body}
</body>
</html>`;

router.get('/privacy', (_req, res) => {
  res.type('html').send(page('Privacy Policy', `
<h1>CodeHills Privacy Policy</h1>
<p>Last updated: ${UPDATED}</p>
<p>CodeHills helps people discover Rwanda's heritage, culture and local crafts. This policy explains what data the CodeHills mobile app collects, why, and how you can delete it.</p>

<h2>Data we collect</h2>
<ul>
  <li><strong>Account details</strong>: your full name, and the email address or phone number you sign up with. If you sign in with Google, we receive your Google name and email address.</li>
  <li><strong>Order details</strong>: the name, phone number and delivery address you enter at checkout, and the items you order.</li>
  <li><strong>Business profile</strong>: if you create a business, its name, category, description, products and an optional photo you choose from your device.</li>
  <li><strong>App activity</strong>: stories you bookmark or unlock, products you favourite, places you save, your cart and your language preference.</li>
</ul>
<p>You can browse CodeHills as a guest without an account. We do not collect your device location, contacts, microphone audio or advertising identifiers. The app contains no ads and no analytics trackers.</p>

<h2>How we use it</h2>
<p>Only to run the app: to create and secure your account, show your saved items, process your orders and run your business tools. We do not sell your data or use it for advertising.</p>

<h2>Service providers</h2>
<p>We use these providers to run CodeHills. They process data on our behalf only:</p>
<ul>
  <li><strong>Render</strong>: hosts our API server.</li>
  <li><strong>Supabase</strong>: stores our database and uploaded images.</li>
  <li><strong>Google</strong>: Google Sign-In (if you choose it), Google Maps (to show places on a map), and Gemini AI (to generate business plans from the business details you enter).</li>
</ul>

<h2>Security</h2>
<p>All data is sent over encrypted HTTPS connections. Passwords are stored only as secure hashes.</p>

<h2>Deleting your data</h2>
<p>You can delete your account at any time in the app under <strong>Profile → Delete account</strong>. This permanently deletes your account, orders, saved items and business. You can also <a href="/account-deletion">request deletion without the app</a>.</p>

<h2>Children</h2>
<p>CodeHills is not directed at children under 13, and we do not knowingly collect their data.</p>

<h2>Changes and contact</h2>
<p>We will update this page if this policy changes. Questions? Contact us at ${contact()}.</p>
`));
});

router.get('/account-deletion', (_req, res) => {
  res.type('html').send(page('Delete your account', `
<h1>Delete your CodeHills account</h1>

<h2>In the app</h2>
<ol>
  <li>Open CodeHills and sign in.</li>
  <li>Go to <strong>Profile</strong>.</li>
  <li>Tap <strong>Delete account</strong> and confirm.</li>
</ol>

<h2>Without the app</h2>
<p>Email ${contact()} from the email address on your account (or include the phone number you signed up with), with the subject <strong>"Delete my CodeHills account"</strong>. We will delete your account within 30 days and confirm by email.</p>

<h2>What is deleted</h2>
<p>Your account and everything linked to it is permanently deleted: your name, email or phone number, password, orders and delivery details, bookmarks, favourites, saved places, cart, and your business with its products, orders and plans. We do not keep any of this data after deletion.</p>
`));
});

export default router;
