import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AppVService {

  constructor(private afs:AngularFirestore) { }

  getV(){

    if(environment.production){
      return this.afs.collection("production").doc("CO");
    }else{
      return this.afs.collection("tests").doc("CO");
    }
  }
}
