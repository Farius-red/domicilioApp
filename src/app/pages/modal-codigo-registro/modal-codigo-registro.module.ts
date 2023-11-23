import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalCodigoRegistroPageRoutingModule } from './modal-codigo-registro-routing.module';

import { ModalCodigoRegistroPage } from './modal-codigo-registro.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ModalCodigoRegistroPageRoutingModule
  ],
  declarations: [ModalCodigoRegistroPage],

  exports:[ModalCodigoRegistroPage]

  })
export class ModalCodigoRegistroPageModule {}
