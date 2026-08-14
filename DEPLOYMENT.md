# Размещение игры «Домовой Василий»

Это инструкция для публикации production-сборки на сайте ТСЖ. Конфигурация Nginx ниже — **пример**, её нужно адаптировать под существующий сервер. Для production обязателен HTTPS.

VK Bridge на этом этапе не подключается.

## Сборка

```bash
npm install
npm run build
```

Готовые файлы появляются в папке `dist/`.

Переменные окружения задаются в `.env` или `.env.production`. Образец — `.env.example`. Секреты туда не класть.

| Переменная | Назначение |
| --- | --- |
| `VITE_APP_MODE` | `standalone` (по умолчанию) или `website`. Режим `vk` зарезервирован и пока не меняет механику. |
| `VITE_BASE_PATH` | Публичный путь приложения: `/` или `/game/` |
| `VITE_MAIN_SITE_URL` | Необязательный URL основного сайта. Если пусто, кнопка «На сайт ТСЖ» не показывается. |
| `VITE_OG_IMAGE_URL` | Необязательный HTTPS-адрес картинки для соцсетей. Если файла нет, переменную не заполняйте. |

После смены переменных нужно заново выполнить `npm run build`.

## Вариант 1. Поддомен

Например: `https://game.example.ru/`

```env
VITE_APP_MODE=website
VITE_BASE_PATH=/
VITE_MAIN_SITE_URL=https://example.ru/
```

Пример Nginx:

```nginx
server {
    listen 80;
    server_name game.example.ru;

    root /var/www/vasily-game/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Для production нужен HTTPS (сертификат и редирект с HTTP). Этот конфиг не единственно правильный — его нужно вписать в текущую схему сервера.

## Вариант 2. Раздел `/game/`

Например: `https://example.ru/game/`

```env
VITE_APP_MODE=website
VITE_BASE_PATH=/game/
VITE_MAIN_SITE_URL=https://example.ru/
```

После сборки пути к CSS/JS будут вида `/game/assets/...`, а не из корня сайта.

Игровой экран в этом варианте открывается как `/game/play`, а не `/game/game`. Старый адрес `/game/game` перенаправляется на `/game/play`.

Пример Nginx:

```nginx
location /game/ {
    alias /var/www/vasily-game/dist/;
    try_files $uri $uri/ /game/index.html;
}
```

Для `alias` синтаксис `try_files` зависит от версии Nginx и остальной конфигурации. Если внутренние маршруты (`/game/play`, `/game/achievements`, `/game/settings`) после обновления страницы отдают 404, сервер должен отдавать `index.html` для всех путей внутри `/game/`. Конфиг нужно проверить на стенде.

## SPA fallback

Это одностраничное приложение. Прямой переход и обновление браузера на внутренних адресах должны возвращать `index.html`, а не 404.

- поддомен: `/play`, `/achievements`, `/settings`, `/result`
- раздел сайта: `/game/play`, `/game/achievements`, `/game/settings`, `/game/result`

## Результат

После `npm run build` публикуется содержимое `dist/`.

## Сохранения

Прогресс хранится в `localStorage` браузера. Переход на основной сайт и обратно его не сбрасывает.

Если игра стоит на другом поддомене, у неё будет отдельное хранилище — это обычное поведение браузера, обходить его не нужно.

## Картинка Василия

Текущий образ: `src/assets/vasily/vasily-main.png`.

Чтобы заменить персонажа, положите новый файл `vasily-main.png` (или другой формат) в ту же папку и при смене расширения поправьте импорт в `src/assets/vasily/index.ts`. Компоненты трогать не нужно.

## Open Graph

Базовые метатеги уже есть. Картинку превью не выдумывайте: задайте `VITE_OG_IMAGE_URL` только когда будет реальный HTTPS-файл.
