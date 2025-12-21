# Развертывание Temka Client на Vercel

## Шаг 1: Подготовка GitHub репозитория

### 1.1 Инициализация Git
```bash
git init
git add .
git commit -m "Initial commit: Temka Client v3.0.0"
```

### 1.2 Создание репозитория на GitHub
1. Перейди на https://github.com/new
2. Создай новый репозиторий `temka-client`
3. Не инициализируй README, .gitignore и лицензию (они уже есть)

### 1.3 Загрузка на GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/temka-client.git
git branch -M main
git push -u origin main
```

## Шаг 2: Развертывание на Vercel

### 2.1 Подключение Vercel
1. Перейди на https://vercel.com
2. Нажми "New Project"
3. Выбери "Import Git Repository"
4. Выбери репозиторий `temka-client`

### 2.2 Конфигурация проекта
1. **Framework Preset:** Node.js
2. **Root Directory:** ./
3. **Build Command:** `npm install`
4. **Output Directory:** ./

### 2.3 Переменные окружения
Добавь в Vercel Settings → Environment Variables:

```
JWT_SECRET=temka-client-secret-key-2024-production
NODE_ENV=production
```

### 2.4 Развертывание
Нажми "Deploy" и жди завершения

## Шаг 3: Настройка базы данных

Для Vercel нужно использовать облачную БД вместо SQLite.

### Вариант 1: Использовать Supabase (PostgreSQL)

1. Перейди на https://supabase.com
2. Создай новый проект
3. Получи CONNECTION_STRING
4. Добавь в Vercel Environment Variables:
```
DATABASE_URL=your_supabase_connection_string
```

5. Обнови server.js для использования PostgreSQL

### Вариант 2: Использовать MongoDB Atlas

1. Перейди на https://www.mongodb.com/cloud/atlas
2. Создай кластер
3. Получи CONNECTION_STRING
4. Добавь в Vercel Environment Variables:
```
MONGODB_URI=your_mongodb_connection_string
```

## Шаг 4: Обновление API URL

Файл `api.js` уже настроен для автоматического определения URL:
- Локально: `http://localhost:3000/api`
- На Vercel: `https://your-project.vercel.app/api`

## Шаг 5: Проверка развертывания

1. Перейди на `https://your-project.vercel.app`
2. Проверь, что сайт загружается
3. Попробуй зарегистрироваться
4. Проверь консоль браузера на ошибки

## Команды для локальной разработки

```bash
# Установка зависимостей
npm install

# Запуск сервера
npm start

# Разработка с автоперезагрузкой
npm run dev
```

## Структура проекта для Vercel

```
temka-client/
├── api/
│   ├── register.js
│   ├── login.js
│   ├── stats.js
│   └── ...
├── index.html
├── app.js
├── api.js
├── download.js
├── server.js
├── package.json
├── vercel.json
├── .env
├── .gitignore
└── README.md
```

## Решение проблем

### Ошибка: "Cannot find module 'sqlite3'"
SQLite не работает на Vercel. Используй PostgreSQL или MongoDB.

### Ошибка: "CORS error"
Убедись, что в server.js включен CORS:
```javascript
app.use(cors());
```

### Ошибка: "Database connection failed"
Проверь переменные окружения в Vercel Settings.

## Полезные ссылки

- Vercel Docs: https://vercel.com/docs
- Supabase: https://supabase.com
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- GitHub: https://github.com

## Поддержка

Если возникли проблемы, проверь:
1. Логи Vercel (Deployments → Logs)
2. Консоль браузера (F12)
3. Network tab в DevTools
