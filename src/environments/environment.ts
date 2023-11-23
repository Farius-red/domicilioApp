// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  firebase: {
    apiKey: "AIzaSyAQ1ZPYIzovCtSK7NXGkmJkU0DeuoCIEHQ",
    authDomain: "youu-domicilios.firebaseapp.com",
    databaseURL: "https://youu-domicilios.firebaseio.com",
    projectId: "youu-domicilios",
    storageBucket: "youu-domicilios.appspot.com",
    messagingSenderId: "660950176335",
    appId: "1:660950176335:web:6cae63121f7bde2b22903a",
    measurementId: "G-L6DMKJ26J1"
  },
  llavesOneginal: [{
    tipoUsuario: "user",
    onesignal: {
      appId: 'd1e2c37f-efb4-4739-9c61-2d8883d271e6',
      googleProjectNumber: '660950176335',
      restKey: 'MmNiNzdlNTYtYjRjYy00MDRlLThhZDItNGRiMTg4MzU4MTc1'
    }
  },
  {
    tipoUsuario: "conductor",
    onesignal: {
      appId: 'e2d7250d-f965-4cb2-98da-4467acd59e8a',
      googleProjectNumber: '660950176335',
      restKey: 'YWNmOTI4OGEtYjgwYy00YTU4LWExNzctMzQ2MWUwZWQxNzI1'
    }
  },
  {
    tipoUsuario: "comercio",
    onesignal: {
      appId: '96fb656c-7a7a-4d8d-a996-7ec4e6dd519d',
      googleProjectNumber: '660950176335',
      restKey: 'OTk5NzA3ZTctZWM5NC00MmE2LTgyNGItNTFiNmVkZWE1ZDQ4'
    }
  },],
  stripe: {
    sk: ''
  },
  paypal: {
    sandbox: '',
    production: 'YOUR_PRODUCTION_CLIENT_ID'
  },
  general: {
    symbol: '$',
    code: 'COP'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
