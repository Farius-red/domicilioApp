import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import * as firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { async } from '@angular/core/testing';
import { element } from 'protractor';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
export class AuthInfo {
  constructor(public $uid: string) { }

  isLoggedIn() {
    return !!this.$uid;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ApisService {
  static UNKNOWN_USER = new AuthInfo(null);
  //db = firebase.firestore();
  public authInfo$: BehaviorSubject<AuthInfo> = new BehaviorSubject<AuthInfo>(ApisService.UNKNOWN_USER);
  constructor(
    private fireAuth: AngularFireAuth,
    private adb: AngularFirestore,
    private http: HttpClient,
    private fb: Facebook,
    private googlePlus: GooglePlus,
  ) { }



  getColletion() {
    if (environment.production) {
      return this.adb.collection("tests").doc("CO");
    } else {
      return this.adb.collection("production").doc("CO");
    }
  }
  public checkAuth() {
    return new Promise((resolve, reject) => {
      this.fireAuth.auth.onAuthStateChanged(user => {
        if (user) {
          localStorage.setItem('uid', user.uid);
          resolve(user);
        } else {
          this.authInfo$.next(ApisService.UNKNOWN_USER);
          if (localStorage.getItem('uid')) {
            this.getColletion().collection('usuarios').doc(localStorage.getItem('uid')).update({ "fcm_token": "" });
          }
          const lng = localStorage.getItem('language');
          const selectedCity = localStorage.getItem('selectedCity');
          localStorage.clear();
          localStorage.setItem('language', lng);
          localStorage.setItem('selectedCity', selectedCity);
          resolve(false);
        }
      });
    });
  }
   /* loginGoogle() {
    const res = await this.googlePlus.login({});
    const usuarioDataGoogle = res;
    return await this.fireAuth.auth.signInWithCredential(firebase.auth.GoogleAuthProvider.credential(null, usuarioDataGoogle.accessToken));
  }


 public loginConFacebook() {
    return this.fb.login(['email', 'public_profile'])
      .then((res: FacebookLoginResponse) => {
        const credencial_fb = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
        return this.fireAuth.auth.signInWithCredential(credencial_fb);
      })
  } */
  public login(email: string, password: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.auth.signInWithEmailAndPassword(email, password)
        .then(res => {
          if (res.user) {
            this.getColletion().collection('usuarios').doc(res.user.uid).update({
              fcm_token: localStorage.getItem('fcm') ? localStorage.getItem('fcm') : ''
            });
            this.authInfo$.next(new AuthInfo(res.user.uid));
            resolve(res.user);
          }
        })
        .catch(err => {

          this.authInfo$.next(ApisService.UNKNOWN_USER);
          reject(`login failed ${err}`);
        });
    });
  }

