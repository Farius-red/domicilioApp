import { Component, OnInit, ViewChild, ElementRef,NgZone } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { Platform, ModalController } from '@ionic/angular';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { AddNewAddressPage } from '../add-new-address/add-new-address.page';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { NavController, PopoverController } from '@ionic/angular';
import { PopoverComponent } from 'src/app/components/popover/popover.component';

import { LoadingController } from '@ionic/angular';
import Swal from 'sweetalert2';
import { AddGenerales } from '../../state/generales.actions';
import { Select, Store } from '@ngxs/store';
declare var google: any;
@Component({
  selector: 'app-choose-address',
  templateUrl: './choose-address.page.html',
  styleUrls: ['./choose-address.page.scss'],
})

export class ChooseAddressPage implements OnInit {

  @ViewChild('map',  {static: false}) mapElement: ElementRef;
  map: any; 
  autocomplete: { input: string; };
  autocompleteItems: any[];
  location: any;
  placeid: any;
  GoogleAutocomplete: any;
  GoogleComponentRestrictions:any;
  lat: any;
  lng: any;
  address: any;
  poly: any[] = [];
  verifAddress: Boolean= false;
  myaddress: any[] = [];
  selectedAddress: any;
  selelectdID: any;

  id: any;;
  from: any;
  cart: any[] = [];
  dummy = Array(5);
  comercios: any[] = [];
  datosCart: any;
  deliveryCharge: any;
  deliveryAddress: any;
  coupon: any;
  tarifa: any;
  tarifaB: any;
  distanciaTotal: any;
  tiempoTotal: any;
  totalDist:any=0;
  totalTime:any=0;
  
  tarifas:any[] = [];  
  tarifasB:any[] = [];
  
