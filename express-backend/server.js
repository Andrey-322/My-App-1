const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Создаем папку для аудиофайлов, если её нет
const audioDir = path.join(__dirname, 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// In-memory storage (в реальном приложении используйте базу данных)
const users = [];
const favorites = {}; // { username: [trackIds] }
const tracks = [
  { id: '1', title: 'In Bloom', artist: 'Nirvana' },
  { id: '2', title: "Gangsta's Paradise", artist: 'Coolio, L.V.' },
  { id: '3', title: 'Разговоры о животных', artist: 'Подкаст-студия Константина Петрова' },
  { id: '4', title: 'Animal I Have Become', artist: 'Three Days Grace' },
  { id: '5', title: 'Comic news', artist: 'Команда КВН Плохие новости' },
  { id: '6', title: 'To The Skies From A Hillside', artist: 'Maybeshewill' },
  { id: '7', title: 'Co-Conspirators', artist: 'Maybeshewill' },
  { id: '8', title: 'Surrounded By Spies', artist: 'Placebo' },
];

// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Токен не предоставлен' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Неверный токен' });
    }
    req.user = user;
    next();
  });
};

// Регистрация
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Имя пользователя и пароль обязательны' });
    }

    // Проверка, существует ли пользователь
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ message: 'пользователь уже существует' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Сохранение пользователя
    users.push({
      username,
      password: hashedPassword
    });

    // Инициализация избранного
    favorites[username] = [];

    res.status(201).json({
      message: 'пользователь успешно добавлен',
      user: { username }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Авторизация
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Имя пользователя и пароль обязательны' });
    }

    // Поиск пользователя
    const user = users.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ message: 'произошла ошибка при авторизации — неверные данные' });
    }

    // Проверка пароля
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'произошла ошибка при авторизации — неверные данные' });
    }

    // Генерация токена
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'авторизация прошла успешно',
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// ВАЖНО: Маршрут для аудио должен быть ПЕРЕД /api/tracks, чтобы Express правильно обрабатывал запросы
// Получение аудиофайла трека (без аутентификации, так как HTMLAudioElement не поддерживает кастомные заголовки)
app.get('/api/tracks/:id/audio', (req, res) => {
  const trackId = req.params.id;
  console.log(`[AUDIO] Запрос аудио для трека ${trackId}`);
  const track = tracks.find(t => t.id === trackId);
  
  if (!track) {
    console.log(`[AUDIO] Трек ${trackId} не найден`);
    return res.status(404).json({ message: 'Трек не найден' });
  }

  // Ищем аудиофайл по ID (поддерживаем mp3, wav, ogg)
  const audioFile = [`${trackId}.mp3`, `${trackId}.wav`, `${trackId}.ogg`]
    .map(file => path.join(audioDir, file))
    .find(file => fs.existsSync(file));

  if (!audioFile) {
    console.log(`[AUDIO] Аудиофайл не найден для трека ${trackId}. Проверьте папку ${audioDir}`);
    return res.status(404).json({ message: 'Аудиофайл не найден. Поместите файл в папку audio с именем, соответствующим ID трека (например, 1.mp3)' });
  }

  const stat = fs.statSync(audioFile);
  const fileSize = stat.size;
  const range = req.headers.range;
  
  // Определяем MIME-тип по расширению файла
  const ext = path.extname(audioFile).toLowerCase();
  const contentType = ext === '.mp3' ? 'audio/mpeg' : ext === '.wav' ? 'audio/wav' : 'audio/ogg';

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(audioFile, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    };
    res.writeHead(200, head);
    fs.createReadStream(audioFile).pipe(res);
  }
});

// Получение списка треков
app.get('/api/tracks', authenticateToken, (req, res) => {
  res.json(tracks);
});

// Получение избранного
app.get('/api/favorites', authenticateToken, (req, res) => {
  const username = req.user.username;
  const userFavorites = (favorites[username] || []).map(trackId => 
    tracks.find(t => t.id === trackId)
  ).filter(Boolean);
  res.json(userFavorites);
});

// Добавление в избранное
app.post('/api/favorites', authenticateToken, (req, res) => {
  const username = req.user.username;
  const { trackId } = req.body;

  if (!trackId) {
    return res.status(400).json({ message: 'trackId обязателен' });
  }

  if (!favorites[username]) {
    favorites[username] = [];
  }

  if (!favorites[username].includes(trackId)) {
    favorites[username].push(trackId);
  }

  res.json({ message: 'композиция добавлена в избранное' });
});

// Удаление из избранного
app.delete('/api/favorites', authenticateToken, (req, res) => {
  const username = req.user.username;
  const { trackId } = req.body;

  if (!trackId) {
    return res.status(400).json({ message: 'trackId обязателен' });
  }

  if (favorites[username]) {
    favorites[username] = favorites[username].filter(id => id !== trackId);
  }

  res.json({ message: 'композиция убрана из избранного' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(`API доступен по адресу http://localhost:${PORT}/api`);
});

