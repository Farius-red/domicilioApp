import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { NavController } from '@ionic/angular';
import { PayPal, PayPalPayment, PayPalConfiguration } from '@ionic-native/paypal/ngx';

import * as  moment from 'moment';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.page.html',
  styleUrls: ['./payments.page.scss'],
})
export class PaymentsPage implements OnInit {


  serviceTax: any = 0;
  deliveryCharge: any = 5;
  deliveryAddress: any;
  venueFCM: any = '';
  vid: any = '';
  coupon: any;
  dicount: any;
  payKey: any = '';
  cart: any[] = [];
  dummy = Array(5);
  comercios: any[] = [];
  datosCart: any;
  id: any;
  comercioID: any;
  ordenID: any;
  constructor(
    private router: Router,
    private api: ApisService,
    private util: UtilService,
    private navCtrl: NavController,
    private payPal: PayPal,
    private route: ActivatedRoute,
  ) { }

  async ngOnInit() {
    this.route.queryParams.subscribe(data => {
      console.log('data=>', data);
      if (data.hasOwnProperty('id')) {
        this.id = data.id;
      }
    });
    if (localStorage.getItem('deliveryAddress')) {
      this.deliveryAddress = JSON.parse(localStorage.getItem('deliveryAddress'));
    }
    this.coupon = JSON.parse(localStorage.getItem('coupon'));
    const cart = localStorage.getItem('userCart');
    try {
      if (localStorage.getItem('userCart')) {
        this.cart = JSON.parse(localStorage.getItem('userCart'));
        this.comercios = JSON.parse(localStorage.getItem('comerciosCart'));
        this.datosCart = JSON.parse(localStorage.getItem('datosCart'));
        console.log(this.comercios);
        //this.calculate();
      } else {
        this.cart = [];
      }
    } catch (error) {
      console.log(error);
      this.cart = [];
    }
  }
  /*
    async calculate() {
      console.log('cart--->,', this.cart);
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
      // new
  
      console.log('total item', this.totalItem);
      console.log('=====>', this.totalPrice);
      const tax = (parseFloat(this.totalPrice) * 21) / 100;
      this.serviceTax = tax.toFixed(2);
      console.log('tax->', this.serviceTax);
      this.deliveryCharge = 5000;
      this.grandTotal = parseFloat(this.totalPrice) + parseFloat(this.serviceTax) + parseFloat(this.deliveryCharge);
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
          console.log('------------>>>>', this.totalPrice);
          this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
          const tax = (parseFloat(this.totalPrice) * 21) / 100;
          this.serviceTax = tax.toFixed(2);
          console.log('tax->', this.serviceTax);
          this.deliveryCharge = 5000;
          this.grandTotal = parseFloat(this.totalPrice) + parseFloat(this.serviceTax) + parseFloat(this.deliveryCharge);
          this.grandTotal = this.grandTotal.toFixed(2);
        } else {
          console.log('$');
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
          this.grandTotal = parseFloat(this.totalPrice) + parseFloat(this.serviceTax) + parseFloat(this.deliveryCharge);
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
        localStorage.clear();
        localStorage.setItem('language', lng);
        localStorage.setItem('selectedCity', selectedCity);
        this.totalItem = 0;
        this.totalPrice = 0;
      }
    }
  */
  /// OLD calc
  // async calculate(foods) {
  //   console.log(foods);
  //   let item = foods.filter(x => x.quantiy > 0);
  //   console.log(item);
  //   this.totalPrice = 0;
  //   this.totalItem = 0;
  //   await item.forEach(element => {
  //     this.totalItem = this.totalItem + element.quantiy;
  //     this.totalPrice = this.totalPrice + (parseFloat(element.price) * parseInt(element.quantiy));
  //   });
  //   this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
  //   console.log('total item', this.totalItem);
  //   console.log('=====>', this.totalPrice);
  //   const tax = (parseFloat(this.totalPrice) * 21) / 100;
  //   this.serviceTax = tax.toFixed(2);
  //   console.log('tax->', this.serviceTax);
  //   this.deliveryCharge = 5;
  //   this.grandTotal = parseFloat(this.totalPrice) + parseFloat(this.serviceTax) + parseFloat(this.deliveryCharge);
  //   this.grandTotal = this.grandTotal.toFixed(2);
  //   console.log('grand totla', this.grandTotal);
  //   if (this.coupon && this.coupon.code && this.totalPrice >= this.coupon.min) {
  //     if (this.coupon.type === '%') {
  //       console.log('per');
  //       function percentage(totalValue, partialValue) {
  //         return (100 * partialValue) / totalValue;
  //       }
  //       const totalPrice = percentage(parseFloat(this.totalPrice).toFixed(2), this.coupon.discout);
  //       console.log('============>>>>>>>>>>>>>>>', totalPrice);
  //       this.dicount = totalPrice.toFixed(2);
  //       this.totalPrice = parseFloat(this.totalPrice) - totalPrice;
  //       console.log('------------>>>>', this.totalPrice);
  //       this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
  //       const tax = (parseFloat(this.totalPrice) * 21) / 100;
  //       this.serviceTax = tax.toFixed(2);
  //       console.log('tax->', this.serviceTax);
  //       this.deliveryCharge = 5;
  //       this.grandTotal = parseFloat(this.totalPrice) + parseFloat(this.serviceTax) + parseFloat(this.deliveryCharge);
  //       this.grandTotal = this.grandTotal.toFixed(2);
  //     } else {
  //       console.log('$');
  //       console.log('per');
  //       const totalPrice = parseFloat(this.totalPrice) - this.coupon.discout;
  //       console.log('============>>>>>>>>>>>>>>>', totalPrice);
  //       this.dicount = this.coupon.discout;
  //       this.totalPrice = parseFloat(this.totalPrice) - totalPrice;
  //       console.log('------------>>>>', this.totalPrice);
  //       this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
  //       const tax = (parseFloat(this.totalPrice) * 21) / 100;
  //       this.serviceTax = tax.toFixed(2);
  //       console.log('tax->', this.serviceTax);
  //       this.deliveryCharge = 5;
  //       this.grandTotal = parseFloat(this.totalPrice) + parseFloat(this.serviceTax) + parseFloat(this.deliveryCharge);
  //       this.grandTotal = this.grandTotal.toFixed(2);
  //     }
  //   } else {
  //     console.log('not satisfied');
  //     this.coupon = null;
  //     localStorage.removeItem('coupon');
  //   }
  // }

