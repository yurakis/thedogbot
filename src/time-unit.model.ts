export class TimeUnit {
  public static items: Map<string, TimeUnitData> = new Map([
    ['second', {
      value: 1000,
      thresholds: ['sec', 'secs', 'second', 'seconds', 's', 'сек', 'секунд', 'секунда', 'секунды', 'с'],
      nameRoot: 'секунд',
      endings: ['', 'а', 'ы', 'ы', 'ы', '', '', '', '', '']
    }],
    ['minute', {
      value: 60000,
      thresholds: ['min', 'mins', 'minute', 'minutes', 'm', 'мин', 'минут', 'минута', 'минуты', 'м'],
      nameRoot: 'минут',
      endings: ['', 'а', 'ы', 'ы', 'ы', '', '', '', '', '']
    }],
    ['hour', {
      value: 3600000,
      thresholds: ['hour', 'hours', 'h', 'час', 'часа', 'часов', 'ч'],
      nameRoot: 'час',
      endings: ['ов', '', 'а', 'а', 'а', 'ов', 'ов', 'ов', 'ов', 'ов']
    }]
  ]);

  public name: string;
  public value: number;
  public isEmpty = true;

  constructor(threshold: string) {
    const _threshold = threshold.toLowerCase();

    outer: for (const item of Array.from(TimeUnit.items)) {
      const thresholds = item[1].thresholds;

      for (let i = 0; i < item[1].thresholds.length; i++) {
        const __threshold = thresholds[i];

        if (__threshold === _threshold) {
          this.name = item[0];
          this.value = item[1].value;
          this.isEmpty = false;

          break outer;
        }
      }
    }
  }

  getCasedName(value: number): string {
    const n = Number(String(value).slice(-1));
    const item = TimeUnit.items.get(this.name);

    return item.nameRoot + item.endings[n];
  }
}

interface TimeUnitData {
  value: number;
  thresholds: string[];
  nameRoot: string;
  endings: string[];
}
