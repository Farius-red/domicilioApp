import { VariationsPage } from './../variations/variations.page';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { NavController, AlertController, PopoverController, ModalController } from '@ionic/angular';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { Router } from '@angular/router';
import { MenuComponent } from 'src/app/components/menu/menu.component';
import { Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { GeneralesState } from '../../state/generales.state';
import { parse } from 'querystring';
@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
})
export class CategoryPage implements OnInit {

  @ViewChild('content', { static: false }) private content: any;
  segmentChanged(ev: any) {
    console.log('Segment changed', ev);
  }
  
  id: any;
  name: any;
  descritions: any;
  cover: any = '';
  address: any;
  ratting: any;
  time: any;
  totalRatting: any;
  dishPrice: any;
  headerHidden: boolean;
  cusine: any[] = [];
  allRest: any[] = [];
  foods: any[] = [];
  combos: any[] = [];
  dummyFoods: any[] = [];
  categories: any[] = [];
  dummy = Array(5);
  veg: boolean = false;
  totalItem: any = 0;
  totalPrice: any = 0;
  deliveryAddress: any = '';
  foodIds: any[] = [];
  cart: any[] = [];
  itemsc: any[] = [];
  businesstype: any[] = [];
  banners: any[] = [];
  slideOpts = {
    slidesPerView: 1.2,
    spaceBetween: 1
  };
  slideChipCategorias ={
    slidesPerView: 3.2,
    spaceBetween: 2
  };
  slideBusiness = {
    initialSlide: 0,
    slidesPerView: 3.5,
    loop: false,
    centeredSlides: false,
    autoplay: false,
    speed: 500,
    spaceBetween: -20,
  }
  isCategory: boolean = false;
  //Variables Category
  nameCate: any;
  imgCate: any = '';
  statusCate: boolean;
  datosCart: any;
  tipoP: any;
  @Select(GeneralesState.getGenerales) generales$: Observable<any>;
  constructor(
    private route: ActivatedRoute,
    private api: ApisService,
    private util: UtilService,
    private navCtrl: NavController,
    private alertController: AlertController,
    private router: Router,
    private popoverController: PopoverController,
    private modalCtrl: ModalController
  ) { 

  }

  ngOnInit() {
    try {
      this.generales$.subscribe(data => {
        console.log(data);
        if(data.find(e => e.name == 'datosCart')){
        this.datosCart = data.find(e => e.name == 'datosCart').valor;
        }else{
          this.datosCart = { totalItem: false };
        }
      });
    
      this.route.queryParams.subscribe(data => {
        if (data.hasOwnProperty('id')) {
          this.id = data.id;
          this.isCategory = (data.isCategory != undefined) ? (data.isCategory != 'true') ? false : true : false;
          if (!this.isCategory) {
            this.getVenueDetails();
          } else {
            this.getCategory();
          }
          /*if (localStorage.getItem('datosCart')) {
            this.datosCart = JSON.parse(localStorage.getItem('datosCart'));
          } else {
            this.datosCart = { totalItem: false };
          }*/
        }
      }); 

       /*esta funcion trae las promociones de un restaurante en especifico */
       this.api.getColletion().collection('promociones').snapshotChanges().subscribe( (promociones:any) => {
        this.banners= [];
        promociones.map(element => {
            let item = element.payload.doc.data();
            if (item.estado == 'active' && item.comercioID == this.id) {
            item.id = element.payload.doc.id;
            this.banners.push(item);
            }
          });
        });
    } catch (error) {
      console.log(error);
    }

  }

  getAddress() {
    const address = JSON.parse(localStorage.getItem('deliveryAddress'));
    if (address && address.address) {
      this.deliveryAddress = address.address;
    }
    return this.deliveryAddress;
  }


