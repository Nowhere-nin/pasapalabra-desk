import { useState, useEffect } from 'react';
import styles from '../css/ConfigScreen.module.css';
import Swal from 'sweetalert2';

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
      if (!data || data == null || data == undefined) {
        setSavedRoscos([]);
        return
      }
      setSavedRoscos(data)
    }
    load();
  }, []);

  
  // Cargar palabras del rosco seleccionado
  useEffect(() => {
    // if (selectedRosco != 'default') {
    //   savedRoscos.map(({ nombre, palabra }) => {
    //     if(selectedRosco === nombre) {
    //       setSelectedWords(palabra)
    //     }
    //   })
    // }
    if (selectedRosco != 'default') {
      const rosco = savedRoscos.find(r => r.nombre === selectedRosco);
      if (rosco) {
        setSelectedWords(rosco.palabra);
      } else if (selectedRosco === 'default') {
        setSelectedWords(defaultWords);
      }
    }
  }, [selectedRosco, savedRoscos])


  // Manejar botón continuar para comenzar juego
  const handleContinuar = (mode) => {
    if (time < 20 && mode === "rules") {
      Swal.fire({
        icon: 'warning',
        title: 'Tiempo mínimo alcanzado',
        text: 'El tiempo mínimo por palabra es de 20 segundos.',
      });
      return;
    }
    onSetTime(Number(time)); // Pasa el tiempo establecido
    onSelectMode(mode, selectedWords); // Pasa el modo y las palabras del rosco seleccionado, si no se seleccionó ninguno pasa las palabras por defecto
    onSelectRosco(selectedRosco); // Envía el nombre del rosco seleccionado
  };

  return (
    <div
      className={styles.div}
    >
      <h1 
        className={styles.h1}
      >⚙️ Configuración del juego</h1>
      <p 
        className={styles.p}
      >
        Elige el tiempo por palabra y si deseas usar palabras predefinidas o un rosco personalizado.
        <br />
        (Por defecto usa palabras de un rosco matemático)
      </p>

      {/* Tiempo por palabra */}
      <h3
        className={styles.h3}
      >⏱️ Tiempo por palabra</h3>
      <p
        className={styles.p}
      >Mínimo 20 - Máximo 120</p>

      <input
        type="number"
        min={20}
        max={120}
        value={time}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isNaN(v)) return;
          const clamped = Math.min(120, Math.max(1, v));
          setTime(clamped);
        }}
        className={styles.input}
      />

      {/* Selector de rosco */}
      <div 
        className={styles.divRosco}
      >
        <h3
          className={styles.h3}
        >📘 Selecciona un rosco</h3>
        <select
          value={selectedRosco}
          onChange={(e) => setSelectedRosco(e.target.value)}
          className={styles.select}
        >
          <option value="default">🧩 Rosco por defecto</option>
          {/* Carga los roscos guardados */}
          {savedRoscos.map(( { nombre } ) => (
            <option key={nombre} value={nombre}>
              {nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Botones principales */}
      <div
        className={styles.divButtons}
      >
        <button
          onClick={() => handleContinuar("rules")}
          className={styles.primary}
        >
          ▶️ Iniciar juego
        </button>

        <button
          onClick={() => handleContinuar("setup")}
          className={styles.secondary}
        >
          ✏️ Roscos personalizados
        </button>
      </div>

      {/* Botón para volver */}
      <div
        className={styles.divButtons}
      >
        <button
          onClick={onBack}
          className={styles.back}
        >
          🚪 Volver al inicio
        </button>
      </div>
    </div>
  );
}
