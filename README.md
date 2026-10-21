# Delizioso — сайт итальянского ресторана

ASP.NET Core MVC (.NET 10) + Entity Framework Core + SQL Server (LocalDB).
Меню, онлайн-заказ с корзиной и доставкой на карте, бронирование столиков, регистрация по почте и через Google, личный кабинет.

## Запуск на новом компьютере

### 1. Установить программы
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- **SQL Server LocalDB** — ставится вместе с Visual Studio или отдельно: [SQL Server Express](https://www.microsoft.com/sql-server/sql-server-downloads) → *Download Media* → *LocalDB*
- [Git](https://git-scm.com/download/win)
- По желанию: [VS Code](https://code.visualstudio.com/) с расширением **C# Dev Kit** и [SSMS](https://learn.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms)

### 2. Скачать проект
```bash
git clone https://github.com/<ваш-логин>/Delizioso.git
cd Delizioso
dotnet tool restore
```

### 3. База данных — выберите один вариант
**А. Перенести все данные** (клиенты, заказы, брони) из резервной копии `Database/Delizioso.bak`:
```bash
powershell -ExecutionPolicy Bypass -File Database\restore-db.ps1
```

**Б. Начать с чистой базы**: ничего делать не нужно. При первом запуске сайт сам создаст базу `Delizioso`
со всеми таблицами, меню (18 блюд), шефами, отзывами и ваучером `FREETOEAT`.

### 4. Секреты (почта и Google)
Пароли не хранятся в репозитории. На новом компьютере их нужно ввести заново:
```bash
dotnet user-secrets set "Email:Smtp:Host" "smtp.gmail.com"
dotnet user-secrets set "Email:Smtp:User" "ваша_почта@gmail.com"
dotnet user-secrets set "Email:Smtp:Password" "пароль_приложения_gmail"
dotnet user-secrets set "Email:From" "ваша_почта@gmail.com"
dotnet user-secrets set "Authentication:Google:ClientId" "..."
dotnet user-secrets set "Authentication:Google:ClientSecret" "..."
```
Без них сайт тоже работает: письма сохраняются в `App_Data/mail`, а кнопка Google показывает, что вход не настроен.

### 5. Запустить
```bash
dotnet run
```
Открыть http://localhost:5223

## Перед переносом: сохранить свежие данные
На старом компьютере обновить резервную копию и отправить её в GitHub:
```bash
powershell -ExecutionPolicy Bypass -File Database\backup-db.ps1
git add Database/Delizioso.bak
git commit -m "Update database backup"
git push
```
На новом: `git pull`, затем шаг 3А.

## База данных в SSMS
Сервер: `(localdb)\MSSQLLocalDB`, Windows Authentication, база `Delizioso`. Готовые отчёты (папка *Views*):
- `vw_Customers` — все клиенты: аккаунт или гость, телефон, сколько заказов и на какую сумму, последний адрес
- `vw_OrderDetails` — кто что заказал и куда
- `vw_ReservationDetails` — все брони

## Структура
- `Controllers/` — страницы (Home, Menu, About, Order, Reservation, Contact, Account)
- `Models/` — таблицы базы и модели форм
- `Data/AppDbContext.cs` — настройка базы и начальные данные (меню и т. д.)
- `Migrations/` — история изменений структуры базы (применяется автоматически при запуске)
- `Services/` — отправка почты, ссылки подтверждения, работа с клиентами
- `Views/` — разметка страниц, `wwwroot/` — стили, скрипты, картинки
- `Database/` — резервная копия базы и скрипты backup/restore
