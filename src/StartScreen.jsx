import React from "react";

// export default function StartScreen({ onStart, onStartPractice }) {
export default function StartScreen({ onStart }) {

  return (
    <div
      style={{
        textAlign: "center",
        background: "whitesmoke",
        padding: "30px 30px",
        borderRadius: "10px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      }}
    >
      <h1 style={{ fontSize: "3.5rem", color: "#007bff" }}>
        Pasapalabras
      </h1>
      <p
        style={{
          fontSize: "1.3rem",
          color: "#2c3e50",
          marginBottom: "30px",
        }}
      >
        Demuestra tus conocimientos resolviendo cada definición antes
        de que acabe el tiempo.
      </p>

      {/* <h3 style={{ marginBottom: "10px", fontSize: "1.3rem", }}>
        Selecciona el modo de juego:
      </h3> */}

      <button
        onClick={onStart}
        style={{
          padding: "15px 35px",
          margin: "10px",
          borderRadius: "12px",
          background: "#3498db",
          color: "white",
          fontSize: "1.4rem",
          border: "none",
          cursor: "pointer",
        }}
      >
        🧠 Comenzar
      </button>

      {/* <button
        onClick={onStartPractice}
        style={{
          padding: "15px 35px",
          margin: "10px",
          borderRadius: "12px",
          background: "#2ecc71",
          color: "white",
          fontSize: "1.4rem",
          border: "none",
          cursor: "pointer",
        }}
      >
        🎯 Modo práctica
      </button> */}
    </div>
  );
}
