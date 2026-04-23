import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';

const SERVICE_ID        = 'service_sq3m77r';
const PUBLIC_KEY        = 'QQdlFtzi0GagwyKgJ';

export const TEMPLATE_CONTACT    = 'template_ok970si';  // Contact page (merged with demo)
export const TEMPLATE_DEMO       = 'template_ok970si';  // Demo request page
export const TEMPLATE_AUTO_REPLY = 'template_yxsrs34';  // Auto-reply to customer

@Injectable({ providedIn: 'root' })
export class EmailjsService {

  constructor() {
    emailjs.init(PUBLIC_KEY);
  }

  send(templateId: string, templateParams: Record<string, string>): Promise<void> {
    return emailjs
      .send(SERVICE_ID, templateId, templateParams)
      .then(() => void 0);
  }
}
