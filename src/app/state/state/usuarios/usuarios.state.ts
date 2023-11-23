import { UpdateProfile } from 'src/app/interfaces/updateProfile';
import { ApisService } from 'src/app/services/apis.service';
import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { GetCurrentUser, UpdateUsuario } from './usuarios.actions';
import { Observable, } from 'rxjs';



export class UsuariosStateModel  {
  
  usuario: UpdateProfile[];
  
};

@State<UsuariosStateModel>({
  name: 'usuarios',
  defaults:{
    usuario:[]
      }

})
@Injectable()
export class UsuariosState {

 idU= localStorage.getItem('uid');
 result:any;

constructor(private apiS: ApisService){}



@Selector()
public static getUsuCurrent
({usuario}: UsuariosStateModel):UpdateProfile[]{
  return usuario
}

@Action(GetCurrentUser)
 getCurrentUser(
   {getState, setState}:StateContext<UsuariosStateModel>,
  ):Observable<UpdateProfile[]>{

   this.apiS.getMyProfile(this.idU)
   .then((usuario:UpdateProfile[])=>{
          const state = getState();
          setState({...state, usuario})
          this.result = state
   })
   
   return this.result
  }

 

  @Action(UpdateUsuario)
  updateUsu(
    { getState, setState }: StateContext<UsuariosStateModel>,
    { payload }: UpdateUsuario
    
  ): Observable<UpdateProfile[]> {

    
    this.apiS.updateProfile(this.idU,payload).then((usuario:UpdateProfile[]) => {
       
       const state = getState();
           setState({...state , usuario })   
             this.result = state
          })
        
           return this.result
  }
}
