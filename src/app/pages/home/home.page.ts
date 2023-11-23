import { Component, OnInit } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
import { Router, NavigationExtras } from '@angular/router';
import { ApisService } from 'src/app/services/apis.service';
import { Platform, ModalController, NavController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';

import { AddGenerales } from '../../state/generales.actions';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { ChooseAddressPage } from '../choose-address/choose-address.page';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { orderBy, uniqBy } from 'lodash';
import Swal from 'sweetalert2';
import { GeneralesState } from '../../state/generales.state';

declare var google;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  plt;
  from: any;
  allRest: any[] = [];
  pro: any[] = [];
  allCommerces: any[] = [];
  headerHidden: boolean;
  chips: any[] = [];
  showFilter: boolean;
  lat: any;
  lng: any;
  // address: any; 
  cities: any[] = [];
  dummyRest: any[] = [];
  dummy = Array(50);
  dumm = Array(50);
  haveLocation: boolean;
  nearme: boolean = false;
  profile: any;
  banners: any[] = [];
  commerces: any[] = [];
  filtetCommerces: any[] = [];
  preferidos: any[] = [];
  localAddress: any[] = [];
  selectedAddress: any;
  clasificacion: any;
  currentAddress: any;
  slideOpts = {
    slidesPerView: 1.2,
    spaceBetween: -5
  };

  categories: any[] = [];
  slideCategories = {
    initialSlide: 0,
    slidesPerView: 2,
    loop: false,
    centeredSlides: false,
    autoplay: true,
    speed: 500,
    spaceBetween: -20,
  }
  slideCommerces = {
    initialSlide: 0,
    slidesPerView: 3,
    loop: false,
    centeredSlides: false,
    autoplay: false,
    speed: 100,
    spaceBetween: -5,
  }
  customAlertOptions: any = {
    header: 'Pizza Toppings',
    subHeader: 'Select your toppings',
    message: '$1.00 per topping',
    translucent: true
  };

  customPopoverOptions: any = {
    header: 'Hair Color',
    subHeader: 'Select your hair color',
    message: 'Only select your dominant hair color'
  };

  customActionSheetOptions: any = {
    header: 'Colors',
    subHeader: 'Select your favorite color'
  };
  filtroC: boolean = false;
  cityName: any;
  cityId: any;
  myadress: any[] = [];
  productos: any[] = [];
  idc: any[] = [];
  currentLat: any;
  currentLng: any;
  myaddress: any[] = [];
  poly: any[] = [];
  verifAddress: Boolean = false;
  address: any;
  codAddresss: any;
  cardCurrentLocation: Boolean = false;
  distanx: any;
  totalOrders: any;
  @Select(GeneralesState.getGenerales) generales$: Observable<any>;
  constructor(
    private platform: Platform,
    private androidPermissions: AndroidPermissions,
    private diagnostic: Diagnostic,
    public geolocation: Geolocation,
    private store: Store,
    private router: Router,
    private api: ApisService,
    private util: UtilService,
    private apis: ApisService,
    public modalController: ModalController,
    private navCtrl: NavController,
    private firebaseX: FirebaseX,
  ) {

    const currentLng = this.util.getLanguage();
    /*this.chips = [this.util.translate('Ratting 4.0+'), this.util.translate('Fastest Delivery'), this.util.translate('Cost')];*/
    // ['Ratting 4.0+', 'Fastest Delivery', 'Cost'];
    this.haveLocation = false;
    if (this.platform.is('ios')) {
      this.plt = 'ios';
    } else {
      this.plt = 'android';
    }


    if (localStorage.getItem('uid')) {
      this.firebaseX.getToken()
        .then(token => {
          this.api.updateProfile(localStorage.getItem('uid'), { fcmToken: token });
          console.log(`The token is ${token}`)
        }) // save the token server-side and use it to push notifications to this device
        .catch(error => console.error('Error getting token', error));

      this.firebaseX.onMessageReceived()
        .subscribe(data => console.log(`User opened a notification ${data}`));

      this.firebaseX.onTokenRefresh()
        .subscribe((token: string) => {
          this.api.updateProfile(localStorage.getItem('uid'), { fcmToken: token });
          console.log(`The token is ${token}`)
        });
      this.api.getColletion().collection('servicios', ref => ref.where('clienteID', '==', localStorage.getItem('uid'))).snapshotChanges().subscribe((data: any) => {
        if (data) {
          this.totalOrders = 0;
          let countOrders = data.map((item) => {
            let servicio = item.payload.doc.data();
            return servicio;
          });
          this.totalOrders = countOrders.filter(element => element.estado == "doing" || element.estado == "ongoing" || element.estado == "created").length;
          console.log(this.totalOrders);
          //this.getMyOrders();
        }
      });
    }


    const city = JSON.parse(localStorage.getItem('selectedCity'));
    if (city && city.name) {
      this.cityName = city.name;
      this.cityId = city.id;
      //this.getRest();
    }
    try {
      this.api.checkAuth().then((user: any) => {
        if (user.uid) {
          localStorage.setItem('uid', user.uid);
          //this.getLocation();
          this.getProd();
          this.getProfile();
        } else {
          this.router.navigate(['login']);
        }
      });

      this.api.getColletion().collection('direcciones', ref => ref.where("usuarioID", "==", localStorage.getItem('uid'))).snapshotChanges().subscribe(async (data: any) => {
        //await this.api.getMyAddress(localStorage.getItem('uid')).then((data) => data);
        this.dummy = [];
        this.myaddress = [];
        data.map((item) => {
          let servicio = item.payload.doc.data();
          servicio.id = item.payload.doc.id;
          this.myaddress.push(servicio);
        });

        if (this.myaddress.length > 0) {
          if (!this.address) {
            this.address = this.myaddress[0].id;
            const address = {
              address: this.myaddress[0].direccion,
              lat: this.myaddress[0].lat,
              lng: this.myaddress[0].lng,
              id: this.myaddress[0].id
            };
            //localStorage.setItem('Address', JSON.stringify(address));
            this.store.dispatch(new AddGenerales({ name: 'Address', valor: address }));
          }
          /*  if(localStorage.getItem('Address') && this.comercios.length > 0 ){
             this.selectedAddress = JSON.parse(localStorage.getItem('Address')).id;
           let tarifas = await this.api.getTarifas(this.poly[0].id).then((data: any) => data); 
           let ciudad = this.poly[0];
           let distancia = parseFloat(ciudad.distance);
           let duracion = parseFloat(ciudad.duration);
           this.tarifas = [];
           this.tarifasB = [];
           for (const element of tarifas.filter(e => e.nombre == 'moto' )) {
             let totales;
             totales = await this.loadMap(this.comercios, 'DRIVING',this.deliveryAddress.lat,this.deliveryAddress.lng);
             this.tarifa = element.base + (totales.totalDist * distancia) + (totales.totalTime * duracion);
             this.tarifas.push({nombre:element.nombre,tarifa:this.tarifa, distancia:Math.ceil(totales.totalDist),duracion: Math.ceil(totales.totalTime/60)});
  
             totales= await this.loadMap(this.comercios, 'DRIVING',this.lat,this.lng);
             this.tarifaB = element.base + (totales.totalDist * distancia) + (totales.totalTime * duracion);
             this.tarifasB.push({nombre:element.nombre,tarifa:this.tarifaB, distancia:Math.ceil(totales.totalDist),duracion: Math.ceil(totales.totalTime/60)});
           
           }
          }  */

        }
      });

    } catch (error) {
      console.log(error);
    }

    this.iniciar();
  }

  goToOrders() {
    this.navCtrl.navigateRoot(['tabs/tab2']);
  }
  async ngOnInit() {
    this.iniciar();
    this.generales$.subscribe(data => {
      if (data.find(e => e.name == 'Address')) {
        let addres = data.find(e => e.name == 'Address').valor;
        this.address = addres.id;
        this.codAddresss = addres.address;
        this.lat = parseFloat(addres.lat);
        this.lng = parseFloat(addres.lng);
        this.checkCurrentLocation();
        this.nearMe();
      } else {
        this.address = null;
        this.lat = null;
        this.lng = null;
      }
    });

  }
  /*  async getAddress() {
    
      
    } */

  addFilter(index) {
    console.log(index);
    if (index === 0) {
      this.allRest = orderBy(this.allRest, 'ratting', 'desc');
    } else if (index === 1) {
      this.allRest = orderBy(this.allRest, 'time', 'asc');
    } else {
      this.allRest = orderBy(this.allRest, 'dishPrice', 'asc');
    }
    this.allRest = uniqBy(this.allRest, 'id');
  }

  getCities() {
    this.api.getCities().then((data) => {
      console.log(data);
      this.dummy = [];
      if (data && data.length) {
        data.forEach(element => {
          if (element && element.status === 'activo') {
            this.cities.push(element);
          }
        });
      }
    }).catch(error => {
      console.log(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
      this.dummy = [];
    });
  }

  async iniciar() {
    try {
      let user = await this.api.checkAuth().then((user: any) => user);
      if (user.uid) {
        this.commerces = [];
        this.dummyRest = [];
        this.address = '';
        this.api.getColletion().collection('direcciones', ref => ref.where("usuarioID", "==", localStorage.getItem('uid'))).snapshotChanges().subscribe((data: any) => {
          this.myadress = [];
          this.myadress = data.map((item) => {
            let servicio = item.payload.doc.data();
            servicio.id = item.payload.doc.id;
            return servicio;
          });
          this.dummy = [];
          if (this.myadress.length > 0) {
            let activeA = this.myadress.find(e => e.estado == true);
            /*     if (this.address == '') {    */
            this.address = activeA.id;
            this.codAddresss = activeA.direccion;
            const address = {
              address: activeA.direccion,
              lat: activeA.lat,
              lng: activeA.lng,
              id: activeA.id
            };
            //localStorage.setItem('Address', JSON.stringify(address));
            this.store.dispatch(new AddGenerales({ name: 'Address', valor: address }));
            //}
          } else {
            console.log(this.myadress.length),
              this.changeLocation();
          }

        });
        this.dummy = [];
        this.myadress = [];
        this.banners = [];
        this.categories = [];
        this.commerces = [];
        this.dummyRest = [];

        this.api.getColletion().collection('promociones').snapshotChanges().subscribe((venue: any) => {
          this.banners = [];
          venue.map(element => {
            let item = element.payload.doc.data();
            if (item.estado == 'active') {
              item.id = element.payload.doc.id;
              this.banners.push(item);
            }
          });
        });
        this.api.getColletion().collection('comercios').snapshotChanges().subscribe((data: any) => {
          this.commerces = [];
          this.dummyRest = [];
          data.map(element => {
            let item = element.payload.doc.data();
            if (item.estado == 'aprobado') {
              item.id = element.payload.doc.id;
              this.dummyRest.push(item);
            }
          });
          this.nearMe();
        });
        this.api.getColletion().collection('categorias').snapshotChanges().subscribe((data: any) => {
          this.categories = [];
          data.map(element => {
            let item = element.payload.doc.data();
            if (item.tipo == 'comercio' && item.imagen && item.imagen != "" && item.estado == "active") {
              item.id = element.payload.doc.id;
              this.categories.push(item);
            }
          });
        });
        this.categories.sort(function () { return Math.random() - 0.5 });

        /*   if (this.myadress.length == 0){
            console.log(this.myadress);
         this.changeLocation();
          } */
        localStorage.setItem('uid', user.uid);
        //this.getLocation();
        await this.getProfile();
      } else {

        console.log(user);
        this.navCtrl.navigateRoot(['login']);
      }

    } catch (error) {
      console.log(error);
    }
  }
  async ionViewWillEnter() {
    this.iniciar();
    this.getCity();
  }

  degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }
  distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
    const earthRadiusKm = 6356;
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);

    lat1 = this.degreesToRadians(lat1);
    lat2 = this.degreesToRadians(lat2);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }


  openChooseAddress(item) {
    // if (item) {
    //   return false;
    // }
    const navData: NavigationExtras = {
      queryParams: {
        from: 'home'
      }
    };
    this.router.navigate(['choose-address'], navData);
  }

  filtrarComercio(item) {
    this.filtroC = true;
    this.commerces = this.filtetCommerces.filter(e => e.comercioCategoriaID == item.id);
  }

  async checkCurrentLocation() {
    this.cardCurrentLocation = false;
    let distanceLocation = await this.distanceInKmBetweenEarthCoordinates(this.lat, this.lng, this.currentLat, this.currentLng);
    this.distanx = Math.round(distanceLocation * 100);
    if (this.distanx >= 25) {
      this.cardCurrentLocation = true;
    }
  }

  nearMe() {
    this.dummy = Array(5);
    this.allRest = [];
    this.commerces = [];
    this.preferidos = [];
    let dia = new Date().getDay();
    console.log(dia, "dai!")
    this.dummyRest.forEach(async (element) => {
      let horario = JSON.parse(element.horario);
      element.abierto = false;
      horario = horario.filter(e => e.dia == dia);
      horario.sort((a, b) => new Date(a.horaApertura).getTime() - new Date(b.horaApertura).getTime());
      horario.forEach(dias => {

        let horaApertura = new Date(dias.horaApertura).getHours();
        let horaCierre = new Date(dias.horaCierre).getHours();
        let minApertura = new Date(dias.horaApertura).getMinutes();
        let minCierre = new Date(dias.horaCierre).getMinutes();
        if (!element.abierto) {
          if (horaApertura <= new Date().getHours()) {
            if (horaApertura < new Date().getHours() || minApertura < new Date().getMinutes()) {
              if (horaCierre >= new Date().getHours()) {
                if (horaCierre > new Date().getHours() || minCierre > new Date().getMinutes()) {
                  element.abierto = true;
                }
              }
            }
          }
        }
      });
      let lat = parseFloat(element.direcciones[0].lat);
      let lng = parseFloat(element.direcciones[0].lng);
      const distance = await this.distanceInKmBetweenEarthCoordinates(this.lat, this.lng, lat, lng) * 100;
      // Distance
      if (Math.round(distance) <= 500) {
        this.commerces.push(element);
        this.filtetCommerces = this.commerces;
        if (element.promocion == true) {
          this.preferidos.push(element);
        }
      }
    });
    this.dummy = [];

  }

  getRest() {
    this.dummy = Array(10);
    this.api.getCommerces().then(data => {
      if (data && data.length) {
        this.allRest = [];
        data.forEach((element) => {
          if (element.estado == "aprobado") {
            element.tiempoEntrega = new Date(element.tiempoEntrega).toString();
            this.allRest.push(element);
            this.dummyRest.push(element);
          }
        });

        this.dummy = [];
      } else {
        this.allRest = [];
        this.dummy = [];
      }
    }, error => {
      console.log(error);
      this.dummy = [];
    }).catch(error => {
      console.log(error);
      this.dummy = [];
    });
  }

  getProd() {

    this.api.getProductosCalificado().then(data => {

      this.pro = [];
      this.pro = data;
    }, error => {
      console.log(error);
      this.dummy = [];
    }).catch(error => {
      console.log(error);
      this.dummy = [];
    });
  }

  openMenu(item) {
    // if (item) {
    //   return false;
    // }
    const navData: NavigationExtras = {
      queryParams: {
        isCategory: false,
        id: item.id
      }
    };
    this.router.navigate(['category'], navData);
  }

  openPromo(item) {
    // if (item) {
    //   return false;
    // }
    const navData: NavigationExtras = {
      queryParams: {
        isCategory: false,
        id: item.comercioID
      }
    };
    this.router.navigate(['category'], navData);
  }
  async selectAddress() {
    try {

      const selecte = this.myadress.find(x => x.id == this.address);
      if (selecte) {
        const address = {
          address: selecte.direccion,
          lat: selecte.lat,
          lng: selecte.lng,
          id: selecte.id
        };

        this.commerces = [];
        this.store.dispatch(new AddGenerales({ name: 'Address', valor: address }));
        this.nearMe();
      }


    } catch (error) {
      console.log(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    }

  }
  openCategory(item) {
    if (item && item.status === 'close') {
      return false;
    }
    const navData: NavigationExtras = {
      queryParams: {
        isCategory: true,
        id: item.id,
        nombre: item.nombre
      }
    };
    this.router.navigate(['category'], navData);
  }

  openOffers(item) {
    const navData: NavigationExtras = {
      queryParams: {
        id: item.restId
      }
    };
    this.router.navigate(['category'], navData);
  }


  async getCity() {
    try {
      let city = await this.api.getCities().then((data) => data);
      this.dummy = [];
      if (city && city.length) {
        this.poly = city;
      }
      await this.getLocation();
    } catch (error) {
      console.log(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    }

  }
  getLocation() {
    this.platform.ready().then(() => {
      if (this.platform.is('android')) {
        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION).then(
          result => console.log('Has permission?', result.hasPermission),
          err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION)
        );
        this.grantRequest();
      } else if (this.platform.is('ios')) {
        this.grantRequest();
      } else {
        this.geolocation.getCurrentPosition({ maximumAge: 3000, timeout: 5000, enableHighAccuracy: false }).then((resp) => {
          if (resp) {
            console.log('resp', resp);
            this.currentLat = resp.coords.latitude;
            this.currentLng = resp.coords.longitude;
            //this.loadMap(resp.coords.latitude, resp.coords.longitude);            
            this.getCurrentAddress(this.currentLat, this.currentLng);

          }
        });
      }
    });
  }

  async grantRequest() {
    try {
      let diag = await this.diagnostic.isLocationEnabled().then((data) => data);
      if (diag) {
        let resp = await this.geolocation.getCurrentPosition({ maximumAge: 3000, timeout: 5000, enableHighAccuracy: false }).then((resp) => resp);
        if (resp) {
          console.log('resp', resp);
          //this.loadMap(resp.coords.latitude, resp.coords.longitude);
          this.getCurrentAddress(resp.coords.latitude, resp.coords.longitude);
        }
      } else {
        this.diagnostic.switchToLocationSettings();
        let resp = await this.geolocation.getCurrentPosition({ maximumAge: 3000, timeout: 5000, enableHighAccuracy: false }).then((resp) => resp);
        if (resp) {
          console.log('ress,', resp);
          //this.loadMap(resp.coords.latitude, resp.coords.longitude);            
          this.getCurrentAddress(resp.coords.latitude, resp.coords.longitude);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getCurrentAddress(lat, lng) {
    const geocoder = new google.maps.Geocoder();
    const location = new google.maps.LatLng(lat, lng);
    var triangleCoords = [];

    var bounds = new google.maps.LatLngBounds();

    this.poly[0].poly.forEach(element => {
      /* var lnb= new google.maps.LatLng(element.lat, element.lng) */
      let lnb = { lat: parseFloat(element.lat), lng: parseFloat(element.lng) }
      triangleCoords.push(lnb);
      bounds.extend(lnb);
    });

    /* Creamos el poligono */
    var area = new google.maps.Polygon({
      paths: triangleCoords,
      draggable: true, // turn off if it gets annoying
      editable: true,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      fillColor: '#FF0000',
      fillOpacity: 0.35
    });
    let result = await new Promise((resolve, reject) => {
      geocoder.geocode({ 'location': location }, (results, status) => {
        this.currentAddress = results[0].formatted_address;
        this.verifAddress = this.myaddress.some(e => e.direccion == this.address);
        var result = results[0];
        this.currentLat = parseFloat(lat);
        this.currentLng = parseFloat(lng);
        var verif = google.maps.geometry.poly.containsLocation(result.geometry.location, area);
        if (!verif) {
          reject(verif);
          Swal.fire({
            title: this.util.translate('Error'),
            text: this.util.translate('We are sorry. We are not available in your area.'),
            icon: 'error',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: this.util.translate('Need Help?'),
            backdrop: false,
            background: 'white'
          })
          this.router.navigate(['/']);
        }
        resolve(verif);
      });
    });
  }
  async onSearchChange(event) {
    console.log('entro');
    if (event.detail.value.trim() != '') {
      let productos = await this.api.getSearch(event.detail.value).then(data => data);
      let comercios = await this.api.getSearch2(event.detail.value).then(data => data);
      comercios = comercios.map((item) => {
        item.tipo = 'comercio';
        return item;
      });
      productos = productos.map((item) => {
        item.tipo = 'producto';
        return item;
      });
      this.allRest = productos.concat(comercios);
      console.log(this.allRest);

    } else {
      this.allRest = [];
    }

    /*
    this.allRest = this.dummyRest.filter((ele: any) => {
      return ele.name.toLowerCase().includes(event.detail.value.toLowerCase());
    });*/
  }

  addNew() {
    this.router.navigate(['add-new-address']);
  }
  openSearch(item) {

    console.log(item);
    const navData: NavigationExtras = {
      queryParams: {
        id: item.id
      }
    };
    this.router.navigate(['product-detail'], navData);
  }

  openDetailsProd(item) {

    console.log(item);
    const navData: NavigationExtras = {
      queryParams: {
        id: item.id
      }
    };
    this.router.navigate(['product-detail'], navData);
  }

  getCusine(cusine) {
    return cusine.join('-');
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

  getProfile() {
    if (localStorage.getItem('uid')) {

      this.api.getProfile(localStorage.getItem('uid')).then((data) => {
        if (data && data.imagen) {
          this.profile = data.imagen;
        }
        if (data && data.estado === 'deactive') {
          localStorage.removeItem('uid');
          this.api.logout().then(data => {
          });
          this.router.navigate(['login']);
          Swal.fire({
            title: 'Error',
            text: 'Your are blocked please contact administrator',
            icon: 'error',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Need Help?',
            backdrop: false,
            background: 'white'
          }).then(data => {
            if (data && data.value) {
              this.router.navigate(['inbox']);
            }
          });
        }
      }, err => {
        console.log('Err', err);
      }).catch(e => {
        console.log('Err', e);
      });
    }
  }
  /*
    chipChange(item) {
      this.allRest = this.dummyRest;
      if (item === 'Fastest Delivery') {
        this.allRest.sort((a, b) => {
          a = new Date(a.time);
          b = new Date(b.time);
          return a > b ? -1 : a < b ? 1 : 0;
        });
      }
  
      if (item === 'Ratting 4.0+') {
        this.allRest = [];
  
        this.dummyRest.forEach(ele => {
          if (ele.ratting >= 4) {
            this.allRest.push(ele);
          }
        });
      }
  
      if (item === 'Cost') {
        this.allRest.sort((a, b) => {
          a = a.time;
          b = b.time;
          return a > b ? -1 : a < b ? 1 : 0;
        });
      }
  
    }*/
  changeLocation() {
    const navData: NavigationExtras = {
      queryParams: {
        from: 'home'
      }
    };
    this.navCtrl.navigateRoot(['choose-address'], navData);
  }

  getCurrency() {
    return this.util.getCurrecySymbol();
  }
}
