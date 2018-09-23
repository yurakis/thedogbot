import * as TelegramBot from 'node-telegram-bot-api';
import { config } from './config';
import { Chat } from './chat.model';

interface ITelegramBot {
  on(type: string, callback: Function): void;
  onText(regex: RegExp, callback: Function): void;
  sendMessage(chatId: number, message: string, options: any): Promise<any>;
}

export class DogBot implements ITelegramBot {
  private bot: ITelegramBot;
  private chats: Map<number, Chat>;

  constructor() {
    this.bot = new TelegramBot(config.token, {polling: true});
    this.chats = new Map();
  }

  public getChat(id: number): Chat | null {
    return this.chats.get(id) || null;
  }

  public addChat(data): Chat {
    const chat = new Chat(this, data);

    this.chats.set(chat.id, chat);

    return chat;
  }

  public on(type: string, callback: Function) {
    this.bot.on(type, callback);
  }

  public onText(regex: RegExp, callback: Function) {
    this.bot.onText(regex, callback);
  }

  public sendMessage(chatId: number, message: string[] | string, options = {parse_mode: 'html'}): Promise<any> {
    return this.bot.sendMessage(chatId, Array.isArray(message) ? message.join('\n') : message, options);
  }
}
