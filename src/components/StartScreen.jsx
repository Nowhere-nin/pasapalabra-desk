import React from "react";
import styles from '../css/StartScreen.module.css'

// export default function StartScreen({ onStart, onStartPractice }) {
export default function StartScreen({ onStart }) {

  return (
    <div 
      className={styles.div}
    >
      <h1 
        className={styles.h1}
      >
        Pasapalabras
      </h1>
      <p
        className={styles.p}
      >
        Demuestra tus conocimientos resolviendo cada definición antes
        de que acabe el tiempo.
      </p>

      {/* <h3 style={{ marginBottom: "10px", fontSize: "1.3rem", }}>
        Selecciona el modo de juego:
      </h3> */}

      <button
        onClick={onStart}
        className={styles.primary}
      >
        🧠 Comenzar
      </button>

      {/* <button
        onClick={onStartPractice}
        className={styles.secondary}
      >
        🎯 Modo práctica
      </button> */}
    </div>
  );
}
