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
