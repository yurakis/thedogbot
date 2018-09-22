export class MessageService {
  private bot;
  private storageService;
  private messages: string[];
  private isSending = false;

  constructor(bot, storageService) {
    this.bot = bot;
    this.storageService = storageService;
    this.messages = [];
  }

  // TODO: implement humanlike behaviour
  public sendMessage(message: string): Promise<any> {
    return this._sendMessage(message);
  }

  private addMessage(message?: string) {
    if (message) {
      this.messages.push(message);
    }

    if (this.messages.length === 0) {
      return;
    }

    setTimeout(() => {
      (this.isSending ? new Promise((resolve) => setTimeout(resolve(), 2000)) : this._sendMessage(this.messages[0])).then(() => {
        this.addMessage();
      });
    }, 2000);
  }

  private _sendMessage(message: string): Promise<any> {
    this.isSending = true;
    this.messages.shift();

    return this.bot
      .sendMessage(this.storageService.chat.id, message, {parse_mode: 'html'})
      .then(() => this.isSending = false)
      .catch(() => this.isSending = false);
  }
}
