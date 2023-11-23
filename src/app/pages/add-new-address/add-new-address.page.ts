import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Platform, ModalController} from '@ionic/angular';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';

import { NavController } from '@ionic/angular';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { ActivatedRoute } from '@angular/router';
import { AddGenerales } from '../../state/generales.actions';

import { Select, Store } from '@ngxs/store';
declare var google;

@Component({
  selector: 'app-add-new-address',
  templateUrl: './add-new-address.page.html',
  styleUrls: ['./add-new-address.page.scss'],
})
export class AddNewAddressPage implements OnInit {
  @ViewChild('map', { static: true }) mapEle: ElementRef;
  map: any;
  marker: any;
  lat: any;
  lng: any;
  address: any;
  house: any = '';
  landmark: any = '';
  title: any = 'home';
  id: any;
  from: any;
  usuarioID: any;
  autocomplete: { input: string; };
  autocompleteItems: any[];
  location: any;
  GoogleAutocomplete: any;
  AddressToUp: any[] = [];
  constructor(
    private platform: Platform,
    private androidPermissions: AndroidPermissions,
    private diagnostic: Diagnostic,
    public geolocation: Geolocation,
    private navCtrl: NavController,
    private api: ApisService,
    private util: UtilService,
    public modalController: ModalController,
    private route: ActivatedRoute,  
    private nativeGeocoder: NativeGeocoder, 
    private store: Store,   
  ) {
  
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = { input: '' };
    this.autocompleteItems = [];
    this.route.queryParams.subscribe(data => {
      console.log(data);
      if (data && data.from == "edit") {
        this.from = 'edit';
        const info = JSON.parse(data.data);
        this.address = info.direccion;
        this.house = info.casa;
        this.id = info.id;
        this.landmark = info.puntoReferencia;
        this.lat = info.lat;
        this.lng = info.lng;
        this.usuarioID = info.usuarioID;
        this.loadmap(this.lat, this.lng, this.mapEle);
      } else if (data.place_id){
        this.from = 'new';
        let options: NativeGeocoderOptions = {
        useLocale: true,
        maxResults: 5    
      }; 
      this.nativeGeocoder.forwardGeocode(data.place_id, options)
      .then((result: NativeGeocoderResult[]) => {
        this.lng = result[0].longitude;
        this.lat = result[0].latitude;
      })
      .catch((error: any) =>{ 
        this.address = "Address Not Available!";
      }); 
        this.nativeGeocoder.forwardGeocode(data.place_id, options)
        .then((result: NativeGeocoderResult[]) => {
          this.lng = result[0].longitude;
          this.lat = result[0].latitude;
          this.loadmap(this.lat, this.lng, this.mapEle);
          this.getAddress(this.lat, this.lng);
        })
        .catch((error: any) =>{ 
          this.address = "Address Not Available!";
        });        
      }else{
        this.from = 'new';
        this.getLocation();
      }
    });
  }