  constructor(
    private platform: Platform,
    private androidPermissions: AndroidPermissions,
    private diagnostic: Diagnostic,
    public geolocation: Geolocation,
    private router: Router,
    private api: ApisService,
    private util: UtilService,
    private store: Store,
    public navCtrl: NavController,
    private route: ActivatedRoute,
    private popoverController: PopoverController,
    public loadingController: LoadingController,
    public modalController: ModalController,
    private nativeGeocoder: NativeGeocoder,    
    public zone: NgZone,
  ) {
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.GoogleComponentRestrictions 
    this.autocomplete = { input: '' };
    this.autocompleteItems = [];
    try {
      this.api.checkAuth().then((user: any) =>{
        if (user) {
       localStorage.setItem('uid', user.uid);
       //this.getLocation();
     } else {
       this.router.navigate(['login']);
     }
      }); 
       this.api.getColletion().collection('direcciones',ref=>ref.where("usuarioID","==",localStorage.getItem('uid'))).snapshotChanges().subscribe(async (data:any) => {
        //await this.api.getMyAddress(localStorage.getItem('uid')).then((data) => data);
       this.dummy = [];      
       this.myaddress = [];
        data.map((item) =>{
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
       this.dummy = [];
     }
  }

  async presentModal(item) {
    const modal = await this.modalController.create({
      component: AddNewAddressPage,
      cssClass: 'my-custom-class',
      swipeToClose: true,  
      componentProps: {
      'item': item
     }
    });
    return await modal.present();
}

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      'dismissed': true
    });
  }
  

 async selectAddress(item) {
    try {      
      if (this.from == 'home') {
        const selecte = this.myaddress.find(x => x.id == item.id);
        const dates = selecte;
        console.log(dates);
        const address = {
          address: dates.direccion,
          lat: dates.lat,
          lng: dates.lng,
          id: dates.id
        };
        this.store.dispatch(new AddGenerales({ name: 'Address', valor: address }));
        //this.router.navigate(['history-details']);    
     
            for (const element of this.myaddress) {
              if(element.id != item.id){
                await this.api.getColletion().collection('direcciones').doc(element.id).update({ estado:false});
              }else{
                await this.api.getColletion().collection('direcciones').doc(element.id).update({ estado:true}); 
              }
            }  
            this.router.navigate(['tabs/tab1']); 
      }
    } catch (error) {
      console.log(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    }
  }

  async ngOnInit() {
    this.loadMap();    
    this.route.queryParams.subscribe(data => {
      console.log(data);
      if (data && data.from) {
        this.from = data.from;
      }
    });
    if (localStorage.getItem('Address')) {
      this.deliveryAddress = JSON.parse(localStorage.getItem('Address'));
    }
    this.coupon = JSON.parse(localStorage.getItem('coupon'));
    const cart = localStorage.getItem('userCart');
    try {
      if (localStorage.getItem('userCart')) {
        this.cart = JSON.parse(localStorage.getItem('userCart'));
        this.comercios = JSON.parse(localStorage.getItem('comerciosCart'));
        this.datosCart = JSON.parse(localStorage.getItem('datosCart'));
        //this.calculate();
      } else {
        this.cart = [];
      }
    } catch (error) {
      console.log(error);
      this.cart = [];
    }

    /*  let tarifas = await this.api.getTarifas(JSON.parse(localStorage.getItem("selectedCity")).id).then((data: any) => data); 
     console.log(tarifas);
     let ciudad = JSON.parse(localStorage.getItem("selectedCity"));
     let distancia = parseFloat(ciudad.distance);
     let duracion = parseInt(ciudad.duration);
     tarifas.forEach(element => {
       
         this.tarifa = element.base  + (5000 * distancia) + (1200 * duracion);
         console.log(this.tarifa);
       
     }); */

  }

  
  /* obtiene las ciudades */
  async getCities() {
    try {
      let city = await this.api.getCities().then((data) =>data);
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

  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Espere Por favor...',
      duration: 4000
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
    console.log('Loading dismissed!');
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
            this.lat = resp.coords.latitude;
            this.lng = resp.coords.longitude;
            //this.loadMap(resp.coords.latitude, resp.coords.longitude);            
            this.getCurrentAddress(this.lat, this.lng);
          
          }
        });
      }
    });
  }

  async grantRequest() {
  try {
     let diag = await this.diagnostic.isLocationEnabled().then((data) => data);
      if (diag) {
        let resp = await  this.geolocation.getCurrentPosition({ maximumAge: 3000, timeout: 5000, enableHighAccuracy: false }).then((resp) => resp);
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
      let lnb = {lat: parseFloat(element.lat), lng: parseFloat(element.lng)}
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
      this.address = results[0].formatted_address;
      this.verifAddress = this.myaddress.some(e=> e.direccion == this.address);
      var result = results[0];
      console.log(this.address);
      this.lat = parseFloat(lat);
      this.lng = parseFloat(lng);
      var verif = google.maps.geometry.poly.containsLocation(result.geometry.location, area);
      if(!verif){
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
  

  /* async getAddress() {
    try {
     await this.api.getColletion().collection('direcciones',ref=>ref.where("usuarioID","==",localStorage.getItem('uid'))).snapshotChanges().subscribe(async (data:any) => {
       //await this.api.getMyAddress(localStorage.getItem('uid')).then((data) => data);
      this.dummy = [];      
      data = data.map((item) =>{
        let servicio = item.payload.doc.data();
        servicio.id = item.payload.doc.id;
        return servicio;
     });
      if (data && data.length) {
        this.myaddress = data;        
        this.selectedAddress = JSON.parse(localStorage.getItem('Address')).id;
        let tarifas = await this.api.getTarifas(this.poly[0].id).then((data: any) => data); 
        let ciudad = this.poly[0];
        let distancia = parseFloat(ciudad.distance);
        let duracion = parseFloat(ciudad.duration);
        for (const element of tarifas.filter(e => e.nombre == 'moto' )) {
          await this.loadMap(this.comercios, 'DRIVING');
          this.tarifa = element.base + (this.totalDist * distancia) + (this.totalTime * duracion);
          this.tarifas.push({nombre:element.nombre,tarifa:this.tarifa, distancia:Math.ceil(this.totalDist),duracion: Math.ceil(this.totalTime/60)});
        }
      }
    });
    } catch (error) {
      console.log(error);
      this.dummy = [];
    }
  } */

 
  async ionViewWillEnter() {
    let data = await this.api.checkAuth().then((data: any) => data);
      if (data.uid) {
        this.id = data.uid;
        this.getCities();
       // this.getAddress();
      
      }    else {
        this.navCtrl.navigateRoot(['login']);
      }
  }
  openHome(){
    if(this.from == "home"){
      this.router.navigate(['tabs/tab1']); 
    }else{
      this.router.navigate(['tabs/tab1']); 
    }
  }
  openMap(coord){
    
    this.autocompleteItems = []
    this.autocomplete.input = ''
    this.selelectdID = coord.description;
    const navData: NavigationExtras = {
      queryParams: {
        place_id: this.selelectdID
      }
    };
    this.router.navigate(['add-new-address'], navData);
  }

  addNew() {
    this.router.navigate(['add-new-address']);
  }
  payService() {
    this.router.navigate(['payments']);
  }

  loadMap() {
    
    //OBTENEMOS LAS COORDENADAS DESDE EL TELEFONO.
    this.geolocation.getCurrentPosition().then((resp) => {
      let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      } 
      
      //CUANDO TENEMOS LAS COORDENADAS SIMPLEMENTE NECESITAMOS PASAR AL MAPA DE GOOGLE TODOS LOS PARAMETROS.
      this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude); 
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions); 
      this.map.addListener('tilesloaded', () => {
        console.log('accuracy',this.map, this.map.center.lat());
        this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng())
        this.lat = this.map.center.lat()
        this.lng = this.map.center.lng()
      }); 
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }
  getAddressFromCoords(lattitude, longitude) {   
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5    
    }; 
    this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
      .then((result: NativeGeocoderResult[]) => {
        this.address = "";
        let responseAddress = [];
        for (let [key, value] of Object.entries(result[0])) {
          if(value.length>0)
          responseAddress.push(value); 
        }
        responseAddress.reverse();
        for (let value of responseAddress) {
          this.address += value+", ";
        }
        this.address = this.address.slice(0, -2);
      })
      .catch((error: any) =>{ 
        this.address = "Address Not Available!";
      }); 
  }

    //FUNCION DEL BOTON INFERIOR PARA QUE NOS DIGA LAS COORDENADAS DEL LUGAR EN EL QUE POSICIONAMOS EL PIN.
    ShowCords(){
      alert('lat' +this.lat+', long'+this.lng )
    }
    
    //AUTOCOMPLETE, SIMPLEMENTE ACTUALIZAMOS LA LISTA CON CADA EVENTO DE ION CHANGE EN LA VISTA.
    UpdateSearchResults(){
      if (this.autocomplete.input == '') {
        this.autocompleteItems = [];
        return;
      }
      this.GoogleAutocomplete.getPlacePredictions({ input: this.autocomplete.input,  componentRestrictions: { country: 'co' },},
      (predictions, status) => {
        this.autocompleteItems = [];
        this.zone.run(() => {
          predictions.forEach((prediction) => {
      
            this.autocompleteItems.push(prediction);
          });
        });
      });
    }

      //FUNCION QUE LLAMAMOS DESDE EL ITEM DE LA LISTA.
  SelectSearchResult(item) {
    //AQUI PONDREMOS LO QUE QUERAMOS QUE PASE CON EL PLACE ESCOGIDO, GUARDARLO, SUBIRLO A FIRESTORE.
    //HE AÑADIDO UN ALERT PARA VER EL CONTENIDO QUE NOS OFRECE GOOGLE Y GUARDAMOS EL PLACEID PARA UTILIZARLO POSTERIORMENTE SI QUEREMOS.
    alert(JSON.stringify(item));     
    this.placeid = item.place_id; 
  }
  
  
  //LLAMAMOS A ESTA FUNCION PARA LIMPIAR LA LISTA CUANDO PULSAMOS IONCLEAR.
  ClearAutocomplete(){
    this.autocompleteItems = []
    this.autocomplete.input = ''
  }
 
 
  
 /*  async loadMap(lista,tipo,lat,lng) {
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


    var destinationA = { lat: lat, lng: lng };


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
    let result =null;
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
         
          resolve(response);
        }


      });
    });
  } */
  
  async createServicio(tipo) {
    try {
      // this.util.show('creating order');
      
      let autenticado = await this.api.checkAuth().then((data: any) => data);
      if (autenticado) {
        // not from saved address then create new and save
        
        this.dummy = Array(5);
        localStorage.removeItem('datosCart');
        localStorage.removeItem('userCart');
        localStorage.removeItem('comercios');
        const uid = localStorage.getItem('uid');
        const lng = localStorage.getItem('language');
        const selectedCity = localStorage.getItem('selectedCity');
        localStorage.clear();
        localStorage.setItem('uid', uid);
        localStorage.setItem('language', lng);
        localStorage.setItem('selectedCity', selectedCity);
        const param = {
          clienteID: autenticado.uid,
          productos: JSON.stringify(this.cart.map((p) => {
            delete p.comercio;
            return p;
          })),
          fecha: new Date().toString(),
          direccion: tipo?{address:this.address,lat:this.lat,lng:this.lng}:this.deliveryAddress,
          subTotal: this.datosCart.totalPrice,
          total: this.datosCart.grandTotal,
          tarifas:JSON.stringify(this.tarifas),
          comercios: JSON.stringify(this.comercios.map((c) => {
            if (c.descuentoID) {
              return { id: c.id, direccionComercial: c.direcciones, nombreComercial: c.nombreComercial, subTotal: c.totalPrice, total: c.total, descuentoID: c.descuentoID, descuento: c.descuento, tipoDescuento: c.tipoDescuento, estado: 'created' }
            } else {
              return { id: c.id, direccionComercial: c.direcciones, nombreComercial: c.nombreComercial, subTotal: c.totalPrice, total: c.total, descuentoID: '', descuento: null, tipoDescuento: '', estado: 'created' }
            }

          })),
          //serviceTax: this.serviceTax, 
          domicilio: this.tarifa,
          estado: 'created',
          // driverId: this.drivers[0].uid,
          // dId: this.drivers[0].uid,
          modena: 'cod',
        };
        let servicio = await this.api.createOrder(param).then((data) => data);
        if (servicio) {
          let comercios = this.comercios.map((c) => {
            if (c.descuentoID) {
              return { comercioID: c.id, nombreComercial: c.nombreComercial, subTotal: c.totalPrice, total: c.total, descuentoID: c.descuentoID, descuento: c.descuento, tipoDescuento: c.tipoDescuento, estado: 'created' }
            } else {
              return { comercioID: c.id, nombreComercial: c.nombreComercial, subTotal: c.totalPrice, total: c.total, descuentoID: '', descuento: null, tipoDescuento: '', estado: 'created' }
            }

          });
          for (const iterator of comercios) {
            await this.api.createOrderServicio({ servicioID: servicio.id, ...iterator }).then(data => data);
          }
          this.util.hide();
          for (let c of this.comercios) {
            let authComcercio = await this.api.getVenueUser(c.usuarioID).then((data: any) => data);
            if (authComcercio && authComcercio.fcm_token !== '') {
              await this.api.sendNotification(this.util.translate('New Order Received'), this.util.translate('New Order'), authComcercio.fcm_token, 'comercio').subscribe((data) => data);
            }
          }

          Swal.fire({
            title: this.util.translate('Success'),
            text: this.util.translate('Order created'),
            icon: 'success',
            backdrop: false,
            timer: 4000
          });
          this.navCtrl.navigateRoot(['tabs/tab2']);
        }
      } else {
        this.util.hide();
        this.util.errorToast(this.util.translate('Session expired'));
        this.router.navigate(['login']);
      }
    } catch (error) {
     console.log(error);
      this.util.hide();
      this.util.errorToast(this.util.translate('Something went wrong'));
      this.router.navigate(['tabs']);
      console.log(error);
    }
  }

  addCurrentPos(item) {
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

  async openMenu(item, events) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: events,
      mode: 'ios',
    });
    popover.onDidDismiss().then(data => {
      console.log(data.data);
      if (data && data.data) {
        if (data.data === 'edit') {
          const navData: NavigationExtras = {
            queryParams: {
              from: 'edit',
              data: JSON.stringify(item)
            }
          };
          this.router.navigate(['add-new-address'], navData);
        } else if (data.data === 'delete') {
          console.log(item);
          Swal.fire({
            title: this.util.translate('Are you sure?'),
            text: this.util.translate('to delete this address'),
            icon: 'question',
            confirmButtonText: this.util.translate('Yes'),
            backdrop: false,
            background: 'white',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: this.util.translate('cancel')
          }).then(data => {
            console.log(data);
            if (data && data.value) {
              this.util.show();
              this.api.deleteAddress(item.id).then(data => {
                localStorage.removeItem('Address');                
                this.util.hide();
               //  this.getAddress();
              }).catch(error => {
                console.log(error);
                this.util.hide();
              });
            }
          });

        }
      }
    });
    await popover.present();
  }
}
