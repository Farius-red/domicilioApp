import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddNewAddressPageRoutingModule } from './add-new-address-routing.module';

import { AddNewAddressPage } from './add-new-address.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { PopoverComponent } from 'src/app/components/popover/popover.component';
import { SharedModule } from 'src/app/directives/shared.module';

@NgModule({
  entryComponents: [
    PopoverComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddNewAddressPageRoutingModule,
    ComponentsModule,
    SharedModule
  ],
  declarations: [AddNewAddressPage]
})
export class AddNewAddressPageModule { }
