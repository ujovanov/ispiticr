import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from '../../types/user';
import { TypeOfToy } from '../../types/typeOfToy';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  user: User | null = null;
  isEditing = false;
  
  editFirstName = '';
  editLastName = '';
  editEmail = '';
  editPhone = '';
  editAddress = '';
  editFavoriteToyTypes: number[] = [];
  editUsername = '';
  editPassword = '';
  editConfirmPassword = '';
  
  toyTypes: TypeOfToy[] = [];
  loadingToyTypes = true;
  
  errorMessage = '';
  successMessage = '';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadToyTypes();
  }

  loadUser(): void {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    const userData = JSON.parse(currentUser);
    
    const users = this.getUsers();
    const fullUser = users.find(u => u.id === userData.id);
    
    if (fullUser) {
      this.user = fullUser;
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadToyTypes(): void {
    this.loadingToyTypes = true;
    this.http.get<TypeOfToy[]>('https://toy.pequla.com/api/type').subscribe({
      next: (types) => {
        this.toyTypes = types;
        this.loadingToyTypes = false;
      },
      error: (err) => {
        console.error('Failed to load toy types:', err);
        this.loadingToyTypes = false;
      }
    });
  }

  getUsers(): User[] {
    const usersJson = localStorage.getItem('users');
    return usersJson ? JSON.parse(usersJson) : [];
  }

  startEditing(): void {
    if (!this.user) return;
    
    this.editFirstName = this.user.firstName;
    this.editLastName = this.user.lastName;
    this.editEmail = this.user.email;
    this.editPhone = this.user.phone;
    this.editAddress = this.user.address;
    this.editFavoriteToyTypes = [...this.user.favoriteToyTypes];
    this.editUsername = this.user.username;
    this.editPassword = '';
    this.editConfirmPassword = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  toggleToyType(typeId: number): void {
    const index = this.editFavoriteToyTypes.indexOf(typeId);
    if (index === -1) {
      this.editFavoriteToyTypes.push(typeId);
    } else {
      this.editFavoriteToyTypes.splice(index, 1);
    }
  }

  isToyTypeSelected(typeId: number): boolean {
    return this.editFavoriteToyTypes.includes(typeId);
  }

  getToyTypeName(typeId: number): string {
    const toyType = this.toyTypes.find(t => t.typeId === typeId);
    return toyType ? toyType.name : `Tip ${typeId}`;
  }

  validateForm(): boolean {
    this.errorMessage = '';

    if (!this.editFirstName.trim()) {
      this.errorMessage = 'Ime je obavezno polje.';
      return false;
    }

    if (!this.editLastName.trim()) {
      this.errorMessage = 'Prezime je obavezno polje.';
      return false;
    }

    if (!this.editEmail.trim()) {
      this.errorMessage = 'Email je obavezno polje.';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.editEmail)) {
      this.errorMessage = 'Unesite validnu email adresu.';
      return false;
    }

    if (!this.editPhone.trim()) {
      this.errorMessage = 'Telefon je obavezno polje.';
      return false;
    }

    if (!this.editAddress.trim()) {
      this.errorMessage = 'Adresa je obavezno polje.';
      return false;
    }

    if (this.editFavoriteToyTypes.length === 0) {
      this.errorMessage = 'Morate izabrati najmanje jednu omiljenu vrstu igračaka.';
      return false;
    }

    if (!this.editUsername.trim()) {
      this.errorMessage = 'Korisničko ime je obavezno polje.';
      return false;
    }

    if (this.editUsername.length < 3) {
      this.errorMessage = 'Korisničko ime mora imati najmanje 3 karaktera.';
      return false;
    }

    if (this.editPassword) {
      if (this.editPassword.length < 6) {
        this.errorMessage = 'Lozinka mora imati najmanje 6 karaktera.';
        return false;
      }

      if (this.editPassword !== this.editConfirmPassword) {
        this.errorMessage = 'Lozinke se ne poklapaju.';
        return false;
      }
    }

    const users = this.getUsers();
    if (users.some(u => u.username === this.editUsername && u.id !== this.user?.id)) {
      this.errorMessage = 'Korisničko ime već postoji.';
      return false;
    }

    if (users.some(u => u.email === this.editEmail && u.id !== this.user?.id)) {
      this.errorMessage = 'Email adresa je već registrovana.';
      return false;
    }

    return true;
  }

  saveChanges(): void {
    if (!this.user || !this.validateForm()) return;

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === this.user!.id);

    if (userIndex === -1) {
      this.errorMessage = 'Greška pri čuvanju podataka.';
      return;
    }

    users[userIndex].firstName = this.editFirstName.trim();
    users[userIndex].lastName = this.editLastName.trim();
    users[userIndex].email = this.editEmail.trim();
    users[userIndex].phone = this.editPhone.trim();
    users[userIndex].address = this.editAddress.trim();
    users[userIndex].favoriteToyTypes = [...this.editFavoriteToyTypes];
    users[userIndex].username = this.editUsername.trim();
    
    if (this.editPassword) {
      users[userIndex].password = this.editPassword;
    }

    localStorage.setItem('users', JSON.stringify(users));

    const currentUser = {
      id: users[userIndex].id,
      firstName: users[userIndex].firstName,
      lastName: users[userIndex].lastName,
      email: users[userIndex].email,
      phone: users[userIndex].phone,
      address: users[userIndex].address,
      favoriteToyTypes: users[userIndex].favoriteToyTypes,
      username: users[userIndex].username
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    this.user = users[userIndex];
    
    this.successMessage = 'Podaci su uspešno sačuvani!';
    this.isEditing = false;

    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }
}
