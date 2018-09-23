import { DogBot, Promise as _Promise, PromiseStatus, TimeUnit } from './models';

const bot = new DogBot();
const regex = {
  part1: '\\d+(\\s)?',
  part2: '[A-Za-zА-Яа-я]+'
};

// init functionality for each chat
bot.on('message', (response) => {
  if (bot.getChat(response.chat.id)) {
    return;
  }

  const chat = bot.addChat(response.chat);

  chat.promiseService.onPromiseEnd((promise: _Promise) => {
    chat.sendMessage([
      `Обещание #${promise.id} от ${chat.getUser(promise.userId).username} подошло к концу`,
      `Выполнено? Отправь <b>#${promise.id}</b> +\nНе выполнено? Отправь <b>#${promise.id} -</b>`
    ]);
  });
});

bot.onText(new RegExp(regex.part1 + regex.part2, 'g'), (response, match) => {
  const _match = match[0];
  const timeUnit = new TimeUnit(_match.replace(new RegExp(regex.part1), ''));
  const chat = bot.getChat(response.chat.id);
  const user = chat.getUser(response.from.id);

  if (timeUnit.isEmpty || !user) {
    return;
  }

  const originalValue = Number(_match.replace(new RegExp(regex.part2), ''));
  const promise = chat.promiseService.addPromise(response.from.id, originalValue * timeUnit.value);

  chat.sendMessage([
    'Упс! Обнаружен дедлайн!',
    // tslint:disable-next-line:max-line-length
    `Юзер ${user.username} пообещал сделать что-то через <b>${originalValue} ${timeUnit.getCasedName(originalValue)}</b>`,
    `Обещание <b>#${promise.id}</b>. Время пошло!`
  ]);
});

bot.onText(/^#(\d+) ?(\+|-|\+-)$/, (response, match) => {
  const _match = match[0];
  const promiseId = Number(_match.replace(/\D/g, ''));
  const chat = bot.getChat(response.chat.id);

  if (!chat.getUser(response.from.id)) {
    return;
  }

  const promise = chat.promiseService.getPromise(promiseId);
  const user = promise ? chat.getUser(promise.userId) : null;
  const responseSign = _match.replace(/#\d+ /g, '');
  let status: PromiseStatus;
  let message: string;

  if (promise === null) {
    message = 'Не нашел обещания с таким ID';
  } else if ([PromiseStatus.CANCELLED, PromiseStatus.DONE, PromiseStatus.FAILED].includes(promise.status)) {
    message = 'Обещание уже завершено';
  } else if (response.from.id === user.id) {
    message = 'К сожалению, у тебя нет права голоса';
  } else if (promise.status !== PromiseStatus.PENDING && ['+', '-'].includes(responseSign)) {
    message = 'Время еще не вышло';
  } else {
    switch (responseSign) {
      case '+': {
        status = PromiseStatus.DONE;
        message = `Поздравляю, ${user.username}! Обещание сдержано!`;
        break;
      }
      case '-': {
        status = PromiseStatus.FAILED;
        message = `Ха! Юзер ${user.username} не здержал слово. Вот пёс!`;
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
    chat.promiseService.updatePromiseStatus(promiseId, status);
  }

  chat.sendMessage(message);
});

bot.onText(/\/rating/, (response) => {
  const chat = bot.getChat(response.chat.id);

  chat.sendMessage(chat.members.length > 0 ?
    chat.members
      .sort((a, b) => b.dogCount - a.dogCount)
      .map((member, index) => `${index + 1}. ${member.firstNme} ${member.lastName} (${member.username}) - ${member.dogCount}`) :
    'Пока никто не учавствует'
  );
});

bot.onText(/\/rules/, (response) => {
  bot.sendMessage(response.chat.id, [
    'Я слежу за ключевыми фразами вроде <b>"20 сек"</b>, <b>"10 минут"</b> и засекаю время.',
    'По истечению заданного времени один з учасников чата должен дать ответ, было ли здержано обещание.',
    'Да: <b>#{promiseID} +</b>',
    'Нет: <b>#{promiseID} -</b>',
    'Кроме этого, есть возможность отменить обещание: <b>#{promiseID} +-</b>',
    'Кто не выполнил обещание, тот пёс!',
    'Зарегистрироваться',
    '<b>/register</b>',
    'Рейтинг псов:',
    '<b>/rating</b>'
  ]);
});

bot.onText(/\/register/, (response) => {
  const chat = bot.getChat(response.chat.id);
  const oldUser = chat.getUser(response.from.id);

  if (oldUser) {
    return chat.sendMessage(`Юзер ${oldUser.username} уже зарегистрирован`);
  }

  const user = chat.registerUser(response.from);

  chat.sendMessage(`Юзер ${user.username} зарегистрировался!`);
});
