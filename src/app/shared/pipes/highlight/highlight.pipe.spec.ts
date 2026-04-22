import { SecurityContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';

import { HighlightPipe } from './highlight.pipe';

describe('HighlightPipe', () => {
  let pipe: HighlightPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HighlightPipe],
    });
    pipe = TestBed.inject(HighlightPipe);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  function toHtml(value: ReturnType<HighlightPipe['transform']>): string {
    return sanitizer.sanitize(SecurityContext.HTML, value) ?? '';
  }

  it('wraps case-insensitive matches in <mark>', () => {
    const out = pipe.transform('Very nice deal', 'NICE');
    expect(toHtml(out)).toBe('Very <mark class=\"highlight-mark\">nice</mark> deal');
  });

  it('returns escaped plain text when search is empty', () => {
    const out = pipe.transform('A <b>tag</b> & text', '   ');
    expect(toHtml(out)).toBe('A &lt;b&gt;tag&lt;/b&gt; &amp; text');
  });

  it('escapes regex characters in search term (literal match)', () => {
    const out = pipe.transform('Price is 1.2x in v1.2', '1.2');
    expect(toHtml(out)).toBe(
      'Price is <mark class=\"highlight-mark\">1.2</mark>x in v<mark class=\"highlight-mark\">1.2</mark>',
    );
  });

  it('escapes HTML in matched segments to prevent injection', () => {
    const out = pipe.transform('<script>alert(1)</script>', 'script');
    expect(toHtml(out)).toBe(
      '&lt;<mark class=\"highlight-mark\">script</mark>&gt;alert(1)&lt;/<mark class=\"highlight-mark\">script</mark>&gt;',
    );
  });
});

