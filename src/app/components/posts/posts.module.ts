import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { PostsComponent } from './posts.component';

// PrimeNG modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { MenuModule } from 'primeng/menu';

const routes: Routes = [{ path: '', component: PostsComponent }];

@NgModule({
  declarations: [PostsComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    ButtonModule,
    CardModule,
    AvatarModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    PaginatorModule,
    ToastModule,
    DialogModule,
    ConfirmDialogModule,
    TooltipModule,
    RippleModule,
    MenuModule,
  ],
})
export class PostsModule {}
