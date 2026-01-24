import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartItem, OrderStatus, RecesentType, UserReview } from '../../types/cartItem';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  cartItems: CartItem[] = [];
  
  reviewingItemId: number | null = null;
  reviewRating: number = 0;
  reviewRecesentType: RecesentType = null;
  reviewComment: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    const user = JSON.parse(currentUser);
    const cartKey = `cart_${user.id}`;
    const cartData = localStorage.getItem(cartKey);
    this.cartItems = cartData ? JSON.parse(cartData) : [];
  }

  saveCart(): void {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    const user = JSON.parse(currentUser);
    const cartKey = `cart_${user.id}`;
    localStorage.setItem(cartKey, JSON.stringify(this.cartItems));
  }

  getTotalPrice(): number {
    return this.cartItems
      .filter(item => item.status === 'rezervisano')
      .reduce((total, item) => total + (item.toy.price * item.quantity), 0);
  }

  getItemsByStatus(status: OrderStatus): CartItem[] {
    return this.cartItems.filter(item => item.status === status);
  }

  getTotalByStatus(status: OrderStatus): number {
    return this.getItemsByStatus(status)
      .reduce((sum, item) => sum + item.toy.price * item.quantity, 0);
  }

  updateStatus(item: CartItem, newStatus: OrderStatus): void {
    item.status = newStatus;
    if (newStatus !== 'pristiglo') {
      item.userReview = undefined;
    }
    this.saveCart();
  }

  updateQuantity(item: CartItem, change: number): void {
    const newQuantity = item.quantity + change;
    if (newQuantity > 0) {
      item.quantity = newQuantity;
      this.saveCart();
    }
  }

  removeItem(item: CartItem): void {
    const index = this.cartItems.indexOf(item);
    if (index > -1) {
      this.cartItems.splice(index, 1);
      this.saveCart();
    }
  }

  startReview(item: CartItem): void {
    this.reviewingItemId = item.toy.toyId;
    if (item.userReview) {
      this.reviewRating = item.userReview.rating;
      this.reviewRecesentType = item.userReview.recesentType;
      this.reviewComment = item.userReview.comment;
    } else {
      this.reviewRating = 0;
      this.reviewRecesentType = null;
      this.reviewComment = '';
    }
  }

  cancelReview(): void {
    this.reviewingItemId = null;
    this.reviewRating = 0;
    this.reviewRecesentType = null;
    this.reviewComment = '';
  }

  setReviewRating(rating: number): void {
    this.reviewRating = rating;
  }

  submitReview(item: CartItem): void {
    if (this.reviewRating === 0) return;

    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;
    const user = JSON.parse(currentUser);

    const review: UserReview = {
      rating: this.reviewRating,
      recesentType: this.reviewRecesentType,
      comment: this.reviewComment,
      createdAt: new Date().toISOString()
    };

    item.userReview = review;
    this.saveCart();

    this.addReviewToToysData(item.toy.toyId, user.id, review);

    this.cancelReview();
  }

  private addReviewToToysData(toyId: number, userId: number, review: UserReview): void {
    const toysData = sessionStorage.getItem('toys_data');
    if (!toysData) return;

    try {
      const toys = JSON.parse(toysData);
      const toy = toys.find((t: any) => t.toyId === toyId);
      
      if (toy) {
        if (!toy.ratings) {
          toy.ratings = [];
        }

        const existingReviewIndex = toy.ratings.findIndex((r: any) => r.userId === userId);
        
        const newRating = {
          ratingId: Date.now(),
          rating: review.rating,
          recesentType: review.recesentType,
          comment: review.comment,
          createdAt: review.createdAt,
          userId: userId,
          toyId: toyId
        };

        if (existingReviewIndex >= 0) {
          toy.ratings[existingReviewIndex] = newRating;
        } else {
          toy.ratings.push(newRating);
        }

        sessionStorage.setItem('toys_data', JSON.stringify(toys));
      }
    } catch (error) {
      console.error('Error adding review to toys_data:', error);
    }
  }

  isReviewing(item: CartItem): boolean {
    return this.reviewingItemId === item.toy.toyId;
  }

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case 'rezervisano': return 'Rezervisano';
      case 'pristiglo': return 'Pristiglo';
      case 'otkazano': return 'Otkazano';
    }
  }

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case 'rezervisano': return 'bg-amber-100 text-amber-700';
      case 'pristiglo': return 'bg-green-100 text-green-700';
      case 'otkazano': return 'bg-red-100 text-red-700';
    }
  }

  hasActiveItems(): boolean {
    return this.cartItems.some(item => item.status !== 'otkazano');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('currentUser') !== null;
  }
}
