import { Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters'
import config from 'config'
import { ogg } from './ogg.js'
import { openai } from './openAi.js'
import { code } from 'telegraf/format'

//Ініціалізація змінної нової сессії
const INITIAL_SESSION = {
    messages: [],
}

const bot = new Telegraf(config.get("TELEGRAM_TOKEN"));

//Використяння телеграм ботом сессій
bot.use(session())

//Обробка команди створення нового чату
bot.command('new', async (ctx) => {
    ctx.session = INITIAL_SESSION
    await ctx.reply('Очікуєтся повідомлення')
})

//Обробка команди запуску
bot.command('start', async (ctx) => {
    ctx.session = INITIAL_SESSION
    await ctx.reply('Очікуєтся повідомлення')
})

//Відстеження голосових повідомлень
bot.on(message('voice'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION
    try {
        await ctx.reply(code('Повідомлення було отриманне. Очікується відповідь сервера'))
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = String(ctx.message.from.id)
        const oggPath = await ogg.create(link.href, userId)
        const mp3Path = await ogg.toMp3(oggPath, userId)
        const text = await openai.transcription(mp3Path)
        ctx.session.messages.push({ role: openai.roles.USER, content: text })
        const response = await openai.chat(ctx.session.messages)
        ctx.session.messages.push({ role: openai.roles.ASSISTANT, content: response.content })
        await ctx.reply(response.content)
    } catch (e) {
        console.log('Error while voice message.', e.message)
    }
})

//Відстеження текстових повідомлень
bot.on(message('text'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION
    try {
        await ctx.reply(code('Повідомлення було отриманне. Очікується відповідь сервера'))
        ctx.session.messages.push({ role: openai.roles.USER, content: ctx.message.text })
        const response = await openai.chat(ctx.session.messages)
        ctx.session.messages.push({ role: openai.roles.ASSISTANT, content: response.content })
        await ctx.reply(response.content)
    } catch (e) {
        console.log('Error while voice message.', e.message)
    }
})

//Запуск бота
bot.launch();

//Зупинка бота у разі завершення ноди
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))