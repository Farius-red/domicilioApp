import { VariationsPageModule } from './pages/variations/variations.module';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';

import { environment } from 'src/environments/environment';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { ChooseAddressPageModule } from 'src/app/pages/choose-address/choose-address.module';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Camera } from '@ionic-native/camera/ngx';
import { PayPal } from '@ionic-native/paypal/ngx';

import { SelectDriversPageModule } from './pages/select-drivers/select-drivers.module';
import { VariationPageModule } from './pages/variation/variation.module'

//IMPORTAMOS GEOLOCATION Y GEOCODER
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';;
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';


import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxsModule } from '@ngxs/store';
import { GeneralesState } from '../app/state/generales.state';
import { Facebook } from '@ionic-native/facebook/ngx';
import{ GooglePlus } from '@ionic-native/google-plus/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { UsuariosState } from './state/state/usuarios/usuarios.state';

export function customTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
export function LanguageLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}
@NgModule({
  declarations: [AppComponent],
  entryComponents: [
  ],
  imports: [


    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireStorageModule,
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireDatabaseModule,
    ChooseAddressPageModule,
    HttpClientModule,
    SelectDriversPageModule,
    VariationPageModule,
    VariationsPageModule,
    NgxsModule.forRoot([GeneralesState,UsuariosState], {
      developmentMode: !environment.production,
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: customTranslateLoader,
        deps: [HttpClient]
      }
    }),
   
    
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Diagnostic,
    Geolocation,
    Camera,
    PayPal,
    NativeGeocoder,
    NativeAudio,
    AppVersion,  
    AndroidPermissions,
    FirebaseX, 
    Facebook,
    GooglePlus,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
 
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
