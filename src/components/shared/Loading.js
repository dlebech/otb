import React from 'react';
import styles from './Loading.module.css';

const Loading = () => {
  return (
    <div className="row justify-content-center">
      <div className="col-auto">
        <div title="Loading..." className={styles.spinner}></div>
      </div>
    </div>
  );
};

export default Loading;