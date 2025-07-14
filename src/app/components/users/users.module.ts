import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { UsersComponent } from './users.component';

// PrimeNG modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';

const routes: Routes = [{ path: '', component: UsersComponent }];

@NgModule({
  declarations: [UsersComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    ButtonModule,
    CardModule,
    AvatarModule,
    InputTextModule,
    DropdownModule,
    PaginatorModule,
    ToastModule,
    DialogModule,
    ConfirmDialogModule,
    TooltipModule,
    RippleModule,
    InputIconModule,
    IconFieldModule,
  ],
})
export class UsersModule {}
