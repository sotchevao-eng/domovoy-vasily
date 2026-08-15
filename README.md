# Домовой Василий: Хранитель дома

Уютная сюжетная игра-симулятор для ТСЖ «Васильевский».

```bash
npm install
npm run dev
```

## Режимы приложения

### Standalone

```env
VITE_APP_MODE=standalone
```

```bash
npm run build:standalone
```

### Website

```env
VITE_APP_MODE=website
```

```bash
npm run build:website
```

Размещение на сайте ТСЖ: [DEPLOYMENT.md](DEPLOYMENT.md).

### VK Mini Apps

```env
VITE_APP_MODE=vk
```

```bash
npm run build:vk
```

Публикация во ВКонтакте: [VK_DEPLOYMENT.md](VK_DEPLOYMENT.md).

## GitHub Pages

Публичная ссылка после выкладки:

https://sotchevao-eng.github.io/domovoy-vasily/

```bash
npm run build:pages
```

Каждый push в `main` собирает эту версию автоматически. Обновление страницы на `/play` и других внутренних адресах работает через копию `index.html` → `404.html`.
