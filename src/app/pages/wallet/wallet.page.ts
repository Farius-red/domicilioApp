import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  share(){
    
    let options={
      message: `Ingresa Codigo:   \n en tu registro y permiteme ganar dinero por ello`,
      subject: 'the subject', // fi. for email
      files: ['', ''], // an array of filenames either locally or remotely
      url: `/register`,
      chooserTitle: 'Pick an app', // Android only, you can override the default share sheet title
      appPackageName: "io.youuDomicilios.app"
    }

    console.log(options)
  }


  }