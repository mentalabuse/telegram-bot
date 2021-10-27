const TelegramApi = require('node-telegram-bot-api')
require('dotenv').config()
const sequelize = require('./db')
const UserModel = require('./models')
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

const start = async () => {
  try {
      await sequelize.authenticate()
      await sequelize.sync()
  } catch (error) {
    console.log('Connection error', error);
  }


  bot.setMyCommands([
    {command: '/start', description: 'Приветствие'},
    {command: '/info', description: 'Информация'},
    {command: '/game', description: 'Игра'}
  ])
  
  bot.on('message', async msg => {
    const text = msg.text
    const chatId = msg.chat.id
    const userName = msg.chat.first_name

    try {
      if (text === '/start') {
      await UserModel.create({chatId})
      await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/b50/063/b5006369-8faa-44d7-9f02-1ca97d82cd49/2.webp')
      return bot.sendMessage(chatId, `Добро пожаловать, ${userName}!`)
      }
      if (text === '/info') {
        const user = await UserModel.findOne({chatId})
      return bot.sendMessage(chatId, `У тебя ${user.right} правильных и ${user.wrong} неправильных ответов`)
      }
      if (text === '/game') {
        return startGame(chatId)
      }
      return bot.sendMessage(chatId, 'Не понял') 
    } catch (error) {
      return bot.sendMessage(chatId, 'Какая-то ошибка')
    }

  })

  bot.on('callback_query', async msg => {
    const data = msg.data
    const chatId = msg.message.chat.id
    if (data === '/again') {
      return startGame(chatId)
    }
    const user = await UserModel.findOne({chatId})
    if (data == chats[chatId]) {
      user.right += 1;
      await bot.sendMessage(chatId, `Ты отгадал цифру ${chats[chatId]}`, againOptions)
    } else {
      user.wrong += 1;
      await bot.sendMessage(chatId, `Не угадал, я загадал цифру ${chats[chatId]}`, againOptions)
    }
    await user.save()
  })
}

start()