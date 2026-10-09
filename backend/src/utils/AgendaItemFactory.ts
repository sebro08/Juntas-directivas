// src/services/AgendaItemFactoryService.ts
import { InformativeAgendaItem } from '../model/InformativeAgendaItem';
import { StrategicAgendaItem } from '../model/StrategicAgendaItem';
import { ApprovalAgendaItem } from '../model/ApprovalAgendaItem';
import { AgendaItem } from '../model/AgendaItem';

export class AgendaItemFactory {
  static create(options: {
    hasAnnotations: boolean;
    hasDecisions: boolean;
    hasTasks: boolean;
    isApproval?: boolean;
  }): AgendaItem {
    if (options.isApproval) {
      return new ApprovalAgendaItem();
    }
    if (options.hasAnnotations && !options.hasDecisions && !options.hasTasks) {
      return new InformativeAgendaItem();
    }
    if (options.hasAnnotations && options.hasDecisions && options.hasTasks) {
      return new StrategicAgendaItem();
    }
    throw new Error(
      'Datos insuficientes: recuerda que informative requiere solo anotaciones; strategic requiere anotaciones, decisiones y tareas; approval requiere el flag isApproval.'
    );
  }
}
