import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { Router, NavigationExtras } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AddGenerales } from '../../state/generales.actions';
import { Select, Store } from '@ngxs/store';
import { GeneralesState } from '../../state/generales.state';
import { Observable } from 'rxjs';
import swal from 'sweetalert2';
import { parse } from 'querystring';
declare var google: any;
@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {

  @Select(GeneralesState.getGenerales) generales$: Observable<any>;
  @ViewChild('map', { static: true }) mapElement: ElementRef;
  map: any;
  cantidadPromo= 0;
  haveItems: boolean = false;
  vid: any = '';
  random: any;
  foods: any;
  name: any;
  descritions: any;
  cover: any;
  address: any;
  time: any;
  totalPrice: any = 0;
  totalItem: any = 0;
  serviceTax: any = 0;
  deliveryCharge: any = 0;
  grandTotal: any = 0;
  deliveryAddress: any = '';
  totalRatting: any = 0;
  coupon: any;
  dicount: any;
  comercios: any[] = [];
  observacion: any;

  Deactiveboton: boolean = false;
  id: any;
  myaddress: any[] = [];
  from: any;
  selectedAddress: any;
  dummy = Array(5);
  datosCart: any;
  tarifa: any;
  distanciaTotal: any;
  tiempoTotal: any;
  totalDist: any = 0;
  totalTime: any = 0;
  tarifas: any[] = [];
  commerce: any[] = []
  cart: any[] = [];
  city: any;
  lat: any;
  lng: any;
  fcm_tokenComercioPadre:any;
  metodoPago: any = "efectivo";
  constructor(
    private api: ApisService,
    private router: Router,
    private store: Store,
    private util: UtilService,
    private navCtrl: NavController,
    private chMod: ChangeDetectorRef
  ) {


    this.util.getCouponObservable().subscribe(data => {

      if (data) {
        this.coupon = data;
        localStorage.setItem('coupon', JSON.stringify(data));
        this.updateCard();
        //this.calculate();
      }
    });
 
  }

  async getCities() {
    try {
      let city = await this.api.getCities().then((data) => data);
      this.dummy = [];
      if (city && city.length) {
        this.city = city;
      }
    } catch (error) {
      alert(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    }

  }

  async getAddress() {
    try {
      if (this.city[0].length != 0) {
        let data = await this.api.getMyAddress(localStorage.getItem('uid')).then((data) => data);
        this.dummy = [];
        if (data && data.length) {
          this.myaddress = data;
          this.selectedAddress = this.deliveryAddress.id;
          let tarifas = await this.api.getTarifas(this.city[0].id).then((data: any) => data);
          let ciudad = this.city[0];
          let distancia = parseFloat(ciudad.distance);
          let duracion = parseFloat(ciudad.duration);
          for (const element of tarifas.filter(e => e.nombre == 'moto')) {
            await this.loadMap(this.comercios, 'DRIVING');
            this.tarifa = element.base + (this.totalDist * distancia) + (this.totalTime * duracion);
            let diferencia = 100 - (this.tarifa % 100);
            this.tarifa = this.tarifa + diferencia;
            //this.tarifas.push({nombre:element.nombre,tarifa:this.tarifa, distancia:Math.ceil(this.totalDist),duracion: Math.ceil(this.totalTime/60)});
          }
        }
      } else {
        this.router.navigate(["cities"]);
      }
    } catch (error) {
      console.log(error);
      this.dummy = [];
    }
  }

  async loadMap(lista, tipo) {
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var map = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: parseFloat(lista[0].direcciones[0].lat), lng: parseFloat(lista[0].direcciones[0].lng) },
      disableDefaultUI: true,
      zoom: 100
    });
    const icon = {
      url: 'assets/icon/marker.png',
      scaledSize: new google.maps.Size(50, 50), // scaled size
      origin: new google.maps.Point(0, 0), // origin
      anchor: new google.maps.Point(0, 0) // anchor
    };
    const iconRest = {
      url: 'assets/icon/restaurant.png',
      scaledSize: new google.maps.Size(30, 30), // scaled size
      origin: new google.maps.Point(0, 0), // origin
      anchor: new google.maps.Point(0, 0) // anchor
    };
    const waypts = lista.filter(e => e != lista[0]).map(item => {
      let i = { location: new google.maps.LatLng(parseFloat(item.direcciones[0].lat), parseFloat(item.direcciones[0].lng)), stopover: true };
      let markerCust = new google.maps.Marker({
        map: map,
        position: i.location,
        animation: google.maps.Animation.DROP,
        icon: iconRest,
      });
      markerCust.setMap(map);
      return i;
    });

    var origin1 = { lat: parseFloat(lista[0].direcciones[0].lat), lng: parseFloat(lista[0].direcciones[0].lng) };


    var destinationA = { lat: parseFloat(this.deliveryAddress.lat), lng: parseFloat(this.deliveryAddress.lng) };



    var destinationIcon = 'https://chart.googleapis.com/chart?' +
      'chst=d_map_pin_letter&chld=D|FF0000|000000';
    var originIcon = 'https://chart.googleapis.com/chart?' +
      'chst=d_map_pin_letter&chld=O|FFFF00|000000';

    const custPos = new google.maps.LatLng(origin1.lat, origin1.lng);
    const restPos = new google.maps.LatLng(destinationA.lat, destinationA.lng);




    var marker = new google.maps.Marker({
      map: map,
      position: custPos,
      animation: google.maps.Animation.DROP,
    });
    var markerCust = new google.maps.Marker({
      map: map,
      position: restPos,
      animation: google.maps.Animation.DROP,
      icon: iconRest,
    });
    marker.setMap(map);
    markerCust.setMap(map);

    directionsDisplay.setMap(map);
    // directionsDisplay.setOptions({ suppressMarkers: true });
    directionsDisplay.setOptions({
      polylineOptions: {
        strokeWeight: 4,
        strokeOpacity: 1,
        strokeColor: 'red'
      },
      suppressMarkers: true
    });
    var geocoder = new google.maps.Geocoder;

    var service = new google.maps.DirectionsService;
    let result = null;
    result = await new Promise((resolve, reject) => {
      service.route({
        origin: custPos,
        destination: restPos,
        travelMode: tipo,
        waypoints: waypts,
        optimizeWaypoints: true,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      }, function (response, status) {
        if (status !== 'OK') {
          reject(status);
        } else {
          directionsDisplay.setDirections(response);
          /*  var originList = response.originAddresses;
           var destinationList = response.destinationAddresses;
           var outputDiv = document.getElementById('output'); */

          resolve(response);
        }


      });
    });
    this.totalDist = 0;
    this.totalTime = 0;
    var myroute = result.routes[0];
    for (let i = 0; i < myroute.legs.length; i++) {
      this.totalDist += myroute.legs[i].distance.value;
      this.totalTime += myroute.legs[i].duration.value;
    }
    this.totalDist = this.totalDist / 1000;
  }

  ngOnInit() {
    //this.updateCard();
    this.generales$.subscribe(data => {
      if (data.find(e => e.name == 'Address')) {
        this.deliveryAddress = data.find(e => e.name == 'Address').valor;
      } else {
        this.changeAddress();
      }
    });
  }
  async ionViewWillEnter() {
    /* if (localStorage.getItem('Address')) {
      this.deliveryAddress = JSON.parse(localStorage.getItem('Address'));
    } */
    this.updateCard();
    this.api.getVenueUser('uYlVO29F02axM9Yc9xem4ks8VSX2').then(data =>{
      this.fcm_tokenComercioPadre= data.fcm_token    
      } 
      );
  }
  async updateCard() {
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

    // localStorage.removeItem('comerciosCart');
    // localStorage.setItem('comerciosCart', JSON.stringify(this.comercios));
    await this.getCities();
    await this.getAddress();
    this.grandTotal = this.totalPrice + this.tarifa;
    this.store.dispatch(new AddGenerales({ name: 'datosCart', valor: { totalPrice: this.totalPrice, totalItem: this.totalItem, grandTotal: this.grandTotal } }));
    /*   localStorage.removeItem('datosCart');
      localStorage.setItem('datosCart', JSON.stringify({ totalPrice: this.totalPrice, totalItem: this.totalItem, grandTotal: this.grandTotal })); */
  }

  addMethodPay() {
    this.router.navigate(['payments']);
  }
  Address() {
    const add = JSON.parse(localStorage.getItem('Address'));
    if (add && add.address) {
      this.deliveryAddress = add.address;
    }
    return this.deliveryAddress;
  }
  /*
  getCommerceDetails() {

    // Venue Details
    this.api.getCommerceDetails(this.vid).then(data => {
      console.log(data);
      if (data) {
        this.name = data.tradename;
        this.descritions = data.descritions;
        this.cover = data.cover;
        this.address = data.address;
        this.time = data.time;
        this.totalRatting = data.totalRatting;
      }
    }, error => {
      console.log(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }*/
  /*
    validate() {
  
      this.api.checkAuth().then(async (user) => {
        if (user) {
          const id = await localStorage.getItem('vid');
          console.log('id', id);
          if (id != null) {
            this.vid = id;
            this.getCommerceDetails();
            /*  const foods = await localStorage.getItem('foods');
            if (foods) {
               this.cart.find(e => e.id == id)s = await JSON.parse(foods);
               let recheck = await this.cart.find(e => e.id == id)s.filter(x => x.quantiy > 0);
               console.log('vid', this.vid);
              console.log('foods', this.cart.find(e => e.id == id)s);
              if (this.vid && this.cart.find(e => e.id == id)s && recheck.length > 0) {
                 this.haveItems = true;
                 this.calculate();
                 this.chMod.detectChanges();
               }
             } 
            const cart = localStorage.getItem('userCart');
            try {
              if (cart && cart !== 'null' && cart !== undefined && cart !== 'undefined') {
                this.cart = JSON.parse(localStorage.getItem('userCart'));
                this.calculate();
              } else {
                this.cart = [];
              }
            } catch (error) {
              console.log(error);
              this.cart = [];
            }
  
            console.log('========================>', this.cart);
          } else {
            this.haveItems = false;
            this.chMod.detectChanges();
          }
          this.chMod.detectChanges();
          return true;
        } else {
          this.router.navigate(['login']);
        }
      }).catch(error => {
        console.log(error);
      });
    }*/
  /*onViewWillEnter() {
      this.validate();
    }*/

  getCart() {
    this.navCtrl.navigateRoot(['tabs/tab1']);

  }
  //Este metodo aumenta la cantidad de un producto en el carrito
  addQ(id) {
    debugger
    let cervezas = ['5ctzOl3ODjvIDCcYpYjK', 'XXKnHVNWtxFWUAcRCnbR', 'b3rqnoUGB4Ug4PBM85qg'];
    if ((this.cantidadPromo <= 3 && cervezas.some(a => a == id)) || !cervezas.some(a => a == id) ){
      if (this.cart.some(e => e.id == id)) {
        this.cart.find(e => e.id == id).cantidad = parseInt(this.cart.find(e => e.id == id).cantidad) + 1;
        //this.cart.find(e => e.id == id).total = this.cart.find(e => e.id == id).precio * this.cart.find(e => e.id == id).cantidad;
        this.calcularTotal(id);
        localStorage.removeItem('userCart');
        localStorage.setItem('userCart', JSON.stringify(this.cart));
        this.updateCard();
      }
    } else {
      this.util.showToast("Lo sentimos has alcanzado la capacidad maxima de produtos para la promocion", "warning", "buttom");     
    }
  }
  //este metodo disminuye la cantidad de un producto en el carrito
  removeQ(id) {
    if (this.cart.some(e => e.id == id)) {
      if (parseInt(this.cart.find(e => e.id == id).cantidad) > 0) {
        this.cart.find(e => e.id == id).cantidad = parseInt(this.cart.find(e => e.id == id).cantidad) - 1;
        //this.cart.find(e => e.id == id).total = parseFloat(this.cart.find(e => e.id == id).precio) * parseInt(this.cart.find(e => e.id == id).cantidad);
        this.calcularTotal(id);
        localStorage.removeItem('userCart');
        localStorage.setItem('userCart', JSON.stringify(this.cart));
        this.updateCard();
      } else {
        this.eliminarProducto(id);
      }
    }
  }

  calcularTotal(id) {
    if (this.cart.find(e => e.id == id).restricciones.some(e => e.tipoPrecio == "especifico")) {
      this.cart.find(e => e.id == id).total = 0;
      for (let index = 1; index <= this.cart.find(e => e.id == id).cantidad; index++) {
        if (this.cart.find(e => e.id == id).restricciones.some(e => e.cantidad == index)) {
          this.cart.find(e => e.id == id).total = this.cart.find(e => e.id == id).total + this.cart.find(e => e.id == id).restricciones.find(e => e.cantidad == index).precio;
        } else {
          this.cart.find(e => e.id == id).total = this.cart.find(e => e.id == id).total + this.cart.find(e => e.id == id).precio;
        }
      }
      // this.cart.find(e => e.id == id).total = this.cart.find(e => e.id == id).cantidad * this.cart.find(e => e.id == id).restricciones.find(e=>e.cantidad == this.cart.find(e => e.id == id).cantidad).precio;
    } else
      if (this.cart.find(e => e.id == id).restricciones.some(e => e.cantidad == this.cart.find(e => e.id == id).cantidad)) {
        this.cart.find(e => e.id == id).total = this.cart.find(e => e.id == id).cantidad * this.cart.find(e => e.id == id).restricciones.find(e => e.cantidad == this.cart.find(e => e.id == id).cantidad).precio;
      } else {
          this.cart.find(e => e.id == id).total = this.cart.find(e => e.id == id).cantidad * this.cart.find(e => e.id == id).precio;
      }
    this.aplicarPromoCerveza(id)
  }
  aplicarPromoCerveza(id) {
    let cervezas = ['5ctzOl3ODjvIDCcYpYjK', 'XXKnHVNWtxFWUAcRCnbR', 'b3rqnoUGB4Ug4PBM85qg'];
    this.cantidadPromo = 0;
    let listaUserCart = this.cart.map(e => {
      if (cervezas.some(a => a == e.id)) {
        e.total = 0;
        for (let index = 1; index <= e.cantidad; index++) {
          this.cantidadPromo = this.cantidadPromo + 1;
          if (this.cantidadPromo >= 4) {
            e.total = e.total + (e.precio + 3000);
          } else {
            e.total = e.total + e.precio;
          }
        }

      }
      return e;
    });
  /*   if (cervezas.some(a => a == this.cart.find(e => e.id == id).id)) {

      this.cart.find(e => e.id == id).total = 0;
      for (let index = 1; index <= this.cart.find(e => e.id == id).cantidad; index++) {
        this.cantidadPromo = this.cantidadPromo + 1;
        if (this.cantidadPromo > 2) {
          this.cart.find(e => e.id == id).total = this.cart.find(e => e.id == id).total + (this.cart.find(e => e.id == id).precio + 3000);
        } else {
          this.cart.find(e => e.id == id).total = this.cart.find(e => e.id == id).total + this.cart.find(e => e.id == id).precio;
        }
      }

    } */
    this.cart = listaUserCart;
  }
  eliminarProducto(id) {
    if (this.cart.some(e => e.id == id)) {
      this.cart = this.cart.filter(e => e.id != id);
      localStorage.removeItem('userCart');
      localStorage.setItem('userCart', JSON.stringify(this.cart));
      this.updateCard();
    }
  }
  //ADICIONALES
  /*
    addQAddos(i, j) {
      console.log(this.cart[i].selectedItem[j]);
      this.cart[i].selectedItem[j].total = this.cart[i].selectedItem[j].total + 1;
      this.calculate();
    }
    removeQAddos(i, j) {
      console.log(this.cart[i].selectedItem[j]);
      if (this.cart[i].selectedItem[j].total !== 0) {
        this.cart[i].selectedItem[j].total = this.cart[i].selectedItem[j].total - 1;
        if (this.cart[i].selectedItem[j].total === 0) {
          const newCart = [];
          this.cart[i].selectedItem.forEach(element => {
            if (element.total > 0) {
              newCart.push(element);
            }
          });
          console.log('newCart', newCart);
          this.cart[i].selectedItem = newCart;
          this.cart[i].quantiy = newCart.length;
        }
      }
      this.calculate();
    }
  */
  /// NEW calc
  /*
    async calculate() {
      console.log(this.cart.find(e => e.id == id)s);
      // new
      let item = this.cart.filter(x => x.quantiy > 0);
      this.cart.forEach(element => {
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
        } else {
          this.totalPrice = this.totalPrice + (parseFloat(element.price) * parseInt(element.quantiy));
        }
        this.cart.push(element);
      });
      localStorage.removeItem('userCart');
      console.log('carrrrrrr---->>>', this.cart);
      localStorage.setItem('userCart', JSON.stringify(this.cart));
      this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
      // new
  
      console.log('total item', this.totalItem);
      console.log('=====>', this.totalPrice);
      const tax = (parseFloat(this.totalPrice) * 19) / 100;
      this.serviceTax = tax.toFixed(2);
      console.log('tax->', this.serviceTax);
      this.deliveryCharge = 5000;
      this.grandTotal = parseFloat(this.totalPrice) /* + parseFloat(this.serviceTax)   + parseFloat(this.deliveryCharge);
      this.grandTotal = this.grandTotal.toFixed(2);
      if (this.coupon && this.coupon.code && this.totalPrice >= this.coupon.min) {
        if (this.coupon.type === '%') {
          console.log('per');
          function percentage(num, per) {
            return (num / 100) * per;
          }
          const totalPrice = percentage(parseFloat(this.totalPrice).toFixed(2), this.coupon.discout);
          console.log('============>>>>>>>>>>>>>>>', totalPrice);
          this.dicount = totalPrice.toFixed(2);
          this.totalPrice = parseFloat(this.totalPrice) - totalPrice;
          // this.totalPrice = totalPrice;
          console.log('------------>>>>', this.totalPrice);
          this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
          const tax = (parseFloat(this.totalPrice) * 21) / 100;
          this.serviceTax = tax.toFixed(2);
          console.log('tax->', this.serviceTax);
          this.deliveryCharge = 5000;
          this.grandTotal = parseFloat(this.totalPrice) /* + parseFloat(this.serviceTax)  + parseFloat(this.deliveryCharge);
          this.grandTotal = this.grandTotal.toFixed(2);
        } else {
          console.log('curreny');
          const totalPrice = parseFloat(this.totalPrice) - this.coupon.discout;
          console.log('============>>>>>>>>>>>>>>>', totalPrice);
          this.dicount = this.coupon.discout;
          this.totalPrice = totalPrice;
          console.log('------------>>>>', this.totalPrice);
          this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
          const tax = (parseFloat(this.totalPrice) * 21) / 100;
          this.serviceTax = tax.toFixed(2);
          console.log('tax->', this.serviceTax);
          this.deliveryCharge = 5000;
          this.grandTotal = parseFloat(this.totalPrice)/*  + parseFloat(this.serviceTax) + parseFloat(this.deliveryCharge);
          this.grandTotal = this.grandTotal.toFixed(2);
        }
      } else {
        console.log('not satisfied');
        this.coupon = null;
        localStorage.removeItem('coupon');
      }
      console.log('grand totla', this.grandTotal);
      if (this.totalItem === 0) {
        const lng = localStorage.getItem('language');
        const selectedCity = localStorage.getItem('selectedCity');
        await localStorage.clear();
        localStorage.setItem('language', lng);
        localStorage.setItem('selectedCity', selectedCity);
        this.totalItem = 0;
        this.totalPrice = 0;
        this.haveItems = false;
      }
    }*/
  // NEW calc

  getCurrency() {
    return this.util.getCurrecySymbol();
  }

  changeAddress() {
    const navData: NavigationExtras = {
      queryParams: {
        from: 'cart'
      }
    };
    this.router.navigate(['choose-address'], navData);
  }
  checkout() {
    if (this.grandTotal < 0) {
      this.util.errorToast(this.util.translate('Something went wrong'));
      return false;
    } else {

      this.createServicio();

    }

  }

  async createServicio() {
    try {
      if (this.metodoPago == "efectivo") {
        let data = await swal.fire({
          title: this.util.translate('Are you sure?'),
          //text: this.util.translate('Orders once placed cannot be cancelled and are non-refundable'),
          icon: 'question',
          showCancelButton: true,
          backdrop: true,
          background: 'white',
          confirmButtonText: this.util.translate('Yes'),
          cancelButtonText: this.util.translate('cancel'),
        }).then((data) => data);
        if (data && data.value) {

          this.util.show('Creando servicio');
          let autenticado = await this.api.checkAuth().then((data: any) => data);
          if (autenticado) {
            this.Deactiveboton = false;
            // not from saved address then create new and save
            this.dummy = Array(5);/* 
        localStorage.removeItem('datosCart');
        localStorage.removeItem('userCart');
        localStorage.removeItem('comercios'); */
            const uid = localStorage.getItem('uid');
            const lng = localStorage.getItem('language');
            //const selectedCity = localStorage.getItem('selectedCity');
            //localStorage.clear();
            localStorage.setItem('uid', uid);
            localStorage.setItem('language', lng);
            // localStorage.setItem('selectedCity', selectedCity);
            const param = {
              clienteID: autenticado.uid,
              productos: JSON.stringify(this.cart.map((p) => {
                delete p.comercio;
                return p;
              })),
              fecha: new Date().toString(),
              direccion: this.deliveryAddress,
              identificador: this.util.makenumid(6),
              subTotal: this.totalPrice,
              total: this.grandTotal,
              tarifas: JSON.stringify(this.tarifas),
              comercios: JSON.stringify(this.comercios.map((c) => {
                if (c.descuentoID) {
                  return { id: c.id, direccionComercial: c.direcciones, nombreComercial: c.nombreComercial, subTotal: c.totalPrice, total: c.total, descuentoID: c.descuentoID, descuento: c.descuento, tipoDescuento: c.tipoDescuento, estado: 'created', pago: '' }
                } else {
                  return { id: c.id, direccionComercial: c.direcciones, nombreComercial: c.nombreComercial, subTotal: c.totalPrice, total: c.total, descuentoID: '', descuento: null, tipoDescuento: '', estado: 'created', pago: 'efectivo' }
                }

              })),
              //serviceTax: this.serviceTax, 
              domicilio: this.tarifa,
              estado: 'created',
              observacion: this.observacion ? this.observacion : "",
              pago: 'efectivo',
              // driverId: this.drivers[0].uid,
              // dId: this.drivers[0].uid,
              modena: 'cod',
            };
            let servicio = await this.api.createOrder(param).then((data) => data);
            if (servicio) {
              let comercios = this.comercios.map((c) => {
                if (c.descuentoID) {
                  return { comercioID: c.id, nombreComercial: c.nombreComercial, subTotal: c.totalPrice, total: c.total, descuentoID: c.descuentoID, descuento: c.descuento, tipoDescuento: c.tipoDescuento, estado: 'created', pago: 'efectivo' }
                } else {
                  return { comercioID: c.id, nombreComercial: c.nombreComercial, subTotal: c.totalPrice, total: c.total, descuentoID: '', descuento: null, tipoDescuento: '', estado: 'created', pago: 'efectivo' }
                }

              });
              for (const iterator of comercios) {
                await this.api.createOrderServicio({ servicioID: servicio.id, ...iterator }).then(data => data);
              }
              for (let c of this.comercios) {
                this.api.getVenueUser(c.usuarioID).then((data: any) => {
                  if (data) {
                    this.api.sendNotification(this.util.translate('New Order Received'), this.util.translate('New Order'), data.fcm_token, 'comercio').subscribe((data) => data);
                    //this.api.sendNotification(this.comercios[0].nombreComercial, this.util.translate('New Order'), this.fcm_tokenComercioPadre, 'comercio').subscribe((data) => data);

                  }
                });
              }
              this.util.hide();
              /*  for (let c of this.comercios) {
                 let authComcercio = await this.api.getVenueUser(c.usuarioID).then((data: any) => data);
                 if (authComcercio && authComcercio.fcm_token !== '') {
                   await this.api.sendNotification(this.util.translate('New Order Received'), this.util.translate('New Order'), authComcercio.fcm_token).subscribe((data) => data);
                 }
               } */
              localStorage.removeItem('datosCart');
              localStorage.removeItem('userCart');
              localStorage.removeItem('comercios');
              const navData: NavigationExtras = {
                queryParams: {
                  from: 'cart',
                  id: servicio.id
                }
              };
              this.router.navigate(['/history-detail'], navData);
            }
          } else {
            this.util.hide();
          }
        }
      } else {
        this.util.showToast(this.util.translate("Please select a pay method"), 'danger', 'top');

      }

    } catch (error) {
      console.log(error);
      this.util.hide();
      this.util.errorToast(this.util.translate('Something went wrong'));
      this.router.navigate(['tabs']);
      console.log(error);
    }
  }


  openCoupon() {

    this.router.navigate(['coupons']);
  }
}
