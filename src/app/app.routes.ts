import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Singletoy } from './singletoy/singletoy';
import { Registration } from './registration/registration';
import { Login } from './login/login';
import { Profile } from './profile/profile';
import { Cart } from './cart/cart';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'igracke/:permalink',
    component: Singletoy
  },
  {
    path: 'registration',
    component: Registration
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'profile',
    component: Profile
  },
  {
    path: 'cart',
    component: Cart
  },
  {
    path: '**',
    redirectTo: ''
  }
];
