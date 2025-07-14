import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, authMatchGuard } from './@core/services/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'main',
    loadChildren: () =>
      import('./components/main-layout/main-layout.module').then(
        (m) => m.MainLayoutModule
      ),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
    canMatch: [authMatchGuard],
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