  async getVenueDetails() {

    // Venue Details
    try {

      let data = await this.api.getCommerceDetails(this.id).then(data => data);
      if (data) {
        this.name = data.nombreComercial;
        this.descritions = data.descripcion;
        this.cover = data.imagen;
        this.address = data.direccion;
        this.ratting = data.calificacion ? data.calificacion : 0;
        this.totalRatting = data.calificacionTotal ? data.calificacionTotal : 2;
        //this.dishPrice = data.dishPrice;
        this.time = data.tiempoEntrega;
        //this.cusine = data.cusine;

        //const vid = localStorage.getItem('vid');
        /* if (vid && vid !== this.id) {
          this.dummy = [];
          this.presentAlertConfirm();
          return false;
        } */
        localStorage.setItem('rest', this.id);
        //this.getCates();
        await this.getFoods();
      }
    } catch (error) {
      console.log(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    }
  }

  onScroll(event) {
    if (event.detail.deltaY > 0 && this.headerHidden) return;
    if (event.detail.deltaY < 0 && !this.headerHidden) return;
    if (event.detail.deltaY > 80) {
      this.headerHidden = true;
    } else {
      this.headerHidden = false;
    }
  }
  async onSearchChange(event) {   
    if  (event.detail.value.trim() != ''){
               
     this.foods= this.dummyFoods.filter(e=>e.nombre.indexOf(event.detail.value) > -1);
         
    } 
  }

  async reloadView() {   
    this.foods = [];
    await this.getFoods();
  }
  getCategory() {
    this.api.getCategorie(this.id).then(cate => {
      if (cate) {
        this.nameCate = cate.nombre;
        this.imgCate = cate.imagen;
        this.statusCate = cate.estado;
        this.tipoP = cate.tipo;
        this.getProductsByCate();
      }
    }, error => {
      console.log(error);
      this.dummy = [];
      this.util.errorToast(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      this.dummy = [];
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }
  //AQUI CAMBIE
  async getProductsByCate() {
    try {
      
      await this.util.show('Cargando productos');
      let foods = await this.api.getProductsByCate(this.id).then(foods => foods);
      if (foods) {
        this.dummy = [];
        this.foods = [];
        this.dummyFoods = [];
        for (let element of foods) {
          if (element /*&& element.estado === "approved"*/) {
            if (!this.itemsc.includes(element.productoCategoriaID)) {
              element.productoCategoria = await this.api.getCategorie(element.productoCategoriaID).then(data => data);
              this.itemsc.push(element.productoCategoria.id);
              this.categories.push(element.productoCategoria);
            }else{
              element.productoCategoria =this.categories.find(e=>e.id ==element.productoCategoriaID);
            }
            const info = {
              imagen: element.imagen,
              descripcion: element.descripcion,
              id: element.id,
              nombre: element.nombre,
              precio: element.precio,
              calificacion: element.calificacion,
              //uid: element.uid,
              //veg: element.veg,
              cantidad: 0,
              tamano: element.tamano,
              variaciones: element.variaciones,
              totalCalificacion: element.totalCalificacion ? element.totalCalificacion : 0,
              productoCategoria: element.productoCategoria,
              comercioCategoria: element.comercioCategoria,
              restricciones: element.restricciones || []
              //selectedItem: []
            };
            this.foods.push(info);
            this.dummyFoods.push(info);            
          }
        }
        this.categories.sort((a,b) =>(a.nombre > b.nombre ? 1 :a.nombre < b.nombre ? -1 :0));
        this.foods.sort((a,b) =>(a.nombre > b.nombre ? 1 :a.nombre < b.nombre ? -1 :0));
      }
      if (!this.foods.length || this.foods.length === 0) {
        this.util.errorToast(this.util.translate('No Foods found'));
        this.navCtrl.back();
        return false;
      }
      
      this.util.hide();
    } catch (error) {
      console.log(error);
      this.dummy = [];
      this.util.errorToast(this.util.translate('Something went wrong'));
    }
  }

  async getFoods() {
    try {
      await this.util.show('Cargando productos');
      let foods = await this.api.getProductosComerces(this.id).then(foods => foods);
      if (foods) {
        // if()
        this.dummy = [];
        this.foods = [];
        this.dummyFoods = [];
        for (let element of foods) {
          if (element) {
            if (!this.itemsc.includes(element.productoCategoriaID)) {
              element.productoCategoria = await this.api.getCategorie(element.productoCategoriaID).then(data => data);
              this.itemsc.push(element.productoCategoria.id);
              this.categories.push(element.productoCategoria);
            }else{
              element.productoCategoria =this.categories.find(e=>e.id == element.productoCategoriaID);
            }
            const info = {
              imagen: element.imagen,
              descripcion: element.descripcion,
              id: element.id,
              nombre: element.nombre,
              precio: element.precio,
              calificacion: element.calificacion,
              cantidad: 0,
              tamano: element.tamano,
              variaciones: element.variaciones,
              totalCalificacion: element.totalCalificacion ? element.totalCalificacion : 0,
              productoCategoria: element.productoCategoria,
              comercioCategoria: element.comercioCategoria,
              restricciones: element.restricciones || []
            };
            this.foods.push(info);
            this.dummyFoods.push(info);            
          }
        }
        this.categories.sort((a,b) =>(a.nombre > b.nombre ? 1 :a.nombre < b.nombre ? -1 :0));
        this.foods.sort((a,b) =>(a.nombre > b.nombre ? 1 :a.nombre < b.nombre ? -1 :0));
        this.combos = this.foods.filter(e=>e.productoCategoria.nombre == 'PROMOCIONES');
        this.util.hide();
        if (!this.foods.length || this.foods.length === 0) {
          this.util.errorToast(this.util.translate('No Foods found'));
          this.navCtrl.back();
          return false;
        }
        //this.changeStatus();
        //this.checkCart();
      }

    } catch (error) {
      console.log(error);
      this.dummy = [];
      this.util.errorToast(this.util.translate('Something went wrong'));
    }
  }
  /*
    checkCart() {
      const userCart = localStorage.getItem('userCart');
      if (userCart && userCart !== 'null' && userCart !== undefined && userCart !== 'undefined') {
        const cart = JSON.parse(userCart);
        cart.forEach(element => {
          if (this.foodIds.includes(element.id)) {
            const index = this.foods.findIndex(x => x.id === element.id);
            console.log('index---<', index);
            this.foods[index].quantiy = element.quantiy;
            this.foods[index].selectedItem = element.selectedItem;
          }
        });
        this.calculate();
      }
    }*/
  back() {
    this.navCtrl.navigateRoot(['tabs']);
  }

  getCusine(cusine) {
    return cusine.join('-');
  }/*
  add(index) {
    this.api.checkAuth().then((user) => {
      if (user) {
        const vid = localStorage.getItem('vid');
        if (vid && vid !== this.id) {
          this.presentAlertConfirm();
          return false;
        }
        if (this.foods[index].variations && this.foods[index].variations.length) {
          console.log('open modal');
          this.openVariations(index);
        } else {
          this.foods[index].quantiy = 1;
          this.calculate();
        }
      } else {
        this.router.navigate(['login']);
      }
    }).catch(error => {
      console.log(error);
    });


  }*/
  /*
    statusChange() {
      console.log('status', this.veg);
      //this.changeStatus();
    }*/
  /*calculate() {
     // this.dummy = [];
     // console.log('khaliiii', this.dummy);
     // console.log(this.foods);
     // let item = this.foods.filter(x => x.quantiy > 0);
     // console.log(item);
     // this.totalPrice = 0;
     // this.totalItem = 0;
     // item.forEach(element => {
     //   this.totalItem = this.totalItem + element.quantiy;
     //   this.totalPrice = this.totalPrice + (parseFloat(element.price) * parseInt(element.quantiy));
     // });
     // this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
     // console.log('total item', this.totalItem);
     // if (this.totalItem === 0) {
     //   this.totalItem = 0;
     //   this.totalPrice = 0;
     // }
     this.dummy = [];
     console.log('khaliiii', this.dummy);
     console.log(this.foods);
     let item = this.foods.filter(x => x.quantiy > 0);
     this.foods.forEach(element => {
       if (element.quantiy === 0) {
         element.selectedItem = [];
       }
     });
     console.log('item=====>>', item);
     this.totalPrice = 0;
     this.totalItem = 0;
     this.cart = [];
     console.log('cart emplth', this.cart, item);
     item.forEach(element => {
       this.totalItem = this.totalItem + element.quantiy;
       console.log('itemsss----->>>', element);
       if (element && element.selectedItem && element.selectedItem.length > 0) {
         let subPrice = 0;
         element.selectedItem.forEach(subItems => {
           subItems.item.forEach(realsItems => {
             subPrice = subPrice + (realsItems.value);
           });
           subPrice = subPrice * subItems.total;
         });
         this.totalPrice = this.totalPrice + subPrice;
         // this.totalPrice = this.totalPrice + (subPrice * parseInt(element.quantiy));
       } else {
         this.totalPrice = this.totalPrice + (parseFloat(element.price) * parseInt(element.quantiy));
       }
       this.cart.push(element);
     });
     localStorage.removeItem('userCart');
     console.log('carrrrrrr---->>>', this.cart);
     localStorage.setItem('userCart', JSON.stringify(this.cart));
     this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
     console.log('total item', this.totalItem);
     if (this.totalItem === 0) {
       this.totalItem = 0;
       this.totalPrice = 0;
     }
   }
 
   async setData() {
     const vid = localStorage.getItem('vid');
     console.log('leaving the planet', vid, this.id);
     console.log('total item', this.totalItem);
 
     if (vid && vid === this.id && this.totalPrice > 0) {
       localStorage.setItem('vid', this.id);
       await localStorage.setItem('foods', JSON.stringify(this.foods));
       localStorage.setItem('categories', JSON.stringify(this.categories));
       localStorage.setItem('dummyItem', JSON.stringify(this.dummyFoods));
       localStorage.setItem('totalItem', this.totalItem);
       localStorage.setItem('totalPrice', this.totalPrice);
     } else if (!vid && this.totalItem > 0) {
       localStorage.setItem('vid', this.id);
       await localStorage.setItem('foods', JSON.stringify(this.foods));
       localStorage.setItem('categories', JSON.stringify(this.categories));
       localStorage.setItem('dummyItem', JSON.stringify(this.dummyFoods));
       localStorage.setItem('totalItem', this.totalItem);
       localStorage.setItem('totalPrice', this.totalPrice);
     } else if (this.totalItem == 0) {
       this.totalItem = 0;
       this.totalPrice = 0;
     }
   }
   async ionViewWillLeave() {
     //await this.setData();
   }*/
  // changeStatus() {
  //   this.foods = this.dummyFoods.filter(x => x.veg === this.veg);
  // }
  // addQ(index) {
  //   this.foods[index].quantiy = this.foods[index].quantiy + 1;
  //   this.calculate();
  // }
  // removeQ(index) {
  //   if (this.foods[index].quantiy !== 0) {
  //     this.foods[index].quantiy = this.foods[index].quantiy - 1;
  //   } else {
  //     this.foods[index].quantiy = 0;
  //   }
  //   this.calculate();
  // }

  /*
    async openVariations(index) {
      const modal = await this.modalCtrl.create({
        component: VariationsPage,
        cssClass: 'custom_modal2',
        componentProps: {
          name: this.name,
          food: this.foods[index]
        }
      });
      modal.onDidDismiss().then((data) => {
        console.log('from variations', data.data);
        console.log('data.data', data.role);
        let isValid = false;
        if (data.role === 'new') {
          this.foods[index].quantiy = 1;
          const carts = {
            item: data.data,
            total: 1
          };
          this.foods[index].selectedItem.push(carts);
          isValid = true;
        } else if (data.role === 'sameChoice') {
          this.foods[index].selectedItem = data.data;
          this.foods[index].quantiy = this.foods[index].selectedItem.length;
          isValid = true;
        } else if (data.role === 'newCustom') {
          const carts = {
            item: data.data,
            total: 1
          };
          this.foods[index].selectedItem.push(carts);
          this.foods[index].quantiy = this.foods[index].quantiy + 1;
          isValid = true;
        } else if (data.role === 'remove') {
          console.log('number', data.data);
          this.foods[index].quantiy = 0;
          this.foods[index].selectedItem = [];
          isValid = true;
        } else {
          console.log('empy');
        }
        if (isValid) {
          console.log('isValid', isValid);
          this.calculate();
        }
      });
      return await modal.present();
    }
    addQ(index) {
      console.log('foooduieeeee===========>>', this.foods[index]);
      if (this.foods[index].variations && this.foods[index].variations.length) {
        this.openVariations(index);
      } else {
        this.foods[index].quantiy = this.foods[index].quantiy + 1;
        this.calculate();
      }
    }
  
    removeQ(index) {
      if (this.foods[index].quantiy !== 0) {
        if (this.foods[index].quantiy >= 1 && !this.foods[index].size) {
          this.foods[index].quantiy = this.foods[index].quantiy - 1;
        } else {
          this.openVariations(index);
        }
      } else {
        this.foods[index].quantiy = 0;
      }
      this.calculate();
    }
  *//*
    async presentAlertConfirm() {
      const alert = await this.alertController.create({
        header: this.util.translate('Warning'),
        message: this.util.translate(`you already have item's in cart with different restaurant`),
        buttons: [
          {
            text: this.util.translate('Cancel'),
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirm Cancel: blah');
            }
          }, {
            text: this.util.translate('Clear cart'),
            handler: () => {
              console.log('Confirm Okay');
              localStorage.removeItem('vid');
              this.dummy = Array(10);
              localStorage.removeItem('categories');
              localStorage.removeItem('dummyItem');
              localStorage.removeItem('foods');
              this.totalItem = 0;
              this.totalPrice = 0;
              //this.getCates();
              this.getFoods();
            }
          }
        ]
      });
  
      await alert.present();
    }*/

  viewCart() {
    this.navCtrl.navigateRoot(['tabs/tab3']);
  }

  async presentPopover(ev: any) {
    if (this.categories.length <= 0) {
      return false;
    }
    const popover = await this.popoverController.create({
      component: MenuComponent,
      event: ev,
      componentProps: { data: this.categories },
      mode: 'md',
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

  async s(id) {
        const yOffset = document.getElementById(id).offsetTop;
        const yHOffset = document.getElementById(id).offsetHeight;

        console.log(yOffset + ' : ' + yHOffset);
        this.content.scrollToPoint(0, yOffset, 1000);

  }

  openDetails() {
    const navData: NavigationExtras = {
      queryParams: {
        id: this.id
      }
    };
    this.router.navigate(['rest-details'], navData);
  }
  openDetailsProduct(item) {
    console.log(item);
    const navData: NavigationExtras = {
      queryParams: {
        id: item.id
      }
    };
    this.router.navigate(['product-detail'], navData);
  }

  getCurrency() {
    return this.util.getCurrecySymbol();
  }
}
