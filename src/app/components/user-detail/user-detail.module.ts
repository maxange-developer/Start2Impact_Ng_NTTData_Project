import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { UserDetailComponent } from './user-detail.component';

// PrimeNG modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

const routes: Routes = [{ path: '', component: UserDetailComponent }];

@NgModule({
  declarations: [UserDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    ButtonModule,
    CardModule,
    AvatarModule,
    InputTextModule,
    InputTextareaModule,
    ToastModule,
    TooltipModule,
    RippleModule,
    ProgressSpinnerModule,
  ],
})
export class UserDetailModule {}
