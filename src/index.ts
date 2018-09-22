import * as TelegramBot from 'node-telegram-bot-api';
import { config } from './config';
import { TimeUnit } from './time-unit.model';
import { StorageService } from './storage.service';
import { MessageService } from './message.service';
import { User } from './user.model';
import { Promise as _Promise, PromiseStatus } from './promise.model';

const bot = new TelegramBot(config.token, {polling: true});
const regex = {
  part1: '\\d+(\\s)?',
  part2: '[A-Za-zА-Яа-я]+'
};
let wasInit = false;
let storageService: StorageService;
let messageService: MessageService;

// init functionality
bot.on('message', (response) => {
  if (wasInit) {
    return;
  }

  storageService = new StorageService(response.chat);
  messageService = new MessageService(bot, storageService);

  storageService.onPromiseEnd(async (promise: _Promise) => {
    await messageService.sendMessage(`Обещание #${promise.id} от @${promise.user.username} подошло к концу`);
    await messageService.sendMessage(`Выполнено? Отправь <b>#${promise.id}</b> +\nНе выполнено? Отправь <b>#${promise.id} -</b>`);
  });

  wasInit = true;
});

bot.onText(new RegExp(regex.part1 + regex.part2, 'g'), async (response, match) => {
  const _match = match[0];
  const timeUnit = new TimeUnit(_match.replace(new RegExp(regex.part1), ''));

  if (timeUnit.isEmpty) {
    return;
  }

  const originalValue = Number(_match.replace(new RegExp(regex.part2), ''));
  const promise = storageService.addPromise(new User(response.from), originalValue * timeUnit.value);

  await messageService.sendMessage('Упс! Обнаружен дедлайн!');
  await messageService.sendMessage(`@${response.from.username} пообещал сделать что-то через <b>${originalValue} ${timeUnit.getCasedName(originalValue)}</b>`);
  await messageService.sendMessage(`Обещание <b>#${promise.id}</b>. Время пошло!`);
  await messageService.sendMessage(`Произошла ошибка? Отправь <b>#${promise.id}</b> +- что бы отменить`);
});

bot.onText(/^#(\d+) (\+|-|\+-)$/, (response, match) => {
  const _match = match[0];
  const promiseId = Number(_match.replace(/\D/g, ''));
  const promise = storageService.getPromise(promiseId);
  let status: PromiseStatus;
  let message: string;

  if (promise === null) {
    message = 'Не нашел обещания с таким ID';
  } else if (promise.status !== PromiseStatus.PENDING) {
    message = 'Обещание уже завершено';
  } else if (response.from.id === promise.user.id) {
    message = 'К сожалению, у тебя нет права голоса';
  } else {
    const username = promise.user.username;

    switch (_match.replace(/#\d+ /g, '')) {
      case '+': {
        status = PromiseStatus.DONE;
        message = `Поздравляю, @${username}! Обещание сдержано!`;
        break;
      }
      case '-': {
        status = PromiseStatus.FAILED;
        message = `Ха! ${username} не здержал слово!`;
        break;
      }
      case '+-': {
        status = PromiseStatus.CANCELLED;
        message = 'Обещание отменено';
        break;
      }
    }
  }

  if (status && status !== promise.status) {
    storageService.finishPromise(promiseId, status);
  }

  messageService.sendMessage(message);
});
