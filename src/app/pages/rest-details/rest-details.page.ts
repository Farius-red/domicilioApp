import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { Router, NavigationExtras } from "@angular/router";

@Component({
  selector: 'app-rest-details',
  templateUrl: './rest-details.page.html',
  styleUrls: ['./rest-details.page.scss'],
})
export class RestDetailsPage implements OnInit {
  slideOpts = {
    slidesPerView: 2.3,
  };
  id: any;
  name: any;
  descritions: any;
  cover: any = '';
  address: any;
  ratting: any;
  time: any;
  totalRatting: any;
  dishPrice: any;
  cusine: any[] = [];
  foods: any[] = [];
  dummyFoods: any[] = [];
  categories: any[] = [];
  dummy = Array(5);
  veg: boolean = true;
  totalItem: any = 0;
  totalPrice: any = 0;
  deliveryAddress: any = '';
  images: any[] = [];
  isOpen: boolean = false;
  open: any;
  close: any;
  email: any;
  phone: any;
  reviews: any[];
  constructor(
    private route: ActivatedRoute,
    private api: ApisService,
    private router: Router,
    private util: UtilService
  ) { }
  async getReview() {
    try {
      this.reviews =  await this.api.getReviewsByCriticado(this.id).then((reviews) => reviews);
      console.log(this.reviews);
      if(this.reviews.length > 0){
        for (let resena of this.reviews) {
          let critico = await this.api.getMyProfile(resena.criticoID).then(data => data);
          console.log(critico);
          resena.critico = critico;
        }
      }
        
    } catch (error) {
      console.log(error);
    }
  }
  ngOnInit() {
    this.route.queryParams.subscribe(data => {
      if (data.hasOwnProperty('id')) {
        this.id = data.id;
        this.getVenueDetails();
      }
    });
  }
  review(id) {
    const navData: NavigationExtras = {
      queryParams: {
        id: id,
        tipo:'comercio'
      }
    };
    this.router.navigate(['/add-review'], navData);
  }
  
  async getVenueDetails() {

    try {
      let data = await this.api.getCommerceDetails(this.id).then(data => data);
      if (data) {
        this.name = data.nombreComercial;
        this.descritions = data.descripcion;
        this.cover = data.imagen;
        this.address = data.direcciones[0].direccion;
        this.ratting = data.calificacion ? data.calificacion : 0;
        this.totalRatting = data.totalCalificacion ? data.totalCalificacion : 2;
        this.dishPrice = data.dishPrice;
        this.email = data.emailCommerce;
        this.phone = data.telefono;
        this.images = (data.imagenes? data.imagenes :  ['assets/imgs/food.jpg','assets/imgs/food.jpg','assets/imgs/food.jpg','assets/imgs/food.jpg','assets/imgs/food.jpg','assets/imgs/food.jpg']);
        let horario = JSON.parse(data.horario);    
        let dia = new Date().getDay();
        this.isOpen = true;
          horario.forEach(dias => {
            if(dia == dias.dia){
              let horaApertura = new Date(dias.horaApertura).getHours();
              let horaCierre = new Date(dias.horaCierre).getHours();
              let minApertura = new Date(dias.horaApertura).getMinutes();
              let minCierre = new Date(dias.horaCierre).getMinutes();
              console.log("1",(new Date().getHours() <= horaApertura  && new Date().getMinutes() < minApertura  ) || (new Date().getHours() >= horaCierre  && new Date().getMinutes() > minCierre));
              console.log("2",new Date().getHours() <= horaApertura  && new Date().getMinutes() < minApertura );
              console.log("3",horaCierre >= new Date().getHours() && minCierre > new Date().getMinutes());
              if(((new Date().getHours() <= horaApertura  && new Date().getMinutes() < minApertura) || (new Date().getHours() >= horaCierre  && new Date().getMinutes() > minCierre))){
                this.isOpen  = false;
              }
              
        this.open = this.util.hhmm(new Date(dias.horaApertura));
        this.close =this.util.hhmm(new Date(dias.horaCierre));
            }
            
          });
          if(!horario.some(e=>e.dia == dia)){
            this.isOpen  = false;
          }   
        
       
        this.images.forEach((element) => {
          if (element == '' || !element) {
            element = 'assets/imgs/food.jpg';
          }
        });
        this.getReview();
      }
    } catch (error) {
      console.log(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    }


  }

}
