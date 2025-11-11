/**
 * SafeHTML Component
 * 
 * A secure component for rendering HTML content with XSS protection.
 * Uses DOMPurify to sanitize HTML before rendering.
 * 
 * @example
 * ```tsx
 * // Render job description with rich formatting
 * <SafeHTML html={jobDescription} level="rich" />
 * 
 * // Render plain text with no HTML
 * <SafeHTML html={userName} level="strict" />
 * ```
 */

import React from 'react';
import { sanitizeString, detectXSS } from '@/lib/utils/security';

export interface SafeHTMLProps {
  /** The HTML content to render */
  html: string;
  /** Sanitization level: strict (no HTML), basic (simple formatting), rich (full formatting) */
  level?: 'strict' | 'basic' | 'rich';
  /** Optional CSS class name */
  className?: string;
  /** Optional inline styles */
  style?: React.CSSProperties;
  /** Optional tag to render (default: div) */
  as?: 'div' | 'span' | 'p' | 'section' | 'article';
}

/**
 * SafeHTML Component
 * 
 * Renders HTML content safely by sanitizing it with DOMPurify.
 * Detects and logs potential XSS attempts.
 */
export function SafeHTML({ 
  html, 
  level = 'rich', 
  className, 
  style,
  as: Component = 'div'
}: SafeHTMLProps) {
  // Detect XSS attempts and log them
  if (detectXSS(html)) {
    console.warn('[XSS Detection]', {
      timestamp: new Date().toISOString(),
      detected: true,
      level,
      originalLength: html.length,
      message: 'Potentially malicious content detected and sanitized'
    });
  }

  // Sanitize the HTML content
  const sanitizedHTML = sanitizeString(html, level);

  // Render the sanitized content
  return React.createElement(Component, {
    className,
    style,
    dangerouslySetInnerHTML: { __html: sanitizedHTML }
  });
}

/**
 * Hook for sanitizing HTML content
 * 
 * @example
 * ```tsx
 * const sanitizedContent = useSanitizedHTML(userInput, 'rich');
 * ```
 */
export function useSanitizedHTML(
  html: string, 
  level: 'strict' | 'basic' | 'rich' = 'rich'
): string {
  return React.useMemo(() => {
    if (detectXSS(html)) {
      console.warn('[XSS Detection] Content sanitized via useSanitizedHTML hook');
    }
    return sanitizeString(html, level);
  }, [html, level]);
}

export default SafeHTML;
