export class User {
  public id: number;
  public isBot: boolean;
  public firstNme: string;
  public lastName: string;
  public username: string;
  public languageCode: string;

  constructor(data) {
    this.id = data.id;
    this.isBot = data.is_bot;
    this.firstNme = data.first_name;
    this.lastName = data.last_name;
    this.username = data.username;
    this.languageCode = data.language_code;
  }
}
