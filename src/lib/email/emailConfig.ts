/**
 * Email Design System Configuration
 *
 * Centralizes colors and styles to match the application's design system:
 * - Charcoal (#1C1C1E): Primary dark background
 * - Terracotta (#E07B54): Primary accent and CTAs
 * - Gold (#C8A84B): Secondary accent for badges and highlights
 *
 * All email templates inherit from this configuration.
 */

export const emailColors = {
  charcoal: "#1C1C1E",
  charcoalLight: "#2C2C2E",
  terracotta: "#E07B54",
  gold: "#C8A84B",
  white: "#FFFFFF",
  cream: "#FCF9F2",
  lightGray: "#F9F9F9",
  darkGray: "#666666",
  bodyText: "#333333",
  lightText: "#999999",
};

export const emailFonts = {
  family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

export const emailGlobalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${emailFonts.family};
    background-color: ${emailColors.cream};
    margin: 0;
    padding: 20px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: ${emailColors.white};
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .header {
    background-color: ${emailColors.charcoal};
    color: ${emailColors.white};
    padding: 40px 30px;
    text-align: center;
  }

  .header h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }

  .header-subtitle {
    margin: 8px 0 0 0;
    font-size: 14px;
    opacity: 0.9;
    font-weight: 400;
  }

  .content {
    padding: 40px 30px;
    color: ${emailColors.bodyText};
  }

  .content p {
    margin: 0 0 16px 0;
    font-size: 15px;
    line-height: 1.6;
    color: ${emailColors.bodyText};
  }

  .content p:last-child {
    margin-bottom: 0;
  }

  .content strong {
    font-weight: 600;
    color: ${emailColors.charcoal};
  }

  .badge {
    display: inline-block;
    padding: 12px 20px;
    margin: 20px 0;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    text-align: center;
  }

  .badge-success {
    background-color: ${emailColors.gold};
    color: ${emailColors.white};
  }

  .badge-featured {
    background-color: ${emailColors.terracotta};
    color: ${emailColors.white};
  }

  .section {
    margin: 24px 0;
    padding: 20px;
    background-color: ${emailColors.lightGray};
    border-radius: 6px;
    border-left: 4px solid ${emailColors.terracotta};
  }

  .section-title {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: ${emailColors.charcoal};
  }

  .section p {
    margin: 8px 0;
    font-size: 14px;
  }

  .cta-button {
    display: inline-block;
    margin-top: 30px;
    padding: 14px 32px;
    background-color: ${emailColors.terracotta};
    color: ${emailColors.white};
    text-decoration: none;
    border-radius: 4px;
    font-size: 15px;
    font-weight: 600;
    text-align: center;
    transition: background-color 0.2s ease;
  }

  .cta-button:hover {
    background-color: ${emailColors.charcoalLight};
  }

  .cta-container {
    text-align: center;
  }

  .divider {
    height: 1px;
    background-color: #E0E0E0;
    margin: 24px 0;
  }

  .footer {
    background-color: ${emailColors.lightGray};
    padding: 24px 30px;
    text-align: center;
    border-top: 1px solid #E0E0E0;
  }

  .footer p {
    margin: 0;
    font-size: 13px;
    color: ${emailColors.darkGray};
    line-height: 1.6;
  }

  .footer a {
    color: ${emailColors.terracotta};
    text-decoration: none;
  }

  .footer a:hover {
    text-decoration: underline;
  }

  .accent-text {
    color: ${emailColors.terracotta};
    font-weight: 600;
  }

  .icon {
    margin-right: 8px;
  }

  @media (max-width: 600px) {
    .container {
      border-radius: 0;
    }

    .header {
      padding: 30px 20px;
    }

    .header h1 {
      font-size: 24px;
    }

    .content {
      padding: 24px 20px;
    }

    .cta-button {
      display: block;
      width: 100%;
    }

    .footer {
      padding: 20px;
    }
  }
`;
