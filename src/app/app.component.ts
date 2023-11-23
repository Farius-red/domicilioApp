import { Component } from '@angular/core';

import { Platform,ActionSheetController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar} from '@ionic-native/status-bar/ngx';
import { Deeplinks } from '@ionic-native/deeplinks';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { UtilService } from 'src/app/services/util.service';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { ApisService } from 'src/app/services/apis.service';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private util: UtilService,  
    private firebaseX: FirebaseX,  
    private api: ApisService,
    private nativeAudio: NativeAudio,
    private actionSheetController: ActionSheetController,
    private translate: TranslateService,
    private androidPermissions: AndroidPermissions,
  ) {
    const lng = localStorage.getItem('language');
    if (!lng || lng === null) {
      localStorage.setItem('language', 'spanish');
    }
    this.translate.use(localStorage.getItem('language'));
    // Define custom  channel - all keys are except 'id' are optional.
var channel  = {
  id: "my_default_channel",
  name: "My Default Name",
  description: "My Default Description",
  sound: "tonoyouu",
  vibration: [500, 200, 500],
  light: true,
  lightColor: parseInt("FF0000FF", 16).toString(),
  //importance: 4,
  badge: false,
  //: -1
};
  this.firebaseX.setDefaultChannel(channel);
    this.initializeApp();
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: this.util.translate('New Notification'),
      mode: 'md',
      buttons: [{
        text: this.util.translate('OK'),
        icon: 'volume-mute',
        handler: () => {
          console.log('Delete clicked');
          this.nativeAudio.stop('audio').then(() => console.log('done'), () => console.log('error'));
        }
      }, {
        text: this.util.translate('Cancel'),
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
          this.nativeAudio.stop('audio').then(() => console.log('done'), () => console.log('error'));
        }
      }]
    });

    await actionSheet.present();
  }
  initializeApp() {
    this.platform.ready().then(() => {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).then(
        result => console.log('Has permission?',result.hasPermission),
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
      );
      
      this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS]);
      this.firebaseX.getToken()
        .then(token => {
          this.api.updateProfile(localStorage.getItem('uid'), { fcmToken: token });
          console.log(`The token is ${token}`)
        }) // save the token server-side and use it to push notifications to this device
        .catch(error => console.error('Error getting token', error));

      this.firebaseX.onMessageReceived()
        .subscribe(data => console.log(`User opened a notification ${data}`));

      this.firebaseX.onTokenRefresh()
        .subscribe((token: string) => {
          this.api.updateProfile(localStorage.getItem('uid'), { fcmToken: token });
          console.log(`The token is ${token}`)
        });
      /* setTimeout(async () => {
        await this.oneSignal.startInit(environment.llavesOneginal.find(e => e.tipoUsuario == 'user').onesignal.appId, environment.llavesOneginal.find(e => e.tipoUsuario == 'user').onesignal.googleProjectNumber);
        this.oneSignal.getIds().then((data) => {
          localStorage.setItem('fcm', data.userId);
        });
        this.oneSignal.handleNotificationReceived().subscribe(data => {
          console.log('got order', data);
          this.nativeAudio.play('audio', () => console.log('audio is done playing')).catch(error => console.log(error));
          this.nativeAudio.setVolumeForComplexAsset('audio', 1);
          this.presentActionSheet();
        });
        this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);
        this.oneSignal.handleNotificationOpened().subscribe(() => {
          // do something when a notification is opened
          this.nativeAudio.stop('audio').catch(error => console.log(error));
        });
        this.oneSignal.enableSound(true);
        this.oneSignal.enableVibrate(true);
        await this.oneSignal.endInit();
      }, 1000); */

      this.platform.backButton.subscribe(async () => {
        console.log('asd', this.router.url, 'ad', this.router.isActive('/tabs/', true))
        if (this.router.url.includes('/tabs/') || this.router.url.includes('/login')) {
          navigator['app'].exitApp();
        }
      });
         // Convenience to route with a given nav
        
      /*    Deeplinks.routeWithNavController(this.navChild, {
          '/about-us': AboutPage,
        }).subscribe((match) => {
          console.log('Successfully routed', match);
        }, (nomatch) => {
          console.warn('Unmatched Route', nomatch);
        }); */
      this.statusBar.backgroundColorByHexString('#74C044');
      this.splashScreen.hide();
      
    });
  }
}
