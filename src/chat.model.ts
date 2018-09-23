import { DogBot } from './bot.model';
import { StorageService } from './storage.service';
import { User } from './user.model';

export class Chat {
  public readonly id: number;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly username: string;
  public readonly type: 'private';
  public readonly storage: StorageService;
  public members: User[];
  private readonly bot: DogBot;

  constructor(bot: DogBot, data) {
    this.bot = bot;
    this.storage = new StorageService();
    this.members = [];
    this.id = data.id;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.username = data.username;
    this.type = data.type;
  }

  public sendMessage(message: string[] | string, options?: any): Promise<any> {
    return this.bot.sendMessage(this.id, message, options);
  }

  public registerUser(data): User {
    const oldUser = this.getUser(data.id);

    if (oldUser) {
      return oldUser;
    }

    const user = new User(data);

    this.members.push(user);

    return user;
  }

  public getUser(id: number): User | null {
    return this.members.find((user) => user.id === id) || null;
  }
}
