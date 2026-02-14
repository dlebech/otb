import React from 'react';
import styles from './Loading.module.css';

export default function Loading() {
  return (
    <div className="flex flex-wrap gap-6 justify-center">
      <div className="w-auto">
        <div title="Loading..." className={styles.spinner}></div>
      </div>
    </div>
  );
}
