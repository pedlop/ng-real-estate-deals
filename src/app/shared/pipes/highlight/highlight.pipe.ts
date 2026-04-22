import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Wraps case-insensitive matches of `search` in `<mark class="highlight-mark">`.
 * Escapes HTML in the source text; safe for `[innerHTML]`.
 */
@Pipe({
  name: 'highlight',
  standalone: true,
})
export class HighlightPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(text: string | null | undefined, search: string | null | undefined): SafeHtml {
    const raw = text ?? '';
    const q = search?.trim() ?? '';
    if (!q) {
      return this.sanitizer.bypassSecurityTrustHtml(escapeHtml(raw));
    }

    const pattern = new RegExp(escapeRegExp(q), 'gi');
    let result = '';
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    pattern.lastIndex = 0;
    while ((m = pattern.exec(raw)) !== null) {
      result += escapeHtml(raw.slice(lastIndex, m.index));
      result += '<mark class="highlight-mark">' + escapeHtml(m[0]) + '</mark>';
      lastIndex = m.index + m[0].length;
      if (m[0].length === 0) {
        pattern.lastIndex++;
      }
    }
    result += escapeHtml(raw.slice(lastIndex));
    return this.sanitizer.bypassSecurityTrustHtml(result);
  }
}