  public getCities(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('ciudades', ref => ref.where("status", "==", "activo")).get().subscribe((venue: any) => {
        let data = venue.docs.map(element => {
          let item = element.data();
          item.id = element.id;
          return item;
        });
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  public register(email: string, password: string, nombres: string, apellidos: string, telefono: string, fechaNacimiento: string, imagen: string, fechaRegistro: any, genero: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.auth.createUserWithEmailAndPassword(email, password)
        .then(res => {
          if (res.user) {
            this.getColletion().collection('usuarios').doc(res.user.uid).set({
              email: email,
              nombres: nombres,
              tipoUsuario: 'user',
              estado: 'active',
              apellidos: apellidos,
              telefono: telefono,
              fechaNacimiento: fechaNacimiento?fechaNacimiento:"",
              fechaRegistro: fechaRegistro,
              imagen: imagen?imagen:"",
              genero: genero?genero:"",
              fcm_token: localStorage.getItem('fcm') ? localStorage.getItem('fcm') : ''
            });
            this.authInfo$.next(new AuthInfo(res.user.uid));
            resolve(res.user);
          }
        })
        .catch(err => {

          this.authInfo$.next(ApisService.UNKNOWN_USER);
          reject(`login failed ${err}`)
        });
    });
  }

  public resetPassword(email: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.auth.sendPasswordResetEmail(email)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(`reset failed ${err}`);
        });
    });
  }

  public logout(): Promise<void> {
    this.authInfo$.next(ApisService.UNKNOWN_USER);
    this.getColletion().collection('usuarios').doc(localStorage.getItem('uid')).update({ "fcm_token": "" })
    return this.fireAuth.auth.signOut();
  }

  public getProfile(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('usuarios').doc(id).get().subscribe((profile: any) => {
        resolve(profile.data());
      }, error => {
        reject(error);
      });
    });
  }


  public getCommerceDetails(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('comercios').doc(id).get().subscribe((venue: any) => {
        resolve({ id: venue.id, ...venue.data() });
      }, error => {
        reject(error);
      });
    });
  }
  public getCommerceCategoriesById(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('categorias', ref => ref.where('dependencia', '==', id)).get().subscribe((venue) => {
        var data = venue.docs.map(element => {
          var item = element.data();
          item.id = element.id;
          return item;
        });
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }
  public getCategorie(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('categorias').doc(id).get().subscribe((categoria: any) => {
        var item = categoria.data();
        item.id = categoria.id;
        resolve(item);
      }, error => {
        reject(error);
      });
    });
  }
  public getMyProfile(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('usuarios').doc(id).get().subscribe((usuarios: any) => {
        resolve(usuarios.data());
      }, error => {
        reject(error);
      });
    });
  }

  public getVenueUser(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('usuarios').doc(id).get().subscribe((venue: any) => {
        resolve(venue.data());
      }, error => {
        reject(error);
      });
    });
  }

  public getVenueCategories(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('categorias', ref => ref.where('uid', '==', id)).get().subscribe((venue) => {
        var data = venue.docs.map(element => {
          var item = element.data();
          item.id = element.id;
          return item;
        })
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  public getProductsCategories(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('categorias').get().subscribe((venue) => {
        var data = venue.docs.map(element => {
          var item = element.data();
          item.id = element.id;
          return item;
        })
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  public getProductosComerces(id: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('productos', (ref) => ref.where('comercioID', '==', id)).get().subscribe((data) => {
        var usuarios = data.docs.map(element => {
          var item = element.data();
          /*
          await item.productoCategoriaID.get().then(function (doc) {
            item.productoCategoriaID = {id: doc.id , ...doc.data()};
          });*/
          item.id = element.id;
          return item;
        });

        resolve(usuarios);
      }, error => {
        reject(error);
      });
    });
  }
  public getProducto(id: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('productos').doc(id).get().subscribe((data) => {
        var item = data.data();
        item.id = data.id;
        item.restricciones = item.restricciones || [];
        resolve(item);
      }, error => {
        reject(error);
      });
    });
  }


  public getProductosCalificado(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('productos', ref => ref.where("calificacion", ">=", 3)).get().subscribe((data) => {
        var item = data.docs.map(it => {
          let item = it.data();
          item.id = it.id;
          return item;
        });

        resolve(item);
      }, error => {
        reject(error);
      });
    });
  }

  public getProductsByCate(id: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('productos', ref => ref.where('productoCategoriaID', '==', id).orderBy('nombre')).get().subscribe((data) => {
        var usuarios = data.docs.map(doc => {
          var item = doc.data();
          item.id = doc.id;
          return item;
        });
        resolve(usuarios);
      }, error => {
        reject(error);
      });
    });
  }

  public getFoodWithId(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('productos').doc(id).get().subscribe((data) => {
        console.log('**', data.data());
        var item = data.data();
        item.id = data.id;
        data.data().cid.get().then(function (doc) {
          item.cid = doc.data();
          item.cid.id = doc.id;
        });
        resolve(item);
      }, error => {
        reject(error);
      });
    });
  }

  public getMessages(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('chats').doc(id).get().subscribe((messages: any) => {
        console.log(messages);
        let data = messages.docs.map(element => {
          let item = element.data();
          item.id = element.id;
          return item;
        });
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  public getOffers(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('cupones').get().subscribe((venue: any) => {
        // resolve(venue.data());
        let data = venue.docs.map(element => {
          let item = element.data();
          item.id = element.id;
          return item;
        });
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }


  public addNewAddress(param): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('direcciones').add(param).then((data) => {
        resolve(data);
      }, error => {
        reject(error);
      }).catch(error => {
        reject(error);
      });
    });
  }

  public updateAddress(id, param): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('direcciones').doc(id).update(param).then((data) => {
        resolve(data);
      }, error => {
        reject(error);
      }).catch(error => {
        reject(error);
      });
    });
  }
  public updateAddressByUser(id, param): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('direcciones', ref => ref.where("usuarioID", "==", id).where("estado", "==", true)).doc().update(param).then((data) => {
        resolve(data);
      }, error => {
        reject(error);
      }).catch(error => {
        reject(error);
      });
    });
  }

  public deleteAddress(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('direcciones').doc(id).delete().then((data) => {
        resolve(data);
      }, error => {
        reject(error);
      }).catch(error => {
        reject(error);
      });
    });
  }

  public getMyAddress(uid: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('direcciones', ref => ref.where("usuarioID", "==", uid)).get().subscribe((data) => {
        var usuarios = data.docs.map(doc => {
          var item = doc.data();
          item.id = doc.id;
          return item;
        });
        resolve(usuarios);
      }, error => {
        reject(error);
      });
    });
  }

  public createOrder(param): Promise<any> {

    // param.dId = this.getCollection().collection('usuarios').doc(param.dId);
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('servicios').add(param).then((data) => {
        resolve(data);
      }, error => {
        reject(error);
      }).catch(error => {
        reject(error);
      });
    });
  }

  public getTarifas(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('ciudades').doc(id).collection("servicios", ref => ref.where("name", "==", "domicilios")).get().subscribe(async categorias => {
        let cate = await categorias.docs[0].ref.collection("categorias").get().then((data) => data.docs.map(item => {
          let i = item.data();
          i.id = item.id;
          return i;
        }));
        resolve(cate);
      });
    });
  }

  public getServicio(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('servicios').doc(id).get().subscribe((categoria: any) => {
        var item = categoria.data();
        item.id = categoria.id;
        resolve(item);
      }, error => {
        reject(error);
      });
    });
  }
  public createOrderServicio(params): Promise<any> {

    // param.dId = this.getCollection().collection('usuarios').doc(param.dId);
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('ordenes').add(params).then((data) => {
        resolve(data);
      }, error => {
        reject(error);
      }).catch(error => {
        reject(error);
      });
    });
  }

  sendNotification(msg, title, id, tipo) {
    const body = {
      app_id: environment.llavesOneginal.find(e => e.tipoUsuario == tipo).onesignal.appId,
      include_player_ids: [id],
      headings: { en: title },
      contents: { en: msg },
      data: { task: msg }
    };
    const header = {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Basic ${environment.llavesOneginal.find(e => e.tipoUsuario == tipo).onesignal.restKey}`)
    };
    return this.http.post('https://onesignal.com/api/v1/notifications', body, header);
  }


  public getMyOrders(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('servicios', ref => ref.where('usuarioID', '==', id)).get().subscribe(async (comercios) => {
        let data = comercios.docs.map(element => {
          let item = element.data();
          item.vid.get().then(function (doc) {
            item.vid = doc.data();
            item.vid.id = doc.id;
          });
          item.id = element.id;
          return item;
        });
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  public getOrderById(id): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      this.getColletion().collection('servicios').doc(id).get().subscribe(async (order: any) => {
        let data = await order.data();
        data.fecha = data.fecha.toString();
        data.productos = JSON.parse(data.productos);
        data.comercios = JSON.parse(data.comercios);
        data.tarifas = JSON.parse(data.tarifas);
        data.id = order.id;
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  getDriverInfo(id): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      this.getColletion().collection('usuarios').doc(id).snapshotChanges().subscribe(data => {
        console.log(data);
        resolve(data.payload.data());
      }, error => {
        reject(error);
      });
    });
  }


  public updateOrderStatus(id, value): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      this.getColletion().collection('ordenes').doc(id).update(value).then((order: any) => {
        resolve(order);
      }).catch(error => {
        reject(error);
      });
    });
  }
  public updateServiceComercios(id, value): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      this.getColletion().collection('servicios').doc(id).update(value).then(async (order: any) => {
        resolve(order);
      }).catch(error => {
        reject(error);
      });
    });
  }
  public updateOrdersServices(id, value): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      this.getColletion().collection('ordenes', ref => ref.where("servicioID", "==", id)).get().subscribe((order: any) => {
        order.docs.forEach(element => {
          var item = element.data();
          item.id = element.id;
          this.getColletion().collection('ordenes').doc(item.id).update(value);
        });

        resolve(true);
      }, error => {
        reject(error);
      });
    });
  }
  public getOrders(id): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      this.getColletion().collection('ordenes', ref => ref.where("servicioID", "==", id)).get().subscribe((order: any) => {
        var data = order.docs.map(element => {
          var item = element.data();
          item.id = element.id;
          return item;
        })
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }
  public getUpdateOrders(id, value): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      this.getColletion().collection('ordenes', ref => ref.where("servicioID", "==", id)).get().subscribe((order: any) => {
        var data = order.docs.map(element => {
          var item = element.ref.update(value).then();
          item.id = element.id;
          return item;
        })
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  public getDrivers(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('usuarios', ref => ref.where('tipoUsuario', '==', 'delivery')).get().subscribe(async (venue) => {
        let data = venue.docs.map(element => {
          let item = element.data();
          item.id = element.id;
          return item;
        });
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }


  public sendOrderToDriver(id, param): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('driverOrders').doc(id).set(param).then((data) => {
        resolve(data);
      }, error => {
        reject(error);
      }).catch(error => {
        reject(error);
      });
    });
  }

  public addReview(param): Promise<any> {

    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('resenas').add(param).then((data) => {
        resolve(data);
      }).catch(error => {
        reject(error);
      });
    });
  }

  public addDriverReview(param): Promise<any> {
    param.uid = this.getColletion().collection('usuarios').doc(param.uid);
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('resenas').doc(Math.random().toString()).set(param).then((data) => {
        resolve(data);
      }).catch(error => {
        reject(error);
      });
    });
  }

  public updateCommerce(informations: any, id: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('comercios').doc(id).update(informations).then((data) => {
        resolve(data);
      }, error => {
        reject(error);
      }).catch(error => {
        reject(error);
      });
    });
  }

  public updateProduct(informations: any, id: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('productos').doc(id).update(informations).then((data) => {
        resolve(data);
      }, error => {
        reject(error);
      }).catch(error => {
        reject(error);
      });
    });
  }

  public updateProfile(uid, param): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('usuarios').doc(uid).update(param).then((data) => {
        resolve(data);
      }).catch(error => {
        reject(error);
      });
    });
  }

  public getMyReviews(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('resenas', ref => ref.where('criticoID', '==', id)).get().subscribe(async (review) => {
        let data = review.docs.map((element) => {
          let item = element.data();
          item.id = element.id;
          return item;
        });
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  public getReviewsByCriticado(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('resenas', ref => ref.where('criticadoID', '==', id)).get().subscribe((review) => {
        let data = review.docs.map((element) => {
          let item = element.data();
          item.id = element.id;
          return item;
        });
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  public getSearch(ele: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('productos', ref => ref.where('nombre', '>=', ele)).get().subscribe((data) => {
        var producto = data.docs.map(doc => {
          var item = doc.data();
          item.id = doc.id;
          return item;
        });
        resolve(producto);
      }, error => {
        reject(error);
      });
    });
  }

  public getSearch2(ele: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('comercios', ref => ref.where('nombreComercial', '>=', ele)).get().subscribe((data) => {
        var producto = data.docs.map(doc => {
          var item = doc.data();
          item.id = doc.id;
          return item;
        });
        resolve(producto);
      }, error => {
        reject(error);
      });
    });
  }

  public getBanners(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('promociones').get().subscribe((venue: any) => {
        // resolve(venue.data());
        let data = venue.docs.map(element => {
          let item = element.data();
          item.id = element.id;
          return item;
        });
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }
  public getComercestype(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('categorias').get().subscribe((venue) => {
        let data = venue.docs.map(element => {
          let item = element.data();
          item.id = element.id;
          return item;
        });
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  public getCommerces(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('comercios', ref => ref.where("estado", "==", "aprobado")).get().subscribe((venue) => {
        let data = venue.docs.map(element => {
          let item = element.data();
          item.id = element.id;
          return item;
        });
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  public getCommerceByUser(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getColletion().collection('comercios', ref => ref.where("usuarioID", "==", id)).get().subscribe((venue) => {
        let data = venue.docs.map(element => {
          let item = element.data();
          item.id = element.id;
          return item;
        });
        resolve(data[0]);
      }, error => {
        reject(error);
      });
    });
  }
  public getCantidadPorTipoRestriccion(id, producto): Promise<any> {
    return new Promise<any>((resolve, reject) => {

      this.getColletion().collection('servicios', ref => ref.where("clienteID", "==", id)).get().subscribe((venue) => {
        let data = venue.docs.map(element => {
          let item = element.data();
          item.productos = JSON.parse(item.productos);
          item.id = element.id;
          return item;
        });
        data = data.filter(e => e.productos.some(a => a.id == producto));
        let cantidad = 0;
        data.map(element => {
          cantidad = cantidad + element.productos.find(a => a.id == producto).cantidad
          return element;
        })
        resolve(cantidad);
      }, error => {
        reject(error);
      });
    });
  }
  httpPost(url, body) {
    const header = {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Authorization', `Bearer ${environment.stripe.sk}`)
    };
    const order = this.JSON_to_URLEncoded(body);
    console.log(order)
    return this.http.post(url, order, header);
  }

  httpGet(url) {
    const header = {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Authorization', `Bearer ${environment.stripe.sk}`)
    };

    return this.http.get(url, header);
  }

  JSON_to_URLEncoded(element, key?, list?) {
    let new_list = list || [];
    if (typeof element == "object") {
      for (let idx in element) {
        this.JSON_to_URLEncoded(
          element[idx],
          key ? key + "[" + idx + "]" : idx,
          new_list
        );
      }
    } else {
      new_list.push(key + "=" + encodeURIComponent(element));
    }
    return new_list.join("&");
  }

  loginGoogle(){
return this.googlePlus.login({}).then(res=>{
   const usuarioDataGoogle = res;
  return this.fireAuth.auth.signInWithCredential(firebase.auth.GoogleAuthProvider.credential(null, usuarioDataGoogle.accessToken))
 })
  }


  loginConFacebook(){
  return this.fb.login(['email', 'public_profile'])
  .then((res : FacebookLoginResponse ) => {
    const credencial_fb = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
   return this.fireAuth.auth.signInWithCredential(credencial_fb);
   })
  }
}
