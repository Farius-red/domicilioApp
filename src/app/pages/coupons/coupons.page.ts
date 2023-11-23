import { Component, OnInit } from '@angular/core';
import { ApisService } from 'src/app/services/apis.service';
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { UtilService } from 'src/app/services/util.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-coupons',
  templateUrl: './coupons.page.html',
  styleUrls: ['./coupons.page.scss'],
})
export class CouponsPage implements OnInit {
  list: any[] = [];
  restId: any;
  name: any;
  total: any;
  dummy = Array(10);
  constructor(
    private api: ApisService,
    private route: ActivatedRoute,
    private util: UtilService,
    private navCtrl: NavController
  ) {
    this.getOffers();
  }

  ngOnInit() {
    //let datosCart = JSON.parse(localStorage.getItem('datosCart'));

    /*this.route.queryParams.subscribe(data => {
      console.log(data);
      if (data && data.restId) {
        this.restId = data.restId;
        this.name = data.name;
        this.total = parseFloat(data.totalPrice);
        console.log(this.restId);
      } else {
        this.dummy = [];
      }
    });*/
  }
  async getOffers() {
    let cupones = await this.api.getOffers().then(data => data);
    this.dummy = [];
    this.list = [];
    if (cupones && cupones.length) {
      let userCart = JSON.parse(localStorage.getItem('userCart'));
      const currnetDate = moment().format('YYYY-MM-DD');
      this.list = cupones.filter(e => e.estado === 'active' && moment(e.fechaExpiracion).isAfter(currnetDate) && e.disponibleEn.some(a => userCart.some(c => c.comercioID == a.id)));
    }

  }
  claim(item) {
    let datosCart = JSON.parse(localStorage.getItem('datosCart'));
    if (datosCart.totalPrice >= item.valorMinCompra) {
      console.log('ok');
      this.util.showToast(this.util.translate('Coupon Applied'), 'success', 'bottom');
      this.util.publishCoupon(item);
      this.navCtrl.back();
    } else {
      this.util.errorToast(this.util.translate('For claiming this coupon your order required minimum order  of $') + item.min);
    }
  }
  expire(date) {
    return moment(date).format('llll');
  }

  getCurrency() {
    return this.util.getCurrecySymbol();
  }
}
