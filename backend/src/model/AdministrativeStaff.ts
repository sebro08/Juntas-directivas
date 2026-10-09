import { ChildEntity } from 'typeorm';
import { User } from './User';

@ChildEntity()
export class AdministrativeStaff extends User {
  // Propiedades específicas, en caso de ser necesario, que creo que de momento no
}
