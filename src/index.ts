import { DogBot } from './bot.model';
import { TimeUnit } from './time-unit.model';
import { User } from './user.model';
import { Promise as _Promise, PromiseStatus } from './promise.model';

const bot = new DogBot();
const regex = {
  part1: '\\d+(\\s)?',
  part2: '[A-Za-zА-Яа-я]+'
};

// init functionality for each chat
bot.on('message', (response) => {
  const chatId = response.chat.id;

  if (bot.getChat(chatId)) {
    return;
  }

  const chat = bot.addChat(response.chat);
  chat.storage.onPromiseEnd(async (promise: _Promise) => {
    chat.sendMessage([
      `Обещание #${promise.id} от ${chat.getUser(response.from.id).username} подошло к концу`,
      `Выполнено? Отправь <b>#${promise.id}</b> +\nНе выполнено? Отправь <b>#${promise.id} -</b>`
    ]);
  });
});

bot.onText(new RegExp(regex.part1 + regex.part2, 'g'), async (response, match) => {
  const _match = match[0];
  const timeUnit = new TimeUnit(_match.replace(new RegExp(regex.part1), ''));
  const chat = bot.getChat(response.chat.id);

  if (timeUnit.isEmpty || !chat.getUser(response.from.id)) {
    return;
  }

  const originalValue = Number(_match.replace(new RegExp(regex.part2), ''));
  const promise = chat.storage.addPromise(response.from.id, originalValue * timeUnit.value);

  chat.sendMessage([
    'Упс! Обнаружен дедлайн!',
    // tslint:disable-next-line:max-line-length
    `Юзер ${response.from.username} пообещал сделать что-то через <b>${originalValue} ${timeUnit.getCasedName(originalValue)}</b>`,
    `Обещание <b>#${promise.id}</b>. Время пошло!`
  ]);
});

bot.onText(/^#(\d+) (\+|-|\+-)$/, (response, match) => {
  const _match = match[0];
  const promiseId = Number(_match.replace(/\D/g, ''));
  const chat = bot.getChat(response.chat.id);
  const promise = chat.storage.getPromise(promiseId);
  const user = chat.getUser(promise.userId);
  let status: PromiseStatus;
  let message: string;

  if (promise === null) {
    message = 'Не нашел обещания с таким ID';
  } else if (promise.status !== PromiseStatus.PENDING) {
    message = 'Обещание уже завершено';
  } else if (response.from.id === user.id) {
    message = 'К сожалению, у тебя нет права голоса';
  } else {
    switch (_match.replace(/#\d+ /g, '')) {
      case '+': {
        status = PromiseStatus.DONE;
        message = `Поздравляю, ${user.username}! Обещание сдержано!`;
        break;
      }
      case '-': {
        status = PromiseStatus.FAILED;
        message = `Ха! Юзер ${user.username} не здержал слово. Ты пёс!`;
        user.markAsDog();
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
    chat.storage.finishPromise(promiseId, status);
  }

  chat.sendMessage(message);
});

bot.onText(/\/thedogbot rules/, (response) => {
  bot.sendMessage(response.chat.id, [
    'Я слежу за ключевыми фразами вроде <b>"20 сек"</b>, <b>"10 минут"</b> и засекаю время.',
    'По истечению заданного времени один з учасников чата должен дать ответ, было ли здержано обещание.',
    'Да: <b>#{promiseID} +</b>',
    'Нет: <b>#{promiseID} -</b>',
    'Кроме этого, есть возможность отменить обещание: <b>#{promiseID} +-</b>',
    'Кто не выполнил обещание, тот пёс!',
    'Зарегистрироваться',
    '<b>/thedogbot register</b>',
    'Рейтинг псов:',
    '<b>/thedogbot rating</b>'
  ]);
});

bot.onText(/\/thedogbot register/, (response) => {
  const chat = bot.getChat(response.chat.id);
  const user = chat.registerUser(response.from);

  chat.sendMessage(`Юзер ${user.username} зарегистрировался!`);
});

bot.onText(/\/thedogbot rating/, (response) => {
  const chat = bot.getChat(response.chat.id);

  chat.sendMessage(
    chat.members
      .sort((a, b) => b.dogCount - a.dogCount)
      .map((member, index) => `${index + 1}. ${member.firstNme} ${member.lastName} (${member.username}) - ${member.dogCount}`)
  );
});
