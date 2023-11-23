import { Component, OnInit } from '@angular/core';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { Router, NavigationExtras } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
//import { OneSignal } from '@ionic-native/onesignal/ngx';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  haveItems: boolean = false;
  myOrders: any[] = [];
  dummy = Array(5);
  constructor(
    private api: ApisService,
    private util: UtilService,
    private router: Router,
    private adb: AngularFirestore,
    //private oneSignal: OneSignal
  ) {
   
   /* this.util.subscribeLoggedIn().subscribe(data => {
      this.getMyOrders();
    });*/
  }

  ngOnInit() {
  }
  async ionViewWillEnter() {
    await this.validate();
    
    if (localStorage.getItem('uid')) {
      this.api.getColletion().collection('servicios', ref => ref.where('clienteID', '==', localStorage.getItem('uid'))).snapshotChanges().subscribe((data: any) => {
        if (data) {
          this.myOrders = data.map((item) =>{
             let servicio = item.payload.doc.data();
             servicio.fechaFormater =  new Date(servicio.fecha).toLocaleDateString();
             servicio.productos = JSON.parse(servicio.productos);
             servicio.comercios = JSON.parse(servicio.comercios);
             servicio.id = item.payload.doc.id;
             return servicio;
          });
          this.myOrders.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());  
          this.dummy = [];
          //this.getMyOrders();
        }
      });
    }
  }
/*
  getMyOrders() {
    this.api.getMyOrders(localStorage.getItem('uid')).then((data: any) => {
      console.log('my orders', data);
      if (data && data.length) {
        this.haveItems = true;
         data.forEach(element => {
          element.time =  element.time.toString();
        }); 
        data.sort((a, b) =>  a.time > b.time);        
        this.myOrders = data;
        this.myOrders.forEach(element => {
          element.order = JSON.parse(element.order);
        });
        console.log('my order==>', this.myOrders);
      }
      this.dummy = [];
    }, error => {
      console.log(error);
    }).catch(error => {
      console.log(error);
    });
  }*/
  validate() {
    this.api.checkAuth().then(async (user: any) => {
      if (user) {
        localStorage.setItem('uid', user.uid);
        //this.getMyOrders();
      } else {
        this.router.navigate(['login']);
      }
    }).catch(error => {
      console.log(error);
    });
  }
  getCart() {
    this.router.navigate(['/tabs']);
  }
  goToHistoryDetail(orderId) {
    const navData: NavigationExtras = {
      queryParams: {
        id: orderId
      }
    };
    this.router.navigate(['/history-detail'], navData);
  }


  getCurrency() {
    return this.util.getCurrecySymbol();
  }

}
