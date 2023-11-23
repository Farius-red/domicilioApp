import { ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-modal-codigo-registro',
  templateUrl: './modal-codigo-registro.page.html',
  styleUrls: ['./modal-codigo-registro.page.scss'],
})
export class ModalCodigoRegistroPage implements OnInit {

 public rgCodigoForm: FormGroup;

  constructor(private modalCtr: ModalController,
    private formBuilder: FormBuilder
    ) { }

  ngOnInit() {
    this.buildForm();
  }

  public getError(controlName: string): string {
    let error = '';
    const control = this.rgCodigoForm.get(controlName);
    if (control.touched && control.errors != null) {
      error = JSON.stringify(control.errors);
    }
    return error;
  }

  private buildForm(){
    const minCodeLength = 4;

    this.rgCodigoForm = this.formBuilder.group({
      codigo: new FormControl ('',[Validators.min(minCodeLength), Validators.required])
    })
  }

  cerrarModal(){
    this.modalCtr.dismiss();
  }

  rgCodigo(){
    
      console.log(this.rgCodigoForm.value)
      this.modalCtr.dismiss();
  
  }
}
