import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Toy } from '../../types/toy';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  toys: Toy[] = [];
  filteredToys: Toy[] = [];
  private readonly API_URL = 'https://toy.pequla.com/api/toy';

  searchCriteria = {
    naziv: '',
    opis: '',
    tip: '',
    uzrast: '',
    ciljna_grupa: '',
    cena_od: null as number | null,
    cena_do: null as number | null,
    datum_od: '',
    datum_do: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadToys();
  }

  private loadToys(): void {
    const storedToys = sessionStorage.getItem("toys_data");
    
    if (storedToys) {
      try {
        this.toys = JSON.parse(storedToys);
        this.filteredToys = this.toys;
        return;
      } catch (error) {
        console.error('Error parsing stored toys:', error);
      }
    }

    this.http.get<Toy[]>(this.API_URL).subscribe({
      next: (toys) => {
        this.toys = toys;
        this.filteredToys = toys;
        sessionStorage.setItem("toys_data", JSON.stringify(toys));
      },
      error: (error) => {
        console.error('Error fetching toys:', error);
      }
    });
  }

  searchToys(): void {
    this.filteredToys = this.toys.filter(toy => {
      const criteria = this.searchCriteria;
      
      if (criteria.naziv && !toy.name.toLowerCase().includes(criteria.naziv.toLowerCase())) {
        return false;
      }

      if (criteria.opis && !toy.description.toLowerCase().includes(criteria.opis.toLowerCase())) {
        return false;
      }

      if (criteria.tip && !toy.type.name.toLowerCase().includes(criteria.tip.toLowerCase())) {
        return false;
      }

      if (criteria.uzrast && !toy.ageGroup.name.toLowerCase().includes(criteria.uzrast.toLowerCase())) {
        return false;
      }

      if (criteria.ciljna_grupa && toy.targetGroup !== criteria.ciljna_grupa) {
        return false;
      }

      if (criteria.cena_od !== null && toy.price < criteria.cena_od) {
        return false;
      }
      if (criteria.cena_do !== null && toy.price > criteria.cena_do) {
        return false;
      }

      if (criteria.datum_od || criteria.datum_do) {
        const toyDate = new Date(toy.productionDate);
        
        if (criteria.datum_od) {
          const fromDate = new Date(criteria.datum_od);
          if (toyDate < fromDate) return false;
        }
        
        if (criteria.datum_do) {
          const toDate = new Date(criteria.datum_do);
          if (toyDate > toDate) return false;
        }
      }

      return true;
    });
  }

  clearSearch(): void {
    this.searchCriteria = {
      naziv: '',
      opis: '',
      tip: '',
      uzrast: '',
      ciljna_grupa: '',
      cena_od: null,
      cena_do: null,
      datum_od: '',
      datum_do: ''
    };
    this.filteredToys = this.toys;
  }
}
