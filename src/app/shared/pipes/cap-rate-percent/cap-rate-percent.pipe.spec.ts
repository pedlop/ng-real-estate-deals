import { CapRatePercentPipe } from './cap-rate-percent.pipe';

describe('CapRatePercentPipe', () => {
  let pipe: CapRatePercentPipe;

  beforeEach(() => {
    pipe = new CapRatePercentPipe();
  });

  it('formats a fractional cap rate with two decimals', () => {
    expect(pipe.transform(0.08)).toBe('8.00%');
    expect(pipe.transform(0.125)).toBe('12.50%');
  });

  it('returns em dash for nullish and non-finite values', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
    expect(pipe.transform(Number.NaN)).toBe('—');
    expect(pipe.transform(Number.POSITIVE_INFINITY)).toBe('—');
  });

  it('handles zero and negative rates predictably', () => {
    expect(pipe.transform(0)).toBe('0.00%');
    expect(pipe.transform(-0.025)).toBe('-2.50%');
  });
});

