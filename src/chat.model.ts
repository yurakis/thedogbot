export class Chat {
  public id: number;
  public firstName: string;
  public lastName: string;
  public username: string;
  public type: 'private';

  constructor(data) {
    this.id = data.id;
    this.firstName= data.first_name;
    this.lastName = data.last_name;
    this.username = data.username;
    this.type = data.type;
  }
}
