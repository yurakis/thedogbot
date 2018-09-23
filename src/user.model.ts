export class User {
  public id: number;
  public isBot: boolean;
  public firstNme: string;
  public lastName: string;
  public username: string;
  public languageCode: string;
  private _dogCount: number;

  constructor(data) {
    this.id = data.id;
    this.isBot = data.is_bot;
    this.firstNme = data.first_name;
    this.lastName = data.last_name;
    this.username = data.username ? `@${data.username}` : this.fullName;
    this.languageCode = data.language_code;
    this._dogCount = 0;
  }

  public get dogCount(): number {
    return this._dogCount;
  }

  public markAsDog() {
    this._dogCount++;
  }

  public get fullName(): string {
    return [this.firstNme, this.lastName].join(' ');
  }
}
