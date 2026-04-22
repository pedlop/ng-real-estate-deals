import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideEnvironmentNgxMask } from 'ngx-mask';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(MatDialogModule, MatSnackBarModule),
    provideEnvironmentNgxMask({
      thousandSeparator: ',',
      decimalMarker: '.',
      allowNegativeNumbers: false,
      dropSpecialCharacters: true,
      validation: false,
    }),
  ],
};
