import { ReactElement } from 'react';
import styles from './header.module.scss';

export default function Header(): ReactElement {
  return (
    <div className={styles.headerContainer}>
      <img src="/images/Logo.svg" alt="logo" />
    </div>
  );
}
