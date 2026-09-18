"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface MathRendererProps {
  content: string;
  className?: string;
}

// Pre-process and normalize plain text to ensure mathematical expressions and OCR exponents render cleanly
function preprocessMathString(raw: string): string {
  if (!raw) return "";

  let str = raw
    // Remove Hindi characters and OCR artifact strings
    .replace(/[\u0900-\u097F]/g, "")
    .replace(/[a-zA-Z]{1,2};fn|dks pØ|ekusa rFkk|gSa|okys|vkjs\[k|bldh|D;ksafdC|foHkokUrj/g, "")
    .replace(/\r\n/g, "\n");

  // Fix OCR exponent patterns outside of existing $ tags (e.g. y2x -> $y^2 x$)
  // We match segments that are outside $...$
  const segments = str.split(/(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g);

  const processed = segments.map((seg) => {
    // If it's already a math delimiter, preserve it
    if ((seg.startsWith("$") && seg.endsWith("$")) || (seg.startsWith("$$") && seg.endsWith("$$"))) {
      return seg;
    }

    // Process plain text segment:
    let text = seg;

    // Fix OCR exponent patterns like y2x -> $y^2 x$ or x2 -> $x^2$
    text = text.replace(/\b([a-zA-Z])([2-3])([a-zA-Z])\b/g, "$$$1^{$2} $3$$");

    // Fix naked LaTeX commands like \frac{...}{...} or \sqrt{...}
    text = text.replace(/(\\frac\{[^{}]+\}\{[^{}]+\})/g, "$$$1$$");
    text = text.replace(/(\\sqrt\{[^{}]+\})/g, "$$$1$$");

    // Fix scientific notations: 3.0 × 10^-4 -> $3.0 \times 10^{-4}$
    text = text.replace(/(\d+(?:\.\d+)?)\s*[×x]\s*10\^?([-\+]?\d+)/g, "$$$1 \\times 10^{$2}$$");

    // Fix m/s2 -> $\text{m/s}^2$
    text = text.replace(/\bm\/s2\b/g, "$$\\text{m/s}^2$$");

    return text;
  });

  return processed.join("");
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = "" }) => {
  const renderedParts = useMemo(() => {
    if (!content) return null;

    const normalizedContent = preprocessMathString(content);

    // Split content by display math $$...$$ first, then inline math $...$
    const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
    const parts = normalizedContent.split(mathRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      // Block math: $$...$$
      if (part.startsWith("$$") && part.endsWith("$$") && part.length >= 4) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
            strict: false,
          });
          return (
            <div
              key={index}
              className="my-3 overflow-x-auto py-1 text-center font-medium"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (e) {
          return (
            <code key={index} className="block my-2 text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-950/30 p-2 rounded text-sm font-mono">
              {math}
            </code>
          );
        }
      }

      // Inline math: $...$
      if (part.startsWith("$") && part.endsWith("$") && part.length >= 2) {
        const math = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
            strict: false,
          });
          return (
            <span
              key={index}
              className="inline-block px-0.5 align-middle font-medium"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (e) {
          return (
            <code key={index} className="text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/30 px-1 py-0.5 rounded text-xs font-mono">
              {math}
            </code>
          );
        }
      }

      // Plain text (may contain newlines)
      return (
        <span key={index} className="whitespace-pre-line">
          {part}
        </span>
      );
    });
  }, [content]);

  return (
    <div className={`leading-relaxed text-slate-800 dark:text-slate-100 transition-colors ${className}`}>
      {renderedParts}
    </div>
  );
};

export default MathRenderer;
