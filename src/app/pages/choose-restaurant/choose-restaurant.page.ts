import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { ApisService } from 'src/app/services/apis.service';
@Component({
  selector: 'app-choose-restaurant',
  templateUrl: './choose-restaurant.page.html',
  styleUrls: ['./choose-restaurant.page.scss'],
})
export class ChooseRestaurantPage implements OnInit {
  comercios: any[] = [];
  dummyRest: any = [];
  constructor(
    private router: Router,
    private api: ApisService) {

  }

  ngOnInit() {
    this.api.getCommerces().then((data) => {
      console.log('dataa', data);
      if (data) {
        this.comercios =  data.filter(element => element.abierto);
        this.dummyRest =  data.filter(element => element.abierto);
       
      }
    }, error => {
      console.log(error);
    }).catch(error => {
      console.log(error);
    });
  }

  goToAddReview(item) {
    const navData: NavigationExtras = {
      queryParams: {
        id: item.id
      }
    };
    this.router.navigate(['/add-review'], navData);
  }


  protected resetChanges = () => {
    this.comercios = this.dummyRest;
  }

  setFilteredItems() {
    console.log('clear');
    this.comercios = [];
    this.comercios = this.dummyRest;
  }

  filterItems(searchTerm) {

    return this.comercios.filter((item) => {
      return item.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });

  }
  onSearchChange(event) {
    this.resetChanges();
    this.comercios = this.filterItems(event.detail.value);
  }

}
