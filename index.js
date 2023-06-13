const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '5990107085:AAG2os1HbNsUieDxGUlNIl8Tkr5Xkr4KDac';
const webAppUrl = 'https://musical-pie-bcf630.netlify.app';

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text === '/start') {
        await bot.sendMessage(chatId, 'Нижче появиться кнопка заповнити форму', {
            reply_markup: {
                keyboard: [
                    [{text: 'Заповнити форму', web_app: {url: webAppUrl + '/form'}}]
                ]
            }
        })

        await bot.sendMessage(chatId, 'Переходіть в магазин кнопкою нижче', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Замовити', web_app: {url: webAppUrl}}]
                ]
            }
        })
    }

    if(msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data)
            console.log(data)
            await bot.sendMessage(chatId, "Дякую зворотний зв'язок!")
            await bot.sendMessage(chatId, 'Ваша країна: ' + data?.country);
            await bot.sendMessage(chatId, 'Ваша вулиця: ' + data?.street);

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Вся інформація буде представлена нижче');
            }, 3000)
        } catch (e) {
            console.log(e);
        }
    }
});

app.post('/web-data', async (req, res) => {
    const {queryId, products = [], totalPrice} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успішне замовлення',
            input_message_content: {
                message_text: ` Вітаю! Ви замовили товарів на суму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
            }
        })
        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))
