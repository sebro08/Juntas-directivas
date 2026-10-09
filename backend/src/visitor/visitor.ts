// src/patterns/visitor/Visitor.ts
import { Acta } from '../model/Acta';
import { Session } from '../model/Session';

export abstract class Visitor {
  abstract visitActa(acta: Acta): void;
  abstract visitSession(session: Session): void;
}
