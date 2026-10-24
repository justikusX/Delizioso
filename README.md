# Delizioso — сайт итальянского ресторана

React + Vite (клиент), Node.js + Express (сервер), PostgreSQL (база данных).
Меню, онлайн-заказ с корзиной и доставкой на карте, бронирование столиков, регистрация по почте и через Google, личный кабинет.

## Структура

```
client/                 React-приложение (Vite)
  public/img/           изображения
  src/main.jsx          точка входа и маршруты
  src/components/       общие компоненты: шапка, подвал, сетка меню, список заказа, модальные окна
  src/pages/            страницы: Home, Menu, About, Order, Reservation, Contact, Account
  src/context/          состояние авторизации и корзины
  src/api.js            запросы к серверу
  src/data.js           правила бронирования и заказа, справочники
server/                 Express-сервер
  index.js              запуск сервера и подключение маршрутов
  db.js                 подключение к PostgreSQL, создание базы и таблиц
  db/schema.sql         таблицы, индексы и представления
  db/seed.sql           начальные данные (меню, шефы, отзывы, ваучер)
  routes/               API: меню, заказы, брони, контакты, авторизация, кабинет
  services/             письма, токены, работа с клиентами
database/               скрипты резервного копирования PostgreSQL
```

## Запуск

### 1. Установить программы
- [Node.js 20+](https://nodejs.org/)
- [PostgreSQL 16+](https://www.postgresql.org/download/) (вместе с ним ставится pgAdmin)
- [Git](https://git-scm.com/)

### 2. Скачать проект и установить пакеты
```bash
git clone https://github.com/justikusX/Delizioso.git
cd Delizioso
npm run setup
```

### 3. Настроить сервер
Скопировать `server/.env.example` в `server/.env` и указать пароль пользователя `postgres`:
```
DB_PASSWORD=ваш_пароль
```
База `delizioso`, все таблицы и начальные данные создаются автоматически при первом запуске сервера.

Почта и вход через Google необязательны. Без SMTP письма сохраняются в папку `server/mail`,
а на странице появляется ссылка из письма. Для Google нужно заполнить `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET`.

### 4. Запустить
В двух терминалах:
```bash
npm run server
npm run client
```
Открыть http://localhost:5173

### Сборка
```bash
npm run build
npm start
```
Сервер раздаёт собранный клиент из `client/dist` на http://localhost:5000

## База данных
Таблицы: `categories`, `dishes`, `chefs`, `testimonials`, `users`, `addresses`, `reservations`,
`orders`, `order_items`, `vouchers`, `contact_messages`.
Представления для отчётов: `vw_customers`, `vw_order_details`, `vw_reservation_details`.

Резервная копия и восстановление (PowerShell):
```bash
powershell -ExecutionPolicy Bypass -File database\backup-db.ps1
powershell -ExecutionPolicy Bypass -File database\restore-db.ps1
```

## API
| Метод | Адрес | Назначение |
|---|---|---|
| GET | /api/home | данные главной страницы |
| GET | /api/menu | категории и блюда |
| GET | /api/vouchers/:code | проверка ваучера |
| POST | /api/orders | оформление заказа |
| GET | /api/orders/:code | заказ по коду |
| POST | /api/reservations/check | проверка даты и времени брони |
| POST | /api/reservations | новая бронь или изменение |
| GET | /api/reservations/:code | бронь по коду |
| PATCH | /api/reservations/:code/notes | повод и пожелания |
| POST | /api/reservations/:code/cancel | отмена брони |
| POST | /api/contact | сообщение с формы обратной связи |
| POST | /api/auth/register, /login, /confirm, /resend, /forgot, /reset, /google | авторизация |
| GET | /api/account | личный кабинет |
| PUT | /api/account/profile | изменение профиля |
| DELETE | /api/account/addresses/:id | удаление адреса |
