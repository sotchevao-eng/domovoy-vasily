import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Vasily } from '../components/Vasily';
import styles from './page.module.css';

export function NotFoundPage() {
  return (
    <Layout title="Потерянная комната">
      <section className={styles.panel}>
        <div className={styles.center}>
          <Vasily size="md" caption="Сюда я ещё не заглядывал." pose="worry" />
        </div>
        <h1>Здесь Василий ещё не бывал</h1>
        <p className={styles.lead}>Кажется, такой комнаты в нашем доме нет.</p>
        <div className={styles.actions}>
          <Button variant="primary" to="/">
            На главную
          </Button>
        </div>
      </section>
    </Layout>
  );
}
