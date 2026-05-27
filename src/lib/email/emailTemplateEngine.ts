/**
 * Email Template Engine
 *
 * Renders email templates with design system styling.
 * All templates use a consistent base layout and design tokens.
 */

import { emailGlobalStyles } from "./emailConfig";

export interface EmailTemplateData {
  headerTitle: string;
  headerSubtitle?: string;
  mainContent: string;
  ctaButton?: {
    text: string;
    url: string;
  };
  footerMessage?: string;
}

export interface EmailTemplate {
  subject: string;
  data: EmailTemplateData;
}

/**
 * Renders a complete email HTML document with design system styling.
 *
 * @param template - Template data including title, content, and CTA
 * @returns Complete HTML email string ready for sending
 */
export function renderEmailTemplate(template: EmailTemplate): string {
  const {
    headerTitle,
    headerSubtitle,
    mainContent,
    ctaButton,
    footerMessage = "Thank you,<br/>Pratibha Parishad Team",
  } = template.data;

  const ctaButtonHtml = ctaButton
    ? `
    <div class="cta-container">
      <a href="${ctaButton.url}" class="cta-button">
        ${ctaButton.text}
      </a>
    </div>
    `
    : "";

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${template.subject}</title>
        <style>
          ${emailGlobalStyles}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${headerTitle}</h1>
            ${headerSubtitle ? `<div class="header-subtitle">${headerSubtitle}</div>` : ""}
          </div>
          <div class="content">
            ${mainContent}
            ${ctaButtonHtml}
          </div>
          <div class="footer">
            <p>${footerMessage}</p>
          </div>
        </div>
      </body>
    </html>
  `.trim();
}

/**
 * Helper to wrap content in a paragraph tag with default styling.
 */
export function paragraph(text: string): string {
  return `<p>${text}</p>`;
}

/**
 * Helper to create a highlighted section with border-left accent.
 */
export function section(title: string, content: string): string {
  return `
    <div class="section">
      ${title ? `<div class="section-title">${title}</div>` : ""}
      ${content}
    </div>
  `.trim();
}

/**
 * Helper to create a badge element.
 */
export function badge(text: string, variant: "success" | "featured" = "success"): string {
  return `<div class="badge badge-${variant}">${text}</div>`;
}

/**
 * Helper to create a divider line.
 */
export function divider(): string {
  return `<div class="divider"></div>`;
}
