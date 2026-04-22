import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Deal } from '@models/deal.model';

/** Presentational card for a single deal. */
@Component({
  selector: 'app-deal-card',
  standalone: true,
  templateUrl: './deal-card.component.html',
  styleUrl: './deal-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealCardComponent {
  readonly deal = input<Deal | null>(null);
}
