import { UpdateProfile } from "src/app/interfaces/updateProfile";

export class UpdateUsuario {
  static readonly type = '[UpdateProfile] updateU';
  constructor(public payload: UpdateProfile[]) { }
}

export class GetCurrentUser {
  static readonly type = '[UpdateProfile] getCurrentUser'
  
}