  /// OLD calc
  

  async placeOrder() {
    try {
      console.log('place order');
    localStorage.removeItem('datosCart');
    localStorage.removeItem('userCart');
    localStorage.removeItem('comercios');

    let data = await swal.fire({
      title: this.util.translate('Are you sure?'),
      //text: this.util.translate('Orders once placed cannot be cancelled and are non-refundable'),
      icon: 'question',
      showCancelButton: true,
      backdrop: false,
      background: 'white',
      confirmButtonText: this.util.translate('Yes'),
      cancelButtonText: this.util.translate('cancel'),
    }).then((data) => data);
    console.log(data);
    if (data && data.value) {
      console.log('go to procesed');
      //  this.createOrder();
      let servicio = await this.api.getServicio(this.id).then(data => data);
      let cambioOrden = JSON.parse(servicio.comercios);
      for (const orden of cambioOrden) {
        cambioOrden.find(e => e.id == orden.id).pago = 'efectivo';
      }

      await this.api.updateOrderStatus(this.id, { pago: "efectivo", comercios: JSON.stringify(cambioOrden) }).then((data) => data);
      await this.api.updateOrdersServices(this.id, { pago: 'efectivo' }).then((data) => data);
      for (let c of this.comercios) {
        this.api.getVenueUser(c.usuarioID).then((data: any) => {
          if (data && data.fcm_token !== '') {
            this.api.sendNotification(this.util.translate('New Order Received'), this.util.translate('New Order'), data.fcm_token, 'comercio').subscribe((data) => data);
          }
        });
      }
  
      swal.fire({
        title: this.util.translate('Success'),
        text: this.util.translate('Order created'),
        icon: 'success',
        backdrop: false,
        timer: 4000
      });
      this.navCtrl.navigateRoot(['tabs/tab2']);
    }
    } catch (error) {
      console.log(error);
    }
    
    
}

// For Testing Generate Credit Card American Express
// https://developer.paypal.com/developer/creditCardGenerator/
payWithPaypal() {
  swal.fire({
    title: this.util.translate('Are you sure?'),
    text: this.util.translate('Orders once placed cannot be cancelled and are non-refundable'),
    icon: 'question',
    showCancelButton: true,
    backdrop: false,
    background: 'white',
    confirmButtonText: this.util.translate('Yes'),
    cancelButtonText: this.util.translate('cancel'),
  }).then((data) => {
    console.log(data);
    if (data && data.value) {
      console.log('go to procesed');
      this.payPal.init({
        PayPalEnvironmentProduction: environment.paypal.production,
        PayPalEnvironmentSandbox: environment.paypal.sandbox
      }).then(() => {
        this.payPal.prepareToRender('PayPalEnvironmentSandbox', new PayPalConfiguration({
        })).then(() => {
          const code = this.util.getCurrencyCode();
          const payment = new PayPalPayment(this.datosCart.grandTotal, code, 'Food Delivery', 'sale');
          this.payPal.renderSinglePaymentUI(payment).then((res) => {
            console.log(res);
            this.payKey = res.response.id;
            this.paypalOrder();
          }, (error: any) => {
            console.log('error', error);
            this.util.showToast(error, 'danger', 'bottom');
            // Error or render dialog closed without being successful
          });
        }, (error: any) => {
          console.log('error', error);
          this.util.showToast(error, 'danger', 'bottom');
          // Error in configuration
        });
      }, (error: any) => {
        console.log('error', error);
        this.util.showToast(error, 'danger', 'bottom');
        // Error in initialization, maybe PayPal isn't supported or something else
      });

    }
  });

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

async createOrder() {
  try {
    this.util.show('creating order');
    let autenticado = await this.api.checkAuth().then((data: any) => data);
    if (autenticado) {
      // not from saved address then create new and save
      if (!this.deliveryAddress.id || this.deliveryAddress.id === '') {
        const newAddress = {
          usuarioID: autenticado.uid,
          direccion: this.deliveryAddress.address,
          lat: this.deliveryAddress.lat,
          lng: this.deliveryAddress.lng,
          titulo: 'home',
          casa: '',
          puntoReferencia: ''
        };
        let direccion = await this.api.addNewAddress(newAddress).then((data) => data);
        this.deliveryAddress.id = direccion.id;
      }
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
        fecha: moment().format('llll'),
        direccion: this.deliveryAddress,
        subTotal: this.datosCart.totalPrice,
        total: this.datosCart.grandTotal,
        comercios: JSON.stringify(this.comercios.map((c) => {
          if (c.descuentoID) {
            return { id: c.id, direccionComercial: c.direcciones, nombreComercial: c.nombreComercial, subTotal: c.totalPrice, total: c.total, descuentoID: c.descuentoID, descuento: c.descuento, tipoDescuento: c.tipoDescuento, estado: 'created' }
          } else {
            return { id: c.id, direccionComercial: c.direcciones, nombreComercial: c.nombreComercial, subTotal: c.totalPrice, total: c.total, descuentoID: '', descuento: null, tipoDescuento: '', estado: 'created' }
          }

        })),
        //serviceTax: this.serviceTax, 
        domicilio: 5000,
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

        swal.fire({
          title: this.util.translate('Success'),
          text: this.util.translate('Your is created succesfully'),
          icon: 'success',
          backdrop: false,
        });
        this.navCtrl.navigateRoot(['tabs/tab2']);
      }
    } else {
      this.util.hide();
      this.util.errorToast(this.util.translate('Session expired'));
      this.router.navigate(['login']);
    }
  } catch (error) {
    this.util.hide();
    this.util.errorToast(this.util.translate('Something went wrong'));
    this.router.navigate(['tabs']);
    console.log(error);
  }


}

async paypalOrder() {
  this.util.show('creating order');
  this.api.checkAuth().then(async (data: any) => {
    console.log(data);
    if (data) {
      // not from saved address then create new and save
      if (!this.deliveryAddress.id || this.deliveryAddress.id === '') {
        const addressId = this.util.makeid(10);
        const newAddress = {
          id: addressId,
          uid: data.uid,
          address: this.deliveryAddress.address,
          lat: this.deliveryAddress.lat,
          lng: this.deliveryAddress.lng,
          title: 'home',
          house: '',
          landmark: ''
        };
        await this.api.addNewAddress(newAddress).then((data) => {
          this.deliveryAddress.id = addressId;
        }, error => {
          console.log(error);
        }).catch(error => {
          console.log(error);
        });
      }

      let id = this.util.makeid(10);
      localStorage.removeItem('foods');
      localStorage.removeItem('vid');
      localStorage.removeItem('totalItem');
      const uid = localStorage.getItem('uid');
      const lng = localStorage.getItem('language');
      const selectedCity = localStorage.getItem('selectedCity');
      localStorage.clear();
      localStorage.setItem('uid', uid);
      localStorage.setItem('language', lng);
      localStorage.setItem('selectedCity', selectedCity);
      const param = {
        uid: data.uid,
        userId: data.uid,
        orderId: id,
        vid: this.vid,
        order: JSON.stringify(this.cart),
        time: moment().format('LLL'),
        address: this.deliveryAddress,
        total: this.datosCart.totalPrice,
        grandTotal: this.datosCart.grandTotal,
        serviceTax: this.serviceTax,
        deliveryCharge: 5,
        status: 'created',
        restId: this.vid,
        paid: 'paypal',
        paykey: this.payKey,
        appliedCoupon: this.coupon ? true : false,
        couponId: this.coupon ? this.coupon.id : 'NA',
        coupon: this.coupon ? JSON.stringify(this.coupon) : 'NA',
        dicount: this.coupon ? this.dicount : 0
      };
      console.log('sent', param);
      this.api.createOrder(param).then(async (data) => {
        this.util.hide();
        if (this.venueFCM && this.venueFCM !== '') {
          this.api.sendNotification(this.util.translate('New Order Received'),
            this.util.translate('New Order'), this.venueFCM, 'comercio').subscribe((data) => {
              console.log('send notifications', data);
            }, error => {
              console.log(error);
            });
        }
        swal.fire({
          title: this.util.translate('Success'),
          text: this.util.translate('Your is created succesfully'),
          icon: 'success',
          backdrop: false,
        });
        this.navCtrl.navigateRoot(['tabs/tab2']);
        console.log(data);
      }, error => {
        this.util.hide();
        this.util.errorToast(this.util.translate('Something went wrong'));
        this.router.navigate(['tabs']);
      }).catch(error => {
        this.util.hide();
        this.util.errorToast(this.util.translate('Something went wrong'));
        this.router.navigate(['tabs']);
        console.log(error);
      });
    } else {
      this.util.hide();
      this.util.errorToast(this.util.translate('Session expired'));
      this.router.navigate(['login']);
    }

  }, error => {
    this.util.hide();
    this.util.errorToast(this.util.translate('Session expired'));
    this.router.navigate(['login']);
  }).catch(error => {
    this.util.hide();
    this.util.errorToast(this.util.translate('Session expired'));
    this.router.navigate(['login']);
    console.log(error);
  });

}

openStripe() {
  this.router.navigate(['stripe-payments']);
}
}
