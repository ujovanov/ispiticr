import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TypeOfToy } from '../../types/typeOfToy';
import { User } from '../../types/user';
import { Toy } from '../../types/toy';

interface ToyTypeWithImage extends TypeOfToy {
  imageUrl?: string;
}

@Component({
  selector: 'app-registration',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registration.html',
  styleUrl: './registration.css',
})

export class Registration implements OnInit {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  phone: string = '';
  address: string = '';
  favoriteToyTypes: number[] = [];
  username: string = '';
  password: string = '';
  confirmPassword: string = '';

  toyTypes: ToyTypeWithImage[] = [];
  loadingToyTypes: boolean = true;

  errorMessage: string = '';
  successMessage: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadToyTypes();
  }

  loadToyTypes(): void {
    this.loadingToyTypes = true;
    this.http.get<TypeOfToy[]>('https://toy.pequla.com/api/type').subscribe({
      next: (types) => {
        this.toyTypes = types.map(type => ({
          ...type,
          imageUrl: this.getImageForCategory(type.typeId)
        }));
        this.loadingToyTypes = false;
      },
      error: (err) => {
        console.error('Failed to load toy types:', err);
        this.loadingToyTypes = false;
      }
    });
  }

  getImageForCategory(typeId: number): string | undefined {
    const toysData = sessionStorage.getItem('toys_data');
    if (!toysData) return undefined;

    try {
      const toys: Toy[] = JSON.parse(toysData);
      const toyInCategory = toys.find(toy => toy.type.typeId === typeId);
      if (toyInCategory) {
        return 'https://toy.pequla.com/' + toyInCategory.imageUrl;
      }
    } catch (error) {
      console.error('Error parsing toys data:', error);
    }
    return undefined;
  }

  toggleToyType(typeId: number): void {
    const index = this.favoriteToyTypes.indexOf(typeId);
    if (index === -1) {
      this.favoriteToyTypes.push(typeId);
    } else {
      this.favoriteToyTypes.splice(index, 1);
    }
  }

  isToyTypeSelected(typeId: number): boolean {
    return this.favoriteToyTypes.includes(typeId);
  }

  validateForm(): boolean {
    this.errorMessage = '';

    if (!this.firstName.trim()) {
      this.errorMessage = 'Ime je obavezno polje.';
      return false;
    }

    if (!this.lastName.trim()) {
      this.errorMessage = 'Prezime je obavezno polje.';
      return false;
    }

    if (!this.email.trim()) {
      this.errorMessage = 'Email je obavezno polje.';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Unesite validnu email adresu.';
      return false;
    }

    if (!this.phone.trim()) {
      this.errorMessage = 'Telefon je obavezno polje.';
      return false;
    }

    if (!this.address.trim()) {
      this.errorMessage = 'Adresa je obavezno polje.';
      return false;
    }

    if (this.favoriteToyTypes.length === 0) {
      this.errorMessage = 'Morate izabrati najmanje jednu omiljenu vrstu igračaka.';
      return false;
    }

    if (!this.username.trim()) {
      this.errorMessage = 'Korisničko ime je obavezno polje.';
      return false;
    }

    if (this.username.length < 3) {
      this.errorMessage = 'Korisničko ime mora imati najmanje 3 karaktera.';
      return false;
    }

    if (!this.password) {
      this.errorMessage = 'Lozinka je obavezno polje.';
      return false;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Lozinka mora imati najmanje 6 karaktera.';
      return false;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Lozinke se ne poklapaju.';
      return false;
    }

    const existingUsers = this.getUsers();
    if (existingUsers.some(user => user.username === this.username)) {
      this.errorMessage = 'Korisničko ime već postoji.';
      return false;
    }

    if (existingUsers.some(user => user.email === this.email)) {
      this.errorMessage = 'Email adresa je već registrovana.';
      return false;
    }

    return true;
  }

  getUsers(): User[] {
    const usersJson = localStorage.getItem('users');
    return usersJson ? JSON.parse(usersJson) : [];
  }

  saveUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    const users = this.getUsers();
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

    const newUser: User = {
      id: newId,
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      address: this.address.trim(),
      favoriteToyTypes: [...this.favoriteToyTypes],
      username: this.username.trim(),
      password: this.password,
    };

    this.saveUser(newUser);
    this.successMessage = 'Registracija uspešna! Možete se prijaviti.';
    
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.phone = '';
    this.address = '';
    this.favoriteToyTypes = [];
    this.username = '';
    this.password = '';
    this.confirmPassword = '';

    // Redirect to login after 2 seconds
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
  }
}
