export function logVKError(context: string, error: unknown) {
  if (!import.meta.env.DEV) {
    return;
  }

  const message = error instanceof Error ? error.message : 'неизвестная ошибка';
  console.error(`[VK] ${context}: ${message}`);
}
