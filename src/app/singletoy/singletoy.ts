import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Toy } from '../../types/toy';

@Component({
  selector: 'app-singletoy',
  imports: [CommonModule],
  templateUrl: './singletoy.html',
  styleUrl: './singletoy.css',
})
export class Singletoy implements OnInit {
  toy: Toy | null = null;
  isLoading = true;
  error: string | null = null;
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

    this.http.get<Toy>(`${this.API_URL}/${permalink}`).subscribe({
      next: (toy) => {
        this.toy = toy;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching toy:', error);
        this.error = 'Igračka nije pronađena';
        this.isLoading = false;
      }
    });
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
}
