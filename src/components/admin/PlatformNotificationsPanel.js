import {
  PLATFORM_CHANNEL_LABELS,
  PLATFORM_NOTIFICATIONS,
  PLATFORM_NOTIFICATION_AUDIENCES,
} from '@/data/platformNotifications';
import styles from './PlatformNotificationsPanel.module.css';

function Channel({ kind, status }) {
  const label = PLATFORM_CHANNEL_LABELS[kind][status] || status;
  const tone =
    status === 'activo' ? styles.channelOn : status === 'por-conectar' ? styles.channelSoon : styles.channelOff;
  return <span className={`${styles.channel} ${tone}`}>{label}</span>;
}

export default function PlatformNotificationsPanel() {
  return (
    <section className={styles.panel} aria-label="Avisos de la plataforma">
      <p className={styles.intro}>
        El correo de los avisos que ya están activos sigue saliendo solo. El del navegador llega al móvil,
        al ordenador y a la tablet cuando esa persona lo acepta en ese aparato. La confirmación del correo
        y el cambio de contraseña se quedan solo en el email.
      </p>

      {PLATFORM_NOTIFICATION_AUDIENCES.map((audience) => {
        const items = PLATFORM_NOTIFICATIONS.filter((item) => item.audience === audience.id);
        return (
          <div key={audience.id} className={styles.group}>
            <header className={styles.groupHead}>
              <h2 className={styles.groupTitle}>{audience.title}</h2>
              <p className={styles.groupText}>{audience.description}</p>
            </header>
            <ul className={styles.list}>
              {items.map((item) => (
                <li key={item.id} className={styles.card}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.when}>{item.when}</p>
                  <p className={styles.who}>{item.who}</p>
                  <p className={styles.detail}>{item.detail}</p>
                  <div className={styles.channels}>
                    <Channel kind="email" status={item.email} />
                    <Channel kind="browser" status={item.browser} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
