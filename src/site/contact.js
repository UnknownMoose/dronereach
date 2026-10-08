import { businessContact } from './config.js';
import { escapeHtml as e } from './html.js';

export function renderContactDetails() {
  const { email, phone } = businessContact;
  return `${email ? `<a href="mailto:${e(email)}">${e(email)}</a>` : ''}${phone ? `<a href="tel:${e(phone.replace(/[^+\d]/g, ''))}">${e(phone)}</a>` : ''}`;
}
