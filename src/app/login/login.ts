import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { User } from '../../types/user';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router) {}

  getUsers(): User[] {
    const usersJson = localStorage.getItem('users');
    return usersJson ? JSON.parse(usersJson) : [];
  }

  login(): void {
    this.errorMessage = '';

    if (!this.email.trim()) {
      this.errorMessage = 'Email je obavezno polje.';
      return;
    }

    if (!this.password) {
      this.errorMessage = 'Lozinka je obavezno polje.';
      return;
    }

    const users = this.getUsers();
    const user = users.find(u => u.email === this.email && u.password === this.password);

    if (user) {
      const currentUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        favoriteToyTypes: user.favoriteToyTypes,
        username: user.username
      };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      this.router.navigate(['/profile']);
    } else {
      this.errorMessage = 'Pogrešan email ili lozinka.';
    }
  }
}
