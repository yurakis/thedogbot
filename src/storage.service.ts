import { User } from './user.model';
import { Chat } from './chat.model';
import { Promise, PromiseStatus } from './promise.model';

export class StorageService {
  public chat: Chat;
  private promises: Map<number, Promise>;
  private promiseCallback: Function;

  constructor(chat) {
    this.promises = new Map();
    this.chat = new Chat(chat);
  }

  public addPromise(user: User, interval: number): Promise {
    const promise: Promise = {
      user,
      id: this.promises.size + 1,
      status: 1
    };

    promise.interval = setTimeout(() => this.promiseCallback(promise), interval);
    this.promises.set(promise.id, promise);

    return promise;
  }

  public onPromiseEnd(callback: Function): void {
    this.promiseCallback = callback;
  }

  public finishPromise(id, status: PromiseStatus): void {
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
