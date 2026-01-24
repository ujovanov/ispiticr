import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Toy } from '../../types/toy';
import { CartItem } from '../../types/cartItem';

@Component({
  selector: 'app-singletoy',
  imports: [CommonModule, RouterLink],
  templateUrl: './singletoy.html',
  styleUrl: './singletoy.css',
})
export class Singletoy implements OnInit {
  toy: Toy | null = null;
  isLoading = true;
  error: string | null = null;
  addedToCart = false;
  private readonly API_URL = 'https://toy.pequla.com/api/toy/permalink';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const permalink = params['permalink'];
      if (permalink) {
        this.loadToy(permalink);
      }
    });
  }

  private loadToy(permalink: string): void {
    this.isLoading = true;
    this.error = null;
    this.addedToCart = false;

    const toysData = sessionStorage.getItem('toys_data');
    if (toysData) {
      try {
        const toys: Toy[] = JSON.parse(toysData);
        const toyFromStorage = toys.find(t => t.permalink === permalink);
        if (toyFromStorage) {
          this.toy = toyFromStorage;
          this.isLoading = false;
          this.checkIfInCart();
          return;
        }
      } catch (error) {
        console.error('Error parsing toys_data:', error);
      }
    }

    this.http.get<Toy>(`${this.API_URL}/${permalink}`).subscribe({
      next: (toy) => {
        this.toy = toy;
        this.isLoading = false;
        this.checkIfInCart();
      },
      error: (error) => {
        console.error('Error fetching toy:', error);
        this.error = 'Igračka nije pronađena';
        this.isLoading = false;
      }
    });
  }

  private checkIfInCart(): void {
    if (!this.toy) return;
    
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    const user = JSON.parse(currentUser);
    const cartKey = `cart_${user.id}`;
    const cartData = localStorage.getItem(cartKey);
    const cart: CartItem[] = cartData ? JSON.parse(cartData) : [];
    
    this.addedToCart = cart.some(item => item.toy.toyId === this.toy?.toyId);
  }

  addToCart(): void {
    if (!this.toy || this.addedToCart) return;

    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    const user = JSON.parse(currentUser);
    const cartKey = `cart_${user.id}`;
    const cartData = localStorage.getItem(cartKey);
    const cart: CartItem[] = cartData ? JSON.parse(cartData) : [];

    const existingItem = cart.find(item => item.toy.toyId === this.toy?.toyId);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      const newItem: CartItem = {
        toy: this.toy,
        quantity: 1,
        status: 'rezervisano',
        addedAt: new Date().toISOString()
      };
      cart.push(newItem);
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    this.addedToCart = true;

    setTimeout(() => {
      this.addedToCart = false;
    }, 4000);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  getAverageRating(): number {
    if (!this.toy || !this.toy.ratings || this.toy.ratings.length === 0) {
      return 0;
    }
    
    const sum = this.toy.ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / this.toy.ratings.length;
  }

  isLoggedIn(): boolean {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? true : false;
  }
}
