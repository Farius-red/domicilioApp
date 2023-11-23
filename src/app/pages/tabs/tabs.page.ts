import { Component } from '@angular/core';
import { ApisService } from 'src/app/services/apis.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
datosCars: any;
totalItem =0;
totalOrders = 0;
  constructor(
    
    private api: ApisService,
  ) {
    
  }

  ionViewWillEnter() {
    if (localStorage.getItem('uid')) {
      this.api.getColletion().collection('servicios', ref => ref.where('clienteID', '==', localStorage.getItem('uid'))).snapshotChanges().subscribe((data: any) => {
        if (data) {
        this.totalOrders = 0;
          let countOrders =  data.map((item) =>{
            let servicio = item.payload.doc.data();
            return servicio;
         });
         this.totalOrders  = countOrders.filter(element => element.estado == "doing" || element.estado == "ongoing" || element.estado == "created").length;
          //this.getMyOrders();
        }
      });
    }
    if(localStorage.getItem('userCart')){
     this.datosCars =  JSON.parse(localStorage.getItem('userCart'));
     this.totalItem = this.datosCars.length;
    }else{
      this.totalItem = 0;
    }
  }

}
