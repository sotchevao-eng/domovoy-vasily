import { IS_VK_MODE, VK_APP_ID } from '../config/appConfig';
import { useVK } from '../integrations/vk/useVK';
import styles from './VKNotice.module.css';

export function VKNotice() {
  const { isVK, outsideClient } = useVK();

  if (!isVK) {
    return null;
  }

  return (
    <div className={styles.stack}>
      {outsideClient ? (
        <p className={styles.banner} role="status">
          Похоже, игра открыта вне приложения ВКонтакте. Основные функции всё равно доступны.
        </p>
      ) : null}
      {IS_VK_MODE && !VK_APP_ID && import.meta.env.DEV ? (
        <p className={styles.dev} role="status">
          VK App ID не настроен
        </p>
      ) : null}
    </div>
  );
}
