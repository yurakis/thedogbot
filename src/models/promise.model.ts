export enum PromiseStatus {
  NEW,
  CANCELLED,
  PENDING,
  DONE,
  FAILED
}

export interface Promise {
  id: number;
  status: PromiseStatus;
  interval?: number;
  userId: number;
}

export class PromiseT {
  public static readonly items: Map<number, Promise> = new Map();
  private static _onPromiseFinished: Function;
  public readonly id: number;
  public readonly status: PromiseStatus;
  public readonly interval?: number;
  public readonly userId: number;

  public static onPromiseFinished(callback: Function) {
    this._onPromiseFinished = callback;
  }

  constructor(data) {
    this.id = data.id;
    this.status = data.status;
    this.interval = data.interval;
    this.userId = data.userId;
  }
}
