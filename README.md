# 🏠 Оселя — Telegram Bot

Приватний домашній органайзер у Telegram. Бот працює без сайту та Mini App.

Функції: фільтри для води, заміна картриджів, повторювані домашні справи, покупки, витрати, TDS, нагадування о 09:00 (Europe/Kyiv), експорт/імпорт JSON. Дані кожного Telegram користувача відокремлені.

## Підготовка
Встановіть Node.js 20+ та зайдіть у Cloudflare.

1. git clone --branch oselya-telegram-bot --single-branch https://github.com/XOTT69/test.git oselya-telegram-bot
2. cd oselya-telegram-bot
3. npm install
4. npx wrangler login
5. npx wrangler d1 create oselya-bot-db
6. Скопіюйте database_id до wrangler.toml замість REPLACE_WITH_YOUR_D1_DATABASE_ID.
7. npm run db:remote
8. npx wrangler secret put BOT_TOKEN
9. npx wrangler secret put WEBHOOK_SECRET
10. npm run deploy

WEBHOOK_SECRET — власний випадковий рядок із 32+ символів A-Z, a-z, 0-9, дефіс або підкреслення. BOT_TOKEN — токен нового бота від BotFather. Не публікуйте обидва!

## Webhook
Після deploy Cloudflare видасть Worker URL. Викличте Telegram API setWebhook, передавши url рівним Worker URL плюс /telegram та secret_token, рівний WEBHOOK_SECRET. Метод POST. У README навмисно відсутні реальні токени.

Для обмеження доступу розкоментуйте ALLOWED_USERS у wrangler.toml, вкажіть свій числовий Telegram user ID і перевиконайте npm run deploy.

## Важливо
Імпорт підтримує тільки JSON резервної копії цього бота. Старий сайт та його база не змінюються. Потрібна окрема міграція зі старого вебзастосунку. Це початковий бот; перед застосуванням до важливих даних протестуйте резервні копії.