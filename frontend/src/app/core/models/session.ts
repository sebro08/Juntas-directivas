import {SessionStatus} from "./session-status";

export interface Session {
  id: number;
  title: string;
  date: string;
  timeStart: string;
  status: SessionStatus;
}
