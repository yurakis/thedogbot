import { Promise, PromiseStatus } from '../models';

export class PromiseService {
  private promises: Map<number, Promise>;
  private promiseCallback: Function;

  constructor() {
    this.promises = new Map();
  }

  public addPromise(userId: number, interval: number): Promise {
    const promise: Promise = {
      userId,
      id: this.promises.size + 1,
      status: PromiseStatus.NEW
    };

    promise.interval = setTimeout(() => {
      this.updatePromiseStatus(promise.id, PromiseStatus.PENDING);
      this.promiseCallback(promise);
    }, interval);
    this.promises.set(promise.id, promise);

    return promise;
  }

  public onPromiseEnd(callback: Function): void {
    this.promiseCallback = callback;
  }

  public updatePromiseStatus(id, status: PromiseStatus): void {
    const promise = this.getPromise(id);

    if (promise === null) {
      return;
    }

    promise.status = status;
    clearInterval(promise.interval);
    this.promises.set(id, promise);
  }

  public getPromise(id: number): Promise | null {
    return this.promises.get(id) || null;
  }
}
