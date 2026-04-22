import { Pipe, PipeTransform } from '@angular/core';

/** Formats fractional cap rate (e.g. 0.08) as a percentage with two decimal places (8.00%). */
@Pipe({
  name: 'capRatePercent',
  standalone: true,
})
export class CapRatePercentPipe implements PipeTransform {
  transform(rate: number | null | undefined): string {
    if (rate == null || !Number.isFinite(rate)) {
      return '—';
    }
    return `${(rate * 100).toFixed(2)}%`;
  }
}
