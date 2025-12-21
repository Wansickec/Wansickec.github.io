# Temka Client - Advanced Minecraft Cheat Client

Профессиональный веб-сайт с реальной системой хранения аккаунтов.

## Установка и запуск

### Требования
- Node.js (v14 или выше)
- npm

### Шаги установки

1. **Установите зависимости:**
```bash
npm install
```

2. **Запустите сервер:**
```bash
npm start
```

Или для разработки с автоперезагрузкой:
```bash
npm run dev
```

3. **Откройте браузер:**
```
http://localhost:3000
```

## Архитектура

### Backend (Node.js + Express + SQLite)
- **server.js** - основной сервер с API
- **temka_users.db** - база данных SQLite

### Frontend (HTML + CSS + JavaScript)
- **index.html** - главная страница
- **app.js** - логика приложения
- **api.js** - клиент для работы с API
- **download.js** - функции скачивания

## API Endpoints

### Регистрация
```
POST /api/register
Body: { username, email, password, passwordConfirm }
Response: { success, user, token }
```

### Вход
```
POST /api/login
Body: { username, password }
Response: { success, user, token }
```

### Профиль пользователя
```
GET /api/user/profile
Headers: { Authorization: Bearer <token> }
Response: { user }
```

### Логирование загрузки
```
POST /api/download
Headers: { Authorization: Bearer <token> }
Body: { filename, version }
Response: { success }
```

### Статистика
```
GET /api/stats
Response: { totalUsers, totalDownloads }
```

### Выход
```
POST /api/logout
Headers: { Authorization: Bearer <token> }
Response: { success }
```

## Функции

✅ Регистрация и вход пользователей
✅ Хеширование паролей (bcryptjs)
✅ JWT токены для аутентификации
✅ Генерация лицензионных ключей
✅ Отслеживание загрузок
✅ Статистика пользователей
✅ Красивый современный дизайн
✅ Автоматический переход на внешний сайт после загрузки

## Безопасность

- Пароли хешируются с помощью bcryptjs
- JWT токены для аутентификации
- CORS включен для безопасности
- Валидация всех входных данных
- Уникальные лицензионные ключи

## База данных

### Таблица users
- id (PRIMARY KEY)
- username (UNIQUE)
- email (UNIQUE)
- password (хешированный)
- license_key (UNIQUE)
- created_at
- last_login
- premium
- downloads_count

### Таблица downloads
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- filename
- version
- downloaded_at

### Таблица sessions
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- token (UNIQUE)
- created_at
- expires_at

## Версия
3.0.0

## Лицензия
Все права защищены © 2024 Temka Client
