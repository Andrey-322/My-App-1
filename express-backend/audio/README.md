# Папка для аудиофайлов

## Как добавить треки:

1. Поместите аудиофайлы в эту папку
2. Назовите файлы по ID трека из `server.js`:
   - `1.mp3` для трека с id: '1'
   - `2.mp3` для трека с id: '2'
   - и т.д.

## Поддерживаемые форматы:
- `.mp3` (рекомендуется)
- `.wav`
- `.ogg`

## Пример:
Если в `server.js` есть трек:
```javascript
{ id: '1', title: 'In Bloom', artist: 'Nirvana' }
```

То аудиофайл должен называться: `1.mp3`

## Текущие треки в базе:
1. `1.mp3` - In Bloom - Nirvana
2. `2.mp3` - Gangsta's Paradise - Coolio, L.V.
3. `3.mp3` - Разговоры о животных - Подкаст-студия Константина Петрова
4. `4.mp3` - Animal I Have Become - Three Days Grace
5. `5.mp3` - Comic news - Команда КВН Плохие новости
6. `6.mp3` - To The Skies From A Hillside - Maybeshewill
7. `7.mp3` - Co-Conspirators - Maybeshewill
8. `8.mp3` - Surrounded By Spies - Placebo