  ngOnInit() {
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
        this.geolocation.getCurrentPosition({ maximumAge: 3000, timeout: 10000, enableHighAccuracy: false }).then((resp) => {
          if (resp) {
            console.log('resp', resp);
            this.lat = resp.coords.latitude;
            this.lng = resp.coords.longitude;
            this.loadmap(resp.coords.latitude, resp.coords.longitude, this.mapEle);
            this.getAddress(this.lat, this.lng);
          }
        });
      }
    });
  }

  grantRequest() {
    this.diagnostic.isLocationEnabled().then((data) => {
      if (data) {
        this.geolocation.getCurrentPosition({ maximumAge: 3000, timeout: 10000, enableHighAccuracy: false }).then((resp) => {
          if (resp) {
            console.log('resp', resp);
            this.loadmap(resp.coords.latitude, resp.coords.longitude, this.mapEle);
            this.getAddress(resp.coords.latitude, resp.coords.longitude);
          }
        });
      } else {
        this.diagnostic.switchToLocationSettings();
        this.geolocation.getCurrentPosition({ maximumAge: 3000, timeout: 10000, enableHighAccuracy: false }).then((resp) => {
          if (resp) {
            console.log('ress,', resp);
            this.loadmap(resp.coords.latitude, resp.coords.longitude, this.mapEle);
            this.getAddress(resp.coords.latitude, resp.coords.longitude);
          }
        });
      }
    }, error => {
      // console.log('errir', error);
    }).catch(error => {
      // console.log('error', error);
    });

  }

  loadmap(lat, lng, mapElement) {
    const location = new google.maps.LatLng(this.lat?this.lat:lat, this.lng?this.lng:lng);
    const style = [
      {
        featureType: 'all',
        elementType: 'all',
        stylers: [
          { saturation: -100 }
        ]
      }
    ];

    const mapOptions = {
      zoom: 15,
      scaleControl: false,
      streetViewControl: false,
      zoomControl: false,
      overviewMapControl: false,
      center: location,
      mapTypeControl: false,
      mapTypeControlOptions: {
        mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'youuApp']
      }
    };
    this.map = new google.maps.Map(mapElement.nativeElement, mapOptions);
    var mapType = new google.maps.StyledMapType(style, { name: 'Grayscale' });
    this.map.mapTypes.set('Foodfire5', mapType);
    this.map.setMapTypeId('Foodfire5');
  
    this.addMarker(location);
  }

  getAddress(lat, lng) {
    const geocoder = new google.maps.Geocoder();
    const location = new google.maps.LatLng(lat, lng);
    geocoder.geocode({ 'location': location }, (results, status) => {
      console.log(results);
      this.address = results[0].formatted_address;
      this.lat = lat;
      this.lng = lng;
    });
  }

  
  addMarker(location) {
    console.log('location =>', location)
    const icon = {
      url: 'assets/icon/marker.png',
      scaledSize: new google.maps.Size(50, 50), // scaled size
    }
    this.marker = new google.maps.Marker({
      position: location,
      map: this.map,
      icon: icon,
      draggable: true,
      animation: google.maps.Animation.DROP
    })

    google.maps.event.addListener(this.marker, 'dragend', () => {
      console.log(this.marker);
      this.getDragAddress(this.marker);
    });

  }

  getDragAddress(event) {

    const geocoder = new google.maps.Geocoder();
    const location = new google.maps.LatLng(event.position.lat(), event.position.lng());
    geocoder.geocode({ 'location': location }, (results, status) => {
      console.log(results);
      this.address = results[0].formatted_address;
      this.lat = event.position.lat();
      this.lng = event.position.lng();
    });
  }
  submit() {
    localStorage.setItem('newAddress', this.address);
    localStorage.setItem('newLng', this.lng);
    localStorage.setItem('newLat', this.lat);
    this.navCtrl.back();
  }
  async addAddress() {
    if (this.address === '' ) {
      this.util.errorToast(this.util.translate('All Fields are required'));
      return false;
    }
    try {
      this.util.show();
      let data = await this.api.checkAuth().then((data: any) => data);
      if (data) {
        const param = {
          usuarioID: data.uid,
          direccion: this.address,
          lat: this.lat,
          lng: this.lng,
          titulo: this.title,
          casa: this.house,
          puntoReferencia: this.landmark,
          estado: true
        };
        
        this.store.dispatch(new AddGenerales({ name: 'Address', valor: param }));

        this.api.getColletion().collection('direcciones',ref=>ref.where("usuarioID","==",data.uid).where("estado","==",true)).get().subscribe(async (direcc:any) =>{
          let addresup = direcc.docs.map((item) =>{
                  let servicio = item.data();
                  servicio.id = item.id;
                return servicio;
                });
                this.AddressToUp = addresup;
          for (const element of this.AddressToUp) {
           await this.api.getColletion().collection('direcciones').doc(element.id).update({estado:false});
          }
        await this.api.addNewAddress(param).then((data) => data);
        });
     
  
        
        this.util.hide();
        this.util.showToast(this.util.translate('succesfully added address'), 'success', 'bottom');
        this.navCtrl.navigateRoot(['tabs/tab1']);
      } else {
        this.navCtrl.navigateRoot(['tabs']);
      }

    } catch (error) {
      this.util.hide();
      console.log(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    }
  }

  async updateAddress() {

    if (this.address === '') {
      this.util.errorToast(this.util.translate('All Fields are required'));
      return false;
    }
    try {
      this.util.show();
      let data = await this.api.checkAuth().then((data: any) => data);
      if (data) {
        const param = {
          usuarioID: this.usuarioID,
          direccion: this.address,
          lat: this.lat,
          lng: this.lng,
          titulo: this.title,
          casa: this.house,
          puntoReferencia: this.landmark
        };
        await this.api.updateAddress(this.id, param).then((data) => data);
        this.util.hide();
        this.util.showToast('Address updated', 'success', 'bottom');
        this.navCtrl.navigateRoot(['tabs/tab1']);
      } else {
        this.navCtrl.navigateRoot(['tabs/tab1']);
      }

    } catch (error) {
      this.util.hide();
      console.log(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    }
  }
}
