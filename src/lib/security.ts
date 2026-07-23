/**
 * Utility functions for input validation, sanitization, XSS, CSRF, and JWT simulation.
 */

export class Security {
  /**
   * Sanitizes user input to prevent XSS (removes HTML tags) and SQL Injection (escapes quotes).
   */
  static sanitizeInput(input: string): string {
    if (!input) return '';
    
    // 1. XSS Clean: strip html tags
    let clean = input.replace(/<\/?[^>]+(>|$)/g, '');
    
    // 2. SQL Injection Prevention: escape quotes
    clean = clean.replace(/'/g, "''");
    clean = clean.replace(/"/g, '""');
    clean = clean.replace(/\\/g, '\\\\');
    clean = clean.replace(/;/g, ''); // strip query separators
    
    return clean.trim();
  }

  /**
   * Validates email format.
   */
  static validateEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates custom domain format.
   */
  static validateDomain(domain: string): boolean {
    if (!domain) return false;
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    return domainRegex.test(domain);
  }

  /**
   * Simulates generating a CSRF token.
   */
  static generateCsrfToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Simulates validating a CSRF token.
   */
  static validateCsrfToken(token: string, sessionToken: string): boolean {
    if (!token || !sessionToken) return false;
    return token === sessionToken;
  }

  /**
   * Simulates validating a JWT token.
   * In a live app, this uses `jsonwebtoken` library.
   */
  static validateJwtToken(token: string): { userId: string; role: string; valid: boolean } {
    if (!token || !token.startsWith('Bearer ')) {
      return { userId: '', role: '', valid: false };
    }
    
    const key = token.replace('Bearer ', '');
    // In our mock platform, check if the key matches a valid pattern
    if (key.length > 10) {
      return {
        userId: 'usr-1',
        role: 'OWNER',
        valid: true
      };
    }
    
    return { userId: '', role: '', valid: false };
  }
}
