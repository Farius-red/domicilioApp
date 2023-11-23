import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalCodigoRegistroPage } from './modal-codigo-registro.page';

const routes: Routes = [
  {
    path: '',
    component: ModalCodigoRegistroPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalCodigoRegistroPageRoutingModule {}
