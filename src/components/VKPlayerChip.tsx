import { useVK } from '../integrations/vk/useVK';
import styles from './VKPlayerChip.module.css';

export function VKPlayerChip() {
  const { user } = useVK();

  if (!user) {
    return null;
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(' ');

  return (
    <div className={styles.chip}>
      {user.photo ? (
        <img className={styles.photo} src={user.photo} alt="" width={36} height={36} />
      ) : (
        <span className={styles.placeholder} aria-hidden="true">
          {user.firstName.slice(0, 1)}
        </span>
      )}
      <span>{name}</span>
    </div>
  );
}
