import { User } from './user.model';

export enum PromiseStatus {
  DONE,
  PENDING,
  FAILED,
  CANCELLED
}

export interface Promise {
  id: number;
  status: PromiseStatus;
  interval?: number;
  user: User;
}
