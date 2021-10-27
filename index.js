const TelegramApi = require('node-telegram-bot-api')
require('dotenv').config()
const {gameOptions, againOptions} = require('./options')

const token = process.env.BOT_TOKEN

const bot = new TelegramApi(token, {polling: true})

const chats = {}


const startGame = async (chatId) => {
  await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 0 до 9, а ты отгадай')
  const randomNumber = Math.floor(Math.random() * 10)
  chats[chatId] = randomNumber
  await bot.sendMessage(chatId, 'Отгадывай', gameOptions)
  }

const start = () => {
  bot.setMyCommands([
    {command: '/start', description: 'Приветствие'},
    {command: '/info', description: 'Информация'},
    {command: '/game', description: 'Игра на калич'}
  ])
  
  bot.on('message', async msg => {
    const text = msg.text
    const chatId = msg.chat.id
    const userName = msg.chat.first_name
    if (text === '/start') {
    await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/b50/063/b5006369-8faa-44d7-9f02-1ca97d82cd49/2.webp')
    return bot.sendMessage(chatId, `Добро пожаловать, ${userName}!`)
    }
    if (text === '/info') {
    return bot.sendMessage(chatId, `Это телеграм бот Арутюна`)
    }
    if (text === '/game') {
      return startGame(chatId)
    }
    return bot.sendMessage(chatId, 'Не понял')
  })

  bot.on('callback_query', async msg => {
    const data = msg.data
    const chatId = msg.message.chat.id
    if (data === '/again') {
      return startGame(chatId)
    }
    if (data == chats[chatId]) {
      return bot.sendMessage(chatId, `Ты отгадал цифру ${chats[chatId]}`, againOptions)
    } else {
      return bot.sendMessage(chatId, `Не угадал, я загадал цифру ${chats[chatId]}`, againOptions)
    }
  })
}

start()