/**
 * Security Utilities
 * Comprehensive XSS protection and input sanitization
 * 
 * @module security
 * @description Provides reusable security functions for XSS prevention,
 * input validation, and sanitization across the application.
 */

import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

/**
 * Sanitization options for different contexts
 */
const SANITIZE_OPTIONS = {
  // Strict: Remove all HTML tags
  strict: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  },
  // Basic: Allow safe formatting tags only
  basic: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  },
  // Rich: Allow more HTML for rich text editors
  rich: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'br', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
    KEEP_CONTENT: true,
  },
};

/**
 * Sanitize a string to prevent XSS attacks
 * 
 * @param input - The string to sanitize
 * @param level - Sanitization level: 'strict', 'basic', or 'rich'
 * @returns Sanitized string safe for database storage and display
 * 
 * @example
 * ```typescript
 * const safe = sanitizeString('<script>alert("XSS")</script>Hello', 'strict');
 * // Returns: "Hello"
 * ```
 */
export function sanitizeString(
  input: string | null | undefined,
  level: 'strict' | 'basic' | 'rich' = 'strict'
): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // First pass: DOMPurify sanitization
  const sanitized = DOMPurify.sanitize(input, SANITIZE_OPTIONS[level]);

  // Second pass: Additional validation
  // Remove null bytes
  let cleaned = sanitized.replace(/\0/g, '');

  // Normalize whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Sanitize an object recursively
 * 
 * @param obj - Object to sanitize
 * @param level - Sanitization level
 * @returns Sanitized object
 * 
 * @example
 * ```typescript
 * const safe = sanitizeObject({
 *   name: '<script>alert("XSS")</script>John',
 *   bio: 'Hello <b>world</b>'
 * }, 'basic');
 * ```
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  level: 'strict' | 'basic' | 'rich' = 'strict'
): T {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value, level);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string'
          ? sanitizeString(item, level)
          : typeof item === 'object'
          ? sanitizeObject(item, level)
          : item
      );
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value, level);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Validate email address
 * 
 * @param email - Email to validate
 * @returns True if valid email
 */
export function isValidEmail(email: string): boolean {
  return validator.isEmail(email);
}

/**
 * Validate URL
 * 
 * @param url - URL to validate
 * @returns True if valid URL
 */
export function isValidURL(url: string): boolean {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
  });
}

/**
 * Sanitize HTML content (for rich text editors)
 * 
 * @param html - HTML content to sanitize
 * @returns Sanitized HTML
 */
export function sanitizeHTML(html: string): string {
  return sanitizeString(html, 'rich');
}

/**
 * Escape special characters for safe display
 * 
 * @param str - String to escape
 * @returns Escaped string
 */
export function escapeHTML(str: string): string {
  if (!str) return '';
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize a career/job posting object
 * 
 * @param career - Career object to validate
 * @returns Validation result with sanitized data or errors
 */
export function validateCareerInput(career: any): {
  isValid: boolean;
  errors: string[];
  sanitized: any;
} {
  const errors: string[] = [];
  const sanitized: any = {};

  // Required fields validation
  if (!career.jobTitle || typeof career.jobTitle !== 'string') {
    errors.push('Job title is required and must be a string');
  } else {
    sanitized.jobTitle = sanitizeString(career.jobTitle, 'strict');
    if (sanitized.jobTitle.length < 3) {
      errors.push('Job title must be at least 3 characters');
    }
    if (sanitized.jobTitle.length > 200) {
      errors.push('Job title must be less than 200 characters');
    }
  }

  if (!career.description || typeof career.description !== 'string') {
    errors.push('Description is required and must be a string');
  } else {
    sanitized.description = sanitizeString(career.description, 'rich');
    if (sanitized.description.length < 10) {
      errors.push('Description must be at least 10 characters');
    }
  }

  if (!career.location || typeof career.location !== 'string') {
    errors.push('Location is required');
  } else {
    sanitized.location = sanitizeString(career.location, 'strict');
  }

  if (!career.workSetup || typeof career.workSetup !== 'string') {
    errors.push('Work setup is required');
  } else {
    sanitized.workSetup = sanitizeString(career.workSetup, 'strict');
  }

  // Optional fields sanitization
  if (career.workSetupRemarks) {
    sanitized.workSetupRemarks = sanitizeString(career.workSetupRemarks, 'basic');
  }

  if (career.country) {
    sanitized.country = sanitizeString(career.country, 'strict');
  }

  if (career.province) {
    sanitized.province = sanitizeString(career.province, 'strict');
  }

  if (career.employmentType) {
    sanitized.employmentType = sanitizeString(career.employmentType, 'strict');
  }

  // Sanitize questions array
  if (career.questions) {
    if (!Array.isArray(career.questions)) {
      errors.push('Questions must be an array');
    } else {
      sanitized.questions = career.questions.map((q: any) => {
        if (typeof q === 'string') {
          return sanitizeString(q, 'basic');
        } else if (typeof q === 'object' && q.question) {
          return {
            ...q,
            question: sanitizeString(q.question, 'basic'),
          };
        }
        return q;
      });
    }
  }

  // Numeric fields validation
  if (career.minimumSalary !== undefined) {
    const salary = Number(career.minimumSalary);
    if (isNaN(salary) || salary < 0) {
      errors.push('Minimum salary must be a positive number');
    } else {
      sanitized.minimumSalary = salary;
    }
  }

  if (career.maximumSalary !== undefined) {
    const salary = Number(career.maximumSalary);
    if (isNaN(salary) || salary < 0) {
      errors.push('Maximum salary must be a positive number');
    } else {
      sanitized.maximumSalary = salary;
    }
  }

  // Boolean fields
  if (career.salaryNegotiable !== undefined) {
    sanitized.salaryNegotiable = Boolean(career.salaryNegotiable);
  }

  if (career.requireVideo !== undefined) {
    sanitized.requireVideo = Boolean(career.requireVideo);
  }

  // Pass through safe fields
  if (career.orgID) sanitized.orgID = career.orgID;
  if (career.createdBy) sanitized.createdBy = career.createdBy;
  if (career.lastEditedBy) sanitized.lastEditedBy = career.lastEditedBy;
  if (career.status) sanitized.status = career.status;
  if (career.screeningSetting) sanitized.screeningSetting = career.screeningSetting;

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
}

/**
 * Known XSS attack patterns for testing
 */
export const XSS_TEST_PAYLOADS = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  'javascript:alert("XSS")',
  '<iframe src="javascript:alert(\'XSS\')">',
  '<svg onload=alert("XSS")>',
  '"><script>alert(String.fromCharCode(88,83,83))</script>',
  '<body onload=alert("XSS")>',
  '<input onfocus=alert("XSS") autofocus>',
  '<select onfocus=alert("XSS") autofocus>',
  '<textarea onfocus=alert("XSS") autofocus>',
  '<keygen onfocus=alert("XSS") autofocus>',
  '<video><source onerror="alert("XSS")">',
  '<audio src=x onerror=alert("XSS")>',
  '<details open ontoggle=alert("XSS")>',
  '<marquee onstart=alert("XSS")>',
];

/**
 * Test if a string contains potential XSS
 * 
 * @param input - String to test
 * @returns True if potential XSS detected
 */
export function detectXSS(input: string): boolean {
  const dangerous = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /expression\(/i,
  ];

  return dangerous.some((pattern) => pattern.test(input));
}
