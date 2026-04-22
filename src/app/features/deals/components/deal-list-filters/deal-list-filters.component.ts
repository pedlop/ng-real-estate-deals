import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-deal-list-filters',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    NgxMaskDirective,
  ],
  templateUrl: './deal-list-filters.component.html',
  styleUrl: './deal-list-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealListFiltersComponent {
  readonly form = input.required<FormGroup>();
  readonly hasActiveFilters = input(false);
  readonly resetFilters = output<void>();
}

