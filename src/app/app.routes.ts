import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Singletoy } from './singletoy/singletoy';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'igracke/:permalink',
    component: Singletoy
  }
];
