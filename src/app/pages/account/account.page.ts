
import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ApisService } from 'src/app/services/apis.service';
import { Router, NavigationExtras } from "@angular/router";
import { UtilService } from 'src/app/services/util.service';
import { DeleteGenerales } from '../../state/generales.actions';
import { Select, Store } from '@ngxs/store';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { UsuariosState } from 'src/app/state/state/usuarios/usuarios.state';
import { UpdateProfile } from 'src/app/interfaces/updateProfile';
import { GetCurrentUser, UpdateUsuario } from 'src/app/state/state/usuarios/usuarios.actions';
;
@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  @Select(UsuariosState.getUsuCurrent) datosUsuario$: Observable<UpdateProfile[]>;
  myprofile = [];
  seg_id = 1;
  name: any;
  photo: any = 'assets/imgs/user.png';
  email: any;
  reviews: any = [];
  id: any;
  version: any;
  constructor(
    private api: ApisService,
    private router: Router,
    private util: UtilService,
    public store: Store,
    private appVersion: AppVersion
  ) {
    this.util.getReviewObservable().subscribe(data => {

      this.getReview();
    });
    this.util.observProfile().subscribe(data => {
      this.getProfile();
    });
  }

  ngOnInit() {
    this.appVersion.getAppName().then((v) => {
      this.version = v;
    });

  }
  logout() {
    this.api.logout().then((data) => {
      this.router.navigate(['login']);
      this.store.dispatch(new DeleteGenerales('Address'));
    }).catch(error => {
      console.log(error);
    });
  }

  goToAddress() {
    const navData: NavigationExtras = {
      queryParams: {
        from: 'account'
      }
    };
    this.router.navigate(['choose-address'], navData);
  }

  goToWallet() {
    this.getProfile()
    this.router.navigate(['/wallet']);

  }

  ionViewWillEnter() {
    this.validate();
  }
  async getReview() {
    try {
      this.reviews = await this.api.getMyReviews(this.id).then((reviews) => reviews);
      if (this.reviews.length > 0) {
        for (let resena of this.reviews) {
          let comercio = await this.api.getCommerceDetails(resena.criticadoID).then(data => data);
          resena.comercio = comercio;
        }
      }

    } catch (error) {
      console.log(error);
    }
  }

  verificarBiletera(...x) {

    let saldo: number = 0;
    let idUrl: string = Math.random().toString(36).substr(2, 8);
    let arr = [];

    x.forEach(i => {
      if (i != undefined) {
        if (typeof i == 'string')
          arr.push(i);
        else
          i = saldo;
        arr.push(i);
      } else {

        if (i == null || undefined && x.length > 0) {
          if (arr.length > 0) {

            if (i == undefined || i == null) {
              i = idUrl;
              arr.push(i);
            }
          }
          else {
            i = saldo
            arr.push(i);
          }
        }
      }
    });

    return arr
  }
  getProfile() {
    this.store.dispatch(new GetCurrentUser())
    this.datosUsuario$.subscribe(
      data => {
        if (data.hasOwnProperty('nombres'))
          this.myprofile.push(data)


        if (this.myprofile.length > 0) {
          if (this.myprofile.length > 1)
            this.myprofile.splice(0, this.myprofile.length - 1);

          this.myprofile.forEach(i => {
            if (i.saldo == null || i.saldo == undefined || i.idUrl == null || i.idUrl == undefined) {
              let array = this.verificarBiletera(i.saldo, i.idUrl)
              if (array.length == 2)
                array.forEach(elem => {
                  (typeof elem == 'string')
                    ? i.idUrl = elem
                    : i.saldo = elem
                })

              if (array.length != 0)
                this.store.dispatch(new UpdateUsuario(data))
            }
          }
          )
        }
      },





      err => {
        console.log(err)
      }
    )
  }

  validate() {
    this.api.checkAuth().then(async (user: any) => {
      if (user) {
        localStorage.setItem('uid', user.uid);
        // this.getProfile();
      } else {
        this.router.navigate(['login']);
      }
    }).catch(error => {
      console.log(error);
    });
  }
  changeSegment(val) {
    this.seg_id = val;
  }

  goToselectRestaurants() {
    this.router.navigate(['/choose-restaurant']);
  }

  goToEditProfile() {
    this.router.navigate(['/edit-profile']);
  }
}
