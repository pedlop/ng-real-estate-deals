import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { combineLatest, defer, map, startWith } from 'rxjs';

import { Deal } from '@models/deal.model';
import { parsePriceFilterValue } from '@shared/utils/parse-price-filter-value';

export interface DealFormDialogDataCreate {
  mode: 'create';
}

export interface DealFormDialogDataEdit {
  mode: 'edit';
  deal: Deal;
}

export type DealFormDialogData = DealFormDialogDataCreate | DealFormDialogDataEdit;

export interface DealFormResult {
  name: string;
  purchasePrice: number;
  address: string;
  noi: number;
  id?: string;
}

const NAME_MAX = 120;
const ADDRESS_MAX = 400;
const AMOUNT_MAX = 10_000_000_000;

/** Typical range for UX hints (percent, e.g. 5 = 5%). */
const CAP_RATE_TYPICAL_MIN_PCT = 5;
const CAP_RATE_TYPICAL_MAX_PCT = 12;

function usdAmountValidator(max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const n = parsePriceFilterValue(control.value);
    if (n === null) {
      return { required: true };
    }
    if (n < 0) {
      return { min: { min: 0, actual: n } };
    }
    if (n > max) {
      return { max: { max, actual: n } };
    }
    return null;
  };
}

interface CapRateVm {
  display: string;
  warning: 'low' | 'high' | null;
}

function buildCapRateVm(purchasePrice: number, noi: number): CapRateVm {
  if (!Number.isFinite(purchasePrice) || !Number.isFinite(noi) || purchasePrice <= 0) {
    return { display: '—', warning: null };
  }
  const pct = (noi / purchasePrice) * 100;
  let warning: 'low' | 'high' | null = null;
  if (pct < CAP_RATE_TYPICAL_MIN_PCT) {
    warning = 'low';
  } else if (pct > CAP_RATE_TYPICAL_MAX_PCT) {
    warning = 'high';
  }
  return {
    display: `${pct.toFixed(2)}%`,
    warning,
  };
}

@Component({
  selector: 'app-deal-form-dialog',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgxMaskDirective,
  ],
  templateUrl: './deal-form-dialog.component.html',
  styleUrl: './deal-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly data = inject<DealFormDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<DealFormDialogComponent, DealFormResult>);

  readonly form = this.fb.group({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(NAME_MAX)]),
    purchasePrice: this.fb.control<number | string>(0, { validators: [usdAmountValidator(AMOUNT_MAX)] }),
    address: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(ADDRESS_MAX)]),
    noi: this.fb.control<number | string>(0, { validators: [usdAmountValidator(AMOUNT_MAX)] }),
  });

  /**
   * NOI ÷ purchase price, live. `defer` ensures `startWith` runs after constructor `patchValue` (edit mode).
   */
  readonly capRateVm$ = defer(() =>
    combineLatest([
      this.form.controls.purchasePrice.valueChanges.pipe(
        startWith(this.form.controls.purchasePrice.value),
      ),
      this.form.controls.noi.valueChanges.pipe(startWith(this.form.controls.noi.value)),
    ]).pipe(
      map(([purchasePrice, noi]) =>
        buildCapRateVm(
          parsePriceFilterValue(purchasePrice) ?? 0,
          parsePriceFilterValue(noi) ?? 0,
        ),
      ),
    ),
  );

  constructor() {
    if (this.data.mode === 'edit') {
      const { deal } = this.data;
      this.form.patchValue({
        name: deal.name,
        purchasePrice: deal.purchasePrice,
        address: deal.address,
        noi: deal.noi,
      });
    }
  }

  get title(): string {
    return this.data.mode === 'create' ? 'Add deal' : 'Edit deal';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const purchasePrice = parsePriceFilterValue(v.purchasePrice);
    const noi = parsePriceFilterValue(v.noi);
    if (purchasePrice === null || noi === null) {
      return;
    }
    const result: DealFormResult = {
      name: v.name.trim(),
      purchasePrice,
      address: v.address.trim(),
      noi,
    };
    if (this.data.mode === 'edit') {
      result.id = this.data.deal.id;
    }
    this.dialogRef.close(result);
  }
}
