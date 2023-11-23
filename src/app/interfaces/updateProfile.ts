export interface UpdateProfile{
  
    nombres: any | '',
  apellidos: any | '',
  email: string,
  imagen: any | 'assets/imgs/user.png';
  telefono: any | '';
  idUrl: string | '';
  saldo: number | 0;
}