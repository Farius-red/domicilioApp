import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApisService } from 'src/app/services/apis.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { UtilService } from 'src/app/services/util.service';
import { NavController } from '@ionic/angular';
import swal from 'sweetalert2';
import { parse } from 'querystring';
declare var google: any;

@Component({
  selector: 'app-tracker',
  templateUrl: './tracker.page.html',
  styleUrls: ['./tracker.page.scss'],
})
export class TrackerPage implements OnInit {

  @ViewChild('map', { static: true }) mapElement: ElementRef;
  map: any;

  latOri = '';
  longOri = '';

  latDest = '';
  longDest = '';
  id: any = '';

  dName: any = '';
  dLastame: any = '';
  restAddress: any = '';
  dCover: any = '';
  dId: any;
  phone: any = '';
  status: any = '';
  totalOrders: any[] = [];
  grandTotal: any;
  servicioID: any;
  paid:any;

  driverLat: any;
  driverLng: any;
  interval: any;
  userLat: any; 
  userLng: any;

  constructor(
    private route: ActivatedRoute,
    private api: ApisService,
    private adb: AngularFirestore,
    private util: UtilService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(data => {
      console.log('data=>', data.id);
      if (data.hasOwnProperty('id')) {
        this.id = data.id;
        this.getOrder();
      }
    });

  }
  callDriver() {
    // window.open('tel:' + this.phone);
    window.open('https://api.whatsapp.com/send?phone=+57' + this.phone);
  }
 async  getOrder() {
   try {
       this.util.show();
       console.log(this.id);
    let data = await   this.api.getOrderById(this.id).then((order) => order);
      this.util.hide();
      if (data) {
        this.dId = data.conductorID;this.grandTotal = data.total;
        this.status = data.estado;
        data.productos.forEach(element => {
          this.totalOrders = element.cantidad + this.totalOrders;
        });
        if (data.direccion) {
          this.userLat = data.direccion.lat;
          this.userLng = data.direccion.lng;

        }
        if (this.dId){
           await this.getDriverInfo();
        }       
        let lista = data.comercios;
        for (const iterator of lista) {
          iterator.distancia = await this.distanceInKmBetweenEarthCoordinates(
            this.userLat,
            this.userLng,
            parseFloat(iterator.direccionComercial[0].lat),
            parseFloat(iterator.direccionComercial[0].lng));
        }
        lista.sort((a, b) => b.distancia - a.distancia );
        this.loadMap((lista));
      }
   } catch (error) {
     
      console.log('error in orders', error);
      this.util.hide();
      this.util.errorToast('Something went wrong');
   }
  
  }
  degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }


  distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
    console.log(lat1, lon1, lat2, lon2);
    const earthRadiusKm = 6371;
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    lat1 = this.degreesToRadians(lat1);
    lat2 = this.degreesToRadians(lat2);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }
  async getDriverInfo() {
   await this.api.getColletion().collection("servicios").doc(this.id).snapshotChanges().subscribe((data: any) => {
      console.log(data.payload.data());
      if (data) {
        this.status = data.payload.data().estado;
        if (data.payload.data().estado === 'delivered') {
          swal.fire({
            title: this.util.translate('Order Delivered'),
            text: this.util.translate('Your Order is Delivered'),
            icon: 'success',
            backdrop: false,
          });
          this.navCtrl.navigateRoot(['tabs/tab2']);
        }
      }
    }, error => {
      console.log(error);
    });

    let data = await this.api.getProfile(this.dId).then((conductor: any) => conductor );
    
    if (data) {
      this.driverLat = parseFloat(data.lat);
      this.driverLng = parseFloat(data.lng);
      this.dName = data.nombres;
      this.dCover = data.portada;
      this.dLastame = data.apellidos;
      this.phone = data.celular;
    }
  }

  changeMarkerPosition(marker, map) {
    var latlng = new google.maps.LatLng(this.driverLat, this.driverLng);
    map.setCenter(latlng);
    marker.setPosition(latlng);
    console.log("Updating runner position");
  }

  loadMap(lista) {
    let cantidad = lista.length;
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay = new google.maps.DirectionsRenderer();
    var bounds = new google.maps.LatLngBounds;
    var map = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: parseFloat(lista[0].direccionComercial[0].lat), lng: parseFloat(lista[0].direccionComercial[0].lng)},
      disableDefaultUI: true,
      zoom: 100
    });
    const icon = {
      url: 'assets/icon/marker.png',
     scaledSize: new google.maps.Size(50, 50), // scaled size
     // origin: new google.maps.Point(0, 0), // origin
     // anchor: new google.maps.Point(0, 0) // anchor
    };
    const iconRest = {
      url: 'assets/icon/restaurant.png',
      scaledSize: new google.maps.Size(30, 30), // scaled size
      origin: new google.maps.Point(0, 0), // origin
      anchor: new google.maps.Point(0, 30) // anchor
    };
    const waypts = lista.filter(e=>e != lista[0]).map( item=> {
      let i = {location:new google.maps.LatLng( parseFloat(item.direccionComercial[0].lat),parseFloat(item.direccionComercial[0].lng)), stopover: true};
      let markerCust = new google.maps.Marker({
        map: map,
        position: i.location,
        animation: google.maps.Animation.DROP,
        icon: iconRest,
      }); 
      markerCust.setMap(map);
      return i;
    });
    console.log(waypts);
    var origin1 = { lat: parseFloat(lista[0].direccionComercial[0].lat), lng: parseFloat(lista[0].direccionComercial[0].lng) };
    
   
    var destinationA = { lat: this.userLat , lng: this.userLng };

    

    var destinationIcon = 'https://chart.googleapis.com/chart?' +
      'chst=d_map_pin_letter&chld=D|FF0000|000000';
    var originIcon = 'https://chart.googleapis.com/chart?' +
      'chst=d_map_pin_letter&chld=O|FFFF00|000000';
   
    const custPos = new google.maps.LatLng(origin1.lat, origin1.lng);
    const restPos = new google.maps.LatLng(destinationA.lat, destinationA.lng);
    const driverPos = new google.maps.LatLng(this.driverLat, this.driverLng);
  
   

    
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
    var markerDrive = new google.maps.Marker({
      map: map,
      position: driverPos,
      animation: google.maps.Animation.DROP,
       icon: icon     
    })
    marker.setMap(map);
    markerCust.setMap(map);
    markerDrive.setMap(map);

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

    service.route({
      origin: custPos ,
      destination: restPos,
      travelMode: 'DRIVING',
      waypoints: waypts,
      optimizeWaypoints: true,
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    }, function (response, status) {
      if (status !== 'OK') {
        alert('Error was: ' + status);
      } else {
        directionsDisplay.setDirections(response);
       /*  var originList = response.originAddresses;
        var destinationList = response.destinationAddresses;
        var outputDiv = document.getElementById('output'); */
        var totalDist = 0;
        var totalTime = 0;
        var myroute = response.routes[0];
        for (let i = 0; i < myroute.legs.length; i++) {
          totalDist += myroute.legs[i].distance.value;
          totalTime += myroute.legs[i].duration.value;
        }
        totalDist = totalDist / 1000;
        // outputDiv.innerHTML = '';
        // deleteMarkers(markersArray);

 /*        var showGeocodedAddressOnMap = function (asDestination) {
          var icon = asDestination ? destinationIcon : originIcon;
          return function (results, status) {
            if (status === 'OK') {
              map.fitBounds(bounds.extend(results[0].geometry.location));
              // markersArray.push(new google.maps.Marker({
              //   map: map,
              //   position: results[0].geometry.location,
              //   icon: icon
              // }));
            } else {
              alert(this.util.translate('Geocode was not successful due to: ') + status);
            }
          };
        }; */

       /*  directionsService.route({
          origin: origin1,
          destination: destinationA,
          travelMode: 'DRIVING'
        }, function (response, status) {
          if (status === 'OK') {
            directionsDisplay.setDirections(response);
          } else {
            window.alert(this.util.translate('Directions request failed due to ') + status);
          }
        }); */


      /*   for (let i = 0; i < originList.length; i++) {
          let results = response.rows[i].elements;
          geocoder.geocode({ 'address': originList[i] },
            showGeocodedAddressOnMap(false));
          for (let j = 0; j < results.length; j++) {
            geocoder.geocode({ 'address': destinationList[j] },
              showGeocodedAddressOnMap(true));
          }
        } */
      }
    });
    /* this.interval = setInterval(() => {
      this.changeMarkerPosition(marker, map);
    }, 12000); */
  }
  ionViewDidLeave() {
    console.log('leaae');
    clearInterval(this.interval);
  }

  getCurrency() {
    return this.util.getCurrecySymbol();
  }
}
