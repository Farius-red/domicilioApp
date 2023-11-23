import { VariationsPage } from './../variations/variations.page';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { NavController, AlertController, PopoverController, ModalController } from '@ionic/angular';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { Router } from '@angular/router';
import { MenuComponent } from 'src/app/components/menu/menu.component';
import { Location } from '@angular/common';
import { Store } from '@ngxs/store';
import { AddGenerales } from '../../state/generales.actions';
import { debug } from 'console';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit {

  @ViewChild('content', { static: false }) private content: any;
  comercio: any;
  id: any;
  food: any;
  foods: any[] = [];
  dummyFoods: any[] = [];
  categories: any[] = [];
  dummy = Array(5);
  totalItem: any = 0;
  totalPrice: any = 0;
  grandTotal: any = 0;
  deliveryAddress: any = '';
  cart: any[] = [];
  comercios: any[] = [];
  numletras: any[] = [
    { id: 1, name: "primero" },
    { id: 2, name: "segundo" },
    { id: 3, name: "tercero" },
    { id: 4, name: "cuarto" },
    { id: 5, name: "quinto" },
  ];
  coupon: any;
  reviews: any[];
  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private api: ApisService,
    private util: UtilService,
    private navCtrl: NavController,
    private store: Store,
    private router: Router,
    private popoverController: PopoverController,

  ) { }
  review(id) {
    const navData: NavigationExtras = {
      queryParams: {
        id: id,
        tipo: 'producto'
      }
    };
    this.router.navigate(['/add-review'], navData);
  }
  async getReview() {
    try {
      this.reviews = await this.api.getReviewsByCriticado(this.id).then((reviews) => reviews);
      console.log(this.reviews);
      if (this.reviews.length > 0) {
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

  getNumLetras(id) {
    return this.numletras.find(e => e.id == id).name;
  }
  async ngOnInit() {
    this.route.queryParams.subscribe(data => {
      if (data.hasOwnProperty('id')) {
        this.id = data.id;
      }
    });

    this.food = await this.api.getProducto(this.id).then(data => data);
    this.comercio = await this.api.getCommerceDetails(this.food.comercioID).then(data => data);
    console.log(this.comercio);
    this.food.comercio = this.comercio;
    if (!localStorage.getItem('userCart')) {
      localStorage.setItem('userCart', JSON.stringify([]));
    }
    let userCart = JSON.parse(localStorage.getItem('userCart'));
    if (userCart.some(e => e.id == this.food.id)) {
      this.food.cantidad = parseInt(userCart.find(e => e.id == this.food.id).cantidad);
      this.food.total = parseFloat(userCart.find(e => e.id == this.food.id).total);
    } else {
      this.food.cantidad = 1;
      this.calcularTotal();
    }
    this.getReview();
  }

  async calcularTotal() {
    let cantidad = await this.validarRestriccion();

    if (this.food.restricciones.some(e => e.tipoPrecio == "especifico")) {
      this.food.total = 0;
      for (let index = 1; index <= this.food.cantidad; index++) {
        if (this.food.restricciones.some(e => (e.cantidad == index && e.tipo == 'usuario' && e.cantidad > cantidad) || (e.cantidad == index && e.tipo == 'servicio'))) {
          this.food.total = this.food.total + this.food.restricciones.find(e => e.cantidad == index).precio;
        } else {
          this.food.total = this.food.total + this.food.precio;
        }
      }
      // this.food.total = this.food.cantidad * this.food.restricciones.find(e=>e.cantidad == this.food.cantidad).precio;
    } else {
      if (this.food.restricciones.some(e => e.cantidad == this.food.cantidad)) {
        this.food.total = this.food.cantidad * this.food.restricciones.find(e => e.cantidad == this.food.cantidad).precio;
      } else {
        this.food.total = this.food.cantidad * this.food.precio;

      }
    }
    this.aplicarPromoCerveza();
  }

  aplicarPromoCerveza() {
    let userCart = JSON.parse(localStorage.getItem('userCart'));
    let cervezas = ['5ctzOl3ODjvIDCcYpYjK', 'XXKnHVNWtxFWUAcRCnbR', 'b3rqnoUGB4Ug4PBM85qg'];
    let cantidadPromo = 0;
    let listaUserCart = userCart.map(e => {
      if (cervezas.some(a => a == e.id)) {
        e.total = 0;
        for (let index = 1; index <= e.cantidad; index++) {
          cantidadPromo = cantidadPromo + 1;
          if (cantidadPromo > 4) {
            e.total = e.total + (e.precio + 3000);
          } else {
            e.total = e.total + e.precio;
          }
        }
      }
      return e;
    });
    if (cervezas.some(a => a == this.food.id)) {
      if ((cantidadPromo + this.food.cantidad) <= 4) {   
        this.food.total = 0;
        for (let index = 1; index <= this.food.cantidad; index++) {
          cantidadPromo = cantidadPromo + 1;
          if (cantidadPromo > 4) {
            this.food.total = this.food.total + (this.food.precio + 3000);
          } else {
            this.food.total = this.food.total + this.food.precio;
          }
        }
      } else {
        this.util.showToast("Lo sentimos has alcanzado la capacidad maxima de produtos para la promocion", "warning", "buttom");
        this.food.cantidad = this.food.cantidad - 1;
      }
   

    }
    localStorage.removeItem('userCart');
    localStorage.setItem('userCart', JSON.stringify(listaUserCart));
  }
  async validarRestriccion() {
    let cantidad = await this.api.getCantidadPorTipoRestriccion(localStorage.getItem('uid'), this.food.id).then(data => data);
    return cantidad;
  }
  getAddress() {
    const address = JSON.parse(localStorage.getItem('deliveryAddress'));
    if (address && address.address) {
      this.deliveryAddress = address.address;
    }
    return this.deliveryAddress;
  }


  back() {
    this.navCtrl.navigateRoot(['category']);
  }

  add() {
    this.api.checkAuth().then((user) => {
      if (user) {
        if (!localStorage.getItem('userCart')) {
          localStorage.setItem('userCart', JSON.stringify([]));
        }
        let userCart = JSON.parse(localStorage.getItem('userCart'));
        if (userCart.some(e => e.comercioID == this.food.comercioID) || userCart.length == 0) {
          if (userCart.some(e => e.id == this.food.id)) {
            userCart.find(e => e.id == this.food.id).cantidad = parseInt(this.food.cantidad);
            userCart.find(e => e.id == this.food.id).total = parseFloat(this.food.total);
          } else {
            userCart.push(this.food);
          }
          localStorage.removeItem('userCart');
          localStorage.setItem('userCart', JSON.stringify(userCart));
          const navData: NavigationExtras = {
            queryParams: {
              id: this.food.comercioID
            }
          };
          this.updateCard();
          this.router.navigate(['category'], navData);
          /* if (this.foods[index].variations && this.foods[index].variations.length) {
             console.log('open modal');
             this.openVariations(index);
           } else {          
            // this.calculate();   
             this.calcular(index); 
           }*/
        } else {
          const navData: NavigationExtras = {
            queryParams: {
              id: this.food.comercioID
            }
          };
          this.router.navigate(['category'], navData);
          this.util.showToast("Por ahora sólo puedes pedir en un restaurante por pedido.", "warning", 5000)
        }
        const navData: NavigationExtras = {
          queryParams: {
            id: this.food.comercioID
          }
        };
        this.router.navigate(['category'], navData);
      } else {
        this.router.navigate(['category']);
      }
    }).catch(error => {
      console.log(error);
    });


  }
  updateCard() {
    if (localStorage.getItem('coupon')) {
      this.coupon = JSON.parse(localStorage.getItem('coupon'));
    }
    this.comercios = [];
    this.cart = [];
    if (localStorage.getItem('userCart')) {
      this.cart = JSON.parse(localStorage.getItem('userCart'));
    }
    this.grandTotal = 0;
    this.totalItem = 0;
    this.totalPrice = 0;

    for (let a of this.cart) {
      this.totalItem = this.totalItem + parseInt(a.cantidad);
      if (this.comercios.find(e => e.id == a.comercioID) == undefined) {
        this.comercios.push(a.comercio);
        this.comercios.find(e => e.id == a.comercioID).totalPrice = 0;
      }
      if (this.comercios.find(e => e.id == a.comercioID)) {

        this.comercios.find(e => e.id == a.comercioID).totalPrice = parseFloat(this.comercios.find(e => e.id == a.comercioID).totalPrice) + parseFloat(a.total);
        this.comercios.find(e => e.id == a.comercioID).total = parseFloat(this.comercios.find(e => e.id == a.comercioID).totalPrice);

        if (this.coupon) {
          if (this.coupon.disponibleEn.find(e => e.id == a.comercioID)) {
            this.comercios.find(e => e.id == a.comercioID).descuentoID = this.coupon.id;
            this.comercios.find(e => e.id == a.comercioID).descuento = parseFloat(this.coupon.descuento);
            this.comercios.find(e => e.id == a.comercioID).tipoDescuento = this.coupon.tipo;
            if (this.coupon.tipo == '$') {
              var descuento = parseFloat(this.coupon.descuento);
            } else {
              var descuento = (parseFloat(this.comercios.find(e => e.id == a.comercioID).totalPrice) * parseFloat(this.coupon.descuento)) / 100;
            }
            this.comercios.find(e => e.id == a.comercioID).total = parseFloat(this.comercios.find(e => e.id == a.comercioID).totalPrice) - descuento;
          }

        }

      }

    }
    for (let comercio of this.comercios) {
      this.totalPrice = this.totalPrice + comercio.total;
    }
    this.grandTotal = this.totalPrice /*+ this.deliveryCharge*/;
    this.store.dispatch(new AddGenerales({ name: 'datosCart', valor: { totalPrice: this.totalPrice, totalItem: this.totalItem, grandTotal: this.grandTotal } }));
    //localStorage.removeItem('datosCart');
    //localStorage.setItem('datosCart', JSON.stringify({ totalPrice: this.totalPrice, totalItem: this.totalItem, grandTotal: this.grandTotal }));
    /*localStorage.removeItem('comerciosCart');
    localStorage.setItem('comerciosCart', JSON.stringify(this.comercios)); */
  }
  addQ() {

    this.food.cantidad = this.food.cantidad + 1;
    //this.food.total = this.food.cantidad * this.food.precio;
    this.calcularTotal();
  }

  removeQ() {
    if (this.food.cantidad > 1) {
      this.food.cantidad = this.food.cantidad - 1;
      //this.food.total = this.food.cantidad * this.food.precio;
      this.calcularTotal();
    }
  }

  async presentPopover(ev: any) {
    if (this.categories.length <= 0) {
      return false;
    }
    const popover = await this.popoverController.create({
      component: MenuComponent,
      event: ev,
      componentProps: { data: this.categories },
      mode: 'ios',
    });
    popover.onDidDismiss().then(data => {
      console.log(data.data);
      if (data && data.data) {
        const yOffset = document.getElementById(data.data.id).offsetTop;
        const yHOffset = document.getElementById(data.data.id).offsetHeight;

        console.log(yOffset + ' : ' + yHOffset);
        this.content.scrollToPoint(0, yOffset, 1000);
      }
    });
    await popover.present();

  }

  openDetails(item) {
    /* const navData: NavigationExtras = {
       queryParams: {
         id: item.comercioID,
         isCategory: false,
       }
     };
     this.router.navigate(['category'], navData);*/
    this.location.back();
  }


  getCurrency() {
    return this.util.getCurrecySymbol();
  }
  ionViewWillEnter() {

  }

}
