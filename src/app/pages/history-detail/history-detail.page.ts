import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { AlertController, NavController } from '@ionic/angular';
import Swal from 'sweetalert2';
import { VirtualTimeScheduler } from 'rxjs';
import { element } from 'protractor';

@Component({
  selector: 'app-history-detail',
  templateUrl: './history-detail.page.html',
  styleUrls: ['./history-detail.page.scss'],
})
export class HistoryDetailPage implements OnInit {
  id: any;
  grandTotal: any;
  orders: any[] = [];
  comercios: any[] = [];
  deliverycharge: any;
  status: any;
  time: any;
  total: any;
  uid: any;
  address: any;
  restName: any;
  deliveryAddress: any;
  paid: any;
  restPhone: any;
  coupon: boolean = false;
  dicount: any;
  dname: any;
  orderData: any;
  loaded: boolean;
  restFCM: any;
  driverFCM: any;
  dId: any;
  cliente: any;
  conductor: any;
  tarifas:any[] = [];
  pago:any;
  dName: any = '';
  dLastame: any = '';
  phone: any = '';
  dCover: any = '';
  clave: any;
  orderID: any;
  tokenComercioPadre:any;
  constructor(
    private route: ActivatedRoute,
    private api: ApisService,
    private router: Router,
    private util: UtilService,
    private alertController: AlertController,
    private navCtrl: NavController
  ) {
    this.loaded = false;
  }
  ngOnInit() {
    this.route.queryParams.subscribe(data => {
      if (data.hasOwnProperty('id')) {
        this.id = data.id;
        this.getOrder();
      }
    });
  }

  ionViewWillEnter(){
    this.api.getVenueUser('uYlVO29F02axM9Yc9xem4ks8VSX2').then(data =>{
      this.tokenComercioPadre= data.fcm_token;    
      console.log(this.tokenComercioPadre);
      });
  
  }
  backOrder(){
      this.navCtrl.navigateRoot(['/tabs/tab2']); 
  }

  async getOrder() {
    try {
      this.loaded = true;
     await this.api.getColletion().collection('servicios').doc(this.id).snapshotChanges().subscribe(async (orden:any) => {
          
        let data =  orden.payload.data();
        data.fecha =  data.fecha.toString();
        data.productos = JSON.parse(data.productos);
        data.comercios = JSON.parse(data.comercios);
        data.tarifas = JSON.parse(data.tarifas);
        data.id = orden.payload.id;

        this.clave = data.identificador; 
        this.pago = data.pago ? data.pago: '';
        this.orderData = data;
        this.grandTotal = data.total;
        this.total =data.subTotal;
        this.orders = data.productos;
        this.comercios = data.comercios;
        this.deliverycharge = data.domicilio;
        this.status = data.estado;
        this.tarifas = data.tarifas;
        this.time = new Date(data.fecha).toLocaleString();
        this.cliente = await this.api.getVenueUser(data.clienteID).then(data => data);
        if (data.conductorID) {
          this.conductor = await this.api.getVenueUser(data.conductorID).then(data => data);
          this.driverFCM = this.conductor.fcm_token;
          this.dId = this.conductor.id;
          this.dName = this.conductor.nombres;
          this.dCover = this.conductor.portada;
          this.dLastame = this.conductor.apellidos;
          this.phone = this.conductor.celular;
        }

        this.deliveryAddress = data.direccion.address;
        this.paid = data.moneda;
      });
      //let data = await this.api.getOrderById(this.id).then((data) => data);
      
    } catch (error) {
      console.log('error in order', error);
      this.loaded = true;
      this.util.errorToast('Something went wrong');
    }

  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: this.util.translate('How was your experience?'),
      message: this.util.translate('Rate ') /* + this.restName */ + this.util.translate(' and ') /* + this.dname */,
      buttons: [
        {
          text: this.util.translate('Cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: this.util.translate('Yes'),
          handler: () => {
            console.log('Confirm Okay');
            this.util.setOrders(this.orderData);
            this.router.navigate(['rate']);
          }
        }
      ]
    });

    await alert.present();
  }
  payService(){
    const navData: NavigationExtras = {
      queryParams: {
        isCategory: false,
        id: this.id
      }
    };
    this.router.navigate(['payments'], navData);
  }
  getCommerce(id) {
    this.api.getProfile(id).then((data) => {
      console.log(data);
      this.restFCM = data.fcm_token;
      console.log('rest FCM------------->', this.restFCM);
      if (data && data.phone) {
        this.restPhone = data.phone;
      }
    }, error => {
      console.log('error in orders', error);
      this.util.errorToast('Something went wrong');
    }).catch(error => {
      console.log('error in order', error);
      this.util.errorToast('Something went wrong');
    });
  }
  trackMyOrder() {
    const navData: NavigationExtras = {
      queryParams: {
        id: this.id
      }
    };
    this.router.navigate(['/tracker'], navData);
    //
  }
  call() {
    if (this.restPhone) {
      window.open('tel:' + this.restPhone);
    }
  }

  chat() {
    this.router.navigate(['inbox']);
  }
  async changeStatus() {
    Swal.fire({
      title: this.util.translate('Are you sure?'),
      text: this.util.translate('To Cancel this order'),
      showCancelButton: true,
      cancelButtonText: this.util.translate('Cancel'),
      showConfirmButton: true,
      confirmButtonText: this.util.translate('Yes'),
      backdrop: false,
      background: 'white'
    }).then(async (data) => {
      
      console.log(data);
      if (data && data.value) {
        this.util.show();  
        /* await this.api.updateOrderStatus(this.id,  {estado: 'cancel'}).then((data) => data);
        await this.api.updateServiceComercios(this.servicioID, { comercios: JSON.stringify(cambioOrden), estado: value }); */
        this.api.getUpdateOrders(this.id, {estado: 'cancel'}).then((data) => {
          this.comercios.forEach(element => {
            element.estado = 'cancel';
          });
          this.util.hide();
        /*   const message = this.util.translate('Order ') + this.clave + ' del comercio ' + this.comercios[0].nombreComercial + ' cancelado por el usuario';
          const message2 = this.util.translate('Order ') + this.clave + ' del comercio ' + this.comercios[0].nombreComercial + ' cancelado por el usuario';
          const title = this.util.translate('Order cancelled'); *//* 
          this.api.sendNotification(message, title, this.restFCM,"comercio").subscribe(data => data);
          this.api.sendNotification(message2, title, this.tokenComercioPadre,"comercio").subscribe(data => data); */
          this.api.updateServiceComercios(this.id, { estado:  'cancel', comercios: JSON.stringify(this.comercios)});
          if (this.dId && this.dname) {
            const parm = {
              current: 'active',
            };
            this.api.updateProfile(this.dId, parm).then((data) => {
              console.log('driver status cahcnage----->', data);
            }).catch(error => {
              console.log(error);
            });
          }

          this.router.navigate(['/tabs/tab2']);
        }, error => {
          this.util.hide();
          console.log('CancelError', error);
          this.util.errorToast('Something went wrong');
        }).catch(error => {
          this.util.hide();
          console.log(error);
          this.util.errorToast('Something went wrong');
        });
      }
    });
  }

  getCurrency() {
    return this.util.getCurrecySymbol();
  }

}
