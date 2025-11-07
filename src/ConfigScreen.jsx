import { useState, useEffect } from 'react';

// 
const defaultWords = [
  { 
    letra: "C",
    palabra: ["Canjear", "Canje", "Canjes" ],
    definicion: "Cambiar una cantidad de un orden de valor por una cantidad equivalente de otro orden"
  },
  {
    letra: "C",
    palabra: ["Centena", "Cien", "Centenas"],
    definicion: "En un número de tres cifras, corresponde al dígito que se ubica en el tercer lugar de derecha a izquierda" 
  },
  {
    letra: "C",
    palabra: ["Comparar", "Comparación"],
    definicion: "Establecer las diferencias o semejanzas existentes entre dos o más cosas"
  },
  {
    letra: "D",
    palabra: ["Docena", "Docenas"],
    definicion: "Grupo que representa el conjunto de doce objetos o unidades"
  },
  {
    letra: "D",
    palabra: [ "Decena", "Decenas"],
    definicion: "En un número de dos cifras, corresponde al dígito que se ubica en el segundo lugar de derecha a izquierda"
  },
  {
    letra: "E",
    palabra: ["Estimar", "Estimación"],
    definicion: "Calcular o determinar el valor o la medida de algo aproximado, es decir, no exacto"
  },
  {
    letra: "A",
    palabra: ["Ángulo"],
    definicion: "Figura formada por dos líneas que concurren en un lugar punto llamado vértice"
  },
  {
    letra: "M",
    palabra: ["Multiplicación", "Multiplicar"],
    definicion: "Es la suma iterada, es decir, sumar el mismo número una cantidad de veces determinada"
  },
  {
    letra: "A",
    palabra: ["Adición", "Añadir"],
    definicion: "Operación matemática que se resuelve sumando cantidades numéricas"
  },
  {
    letra: "E",
    palabra: ["Ecuación", "Expresión igual"],
    definicion: "Una igualdad matemática que muestra que dos expresiones son iguales, usando un signo igual (=)"
  },
  {
    letra: "O",
    palabra: ["Obtuso", "Ángulo obtuso"],
    definicion: "Un ángulo que mide más de 90 grados, pero menos de 180 grados"
  },
  {
    letra: "A",
    palabra: ["Agudo", "Ángulo agudo"],
    definicion: "Un ángulo que mide más de 0 grados y menos de 90 grados"
  },
  {
    letra: "R",
    palabra: ["Recto", "Ángulo recto"], 
    definicion: "Un ángulo que mide exactamente 90 grados"
  },
  {
    letra: "D",
    palabra: ["División", "Dividir"],
    definicion: "El proceso de distribuir o repartir un número en partes o grupos iguales"
  }
];

export default function ConfigScreen({ onSelectMode, onBack, onSetTime, onSelectRosco }) {
  const [time, setTime] = useState(30); // El tiempo establecido por palabra
  const [savedRoscos, setSavedRoscos] = useState([]); // Los roscos guardados en el Store para poder seleccionar cual usar
  const [selectedRosco, setSelectedRosco] = useState('default'); // Rosco seleccionado
  const [selectedWords, setSelectedWords] = useState(defaultWords); // Palabras a usar

  // Cargar roscos guardados del Store
  useEffect( () => {
    const load = async () => {
      const data = await window.store.get('roscosPersonalizados');
      setSavedRoscos(data)
      
    }

    load();
  }, []);

  
  // Cargar palabras del rosco seleccionado
  useEffect(() => {
    if (selectedRosco != 'default') {
      savedRoscos.map(({ nombre, palabra }) => {
        if(selectedRosco === nombre) {
          setSelectedWords(palabra)
        }
      })
    }

  }, [selectedRosco])


  // Manejar botón continuar para comenzar juego
  const handleContinuar = (mode) => {
    onSetTime(Number(time)); // Pasa el tiempo establecido
    onSelectMode(mode, selectedWords); // Pasa el modo y las palabras del rosco seleccionado, si no se seleccionó ninguno pasa las palabras por defecto
    onSelectRosco(selectedRosco); // Envía el nombre del rosco seleccionado
  };

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
      <h1 style={{ fontSize: "3rem", color: "#007bff" }}>⚙️ Configuración del juego</h1>
      <p style={{ fontSize: "1.3rem", color: "#2c3e50", marginBottom: "30px" }}>
        Elige el tiempo por palabra y si deseas usar palabras predefinidas o un rosco personalizado.
        <br />
        (Por defecto usa palabras de un rosco matemático)
      </p>

      {/* Tiempo por palabra */}
      <h3 style={{ fontSize: "1.2rem", marginBottom: "10px" }}>⏱️ Tiempo por palabra</h3>

      <input
        type="number"
        min={20}
        max={120}
        value={time}
        onChange={(e) => setTime(e.target.value)}
        style={{
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          outline: "none",
          fontSize: "1.2rem",
          width: "100px",
        }}
      />

      {/* Selector de rosco */}
      <div style={{ marginTop: "30px", marginBottom: "20px" }}>
        <h3 style={{ fontSize: "1.2rem", marginBottom: "10px" }}>📘 Selecciona un rosco</h3>
        <select
          value={selectedRosco}
          onChange={(e) => setSelectedRosco(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
            fontSize: "1.1rem",
            border: "1px solid #ccc",
            width: "60%",
          }}
        >
          <option value="default">🧩 Rosco por defecto</option>
          {/* Carga los roscos guardados */}
          {savedRoscos.map((r, i) => (
            <option key={i} value={r.nombre}>
              {r.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Botones principales */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => handleContinuar("rules")}
          style={{
            padding: "15px 40px",
            borderRadius: "12px",
            background: "#27ae60",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "1.4rem",
            marginRight: "20px",
          }}
        >
          ▶️ Iniciar juego
        </button>

        <button
          onClick={() => handleContinuar("setup")}
          style={{
            padding: "15px 40px",
            borderRadius: "12px",
            background: "#f39c12",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "1.4rem",
            marginLeft: "10px",
          }}
        >
          ✏️ Roscos personalizados
        </button>
      </div>


      {/* Botones de exportación/importación */}
      <div style={{ marginTop: "20px" }}>
        <h3>Exportar / Importar roscos</h3>
        <button
          onClick={() => console.log("Exportar")}
          style={{
            padding: "15px 40px",
            borderRadius: "12px",
            background: "#27ae60",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "1.4rem",
            marginRight: "20px",
          }}
        >
          Exportar
        </button>

        <button
          onClick={() => console.log("Importar")}
          style={{
            padding: "15px 40px",
            borderRadius: "12px",
            background: "#f39c12",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "1.4rem",
            marginLeft: "10px",
          }}
        >
          Importar
        </button>
      </div>

      {/* Botón para volver */}
      <div style={{ marginTop: "30px" }}>
        <button
          onClick={onBack}
          style={{
            padding: "12px 30px",
            borderRadius: "10px",
            background: "#e74c3c",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "1.4rem",
          }}
        >
          🚪 Volver al inicio
        </button>
      </div>
    </div>
  );
}
