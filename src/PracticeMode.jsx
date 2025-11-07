import { useState, useEffect } from "react";
import correctS from './assets/sounds/correct.mp3';
import incorrectS from './assets/sounds/incorrect.mp3';
import pasarS from './assets/sounds/pasar.mp3';


export default function PracticeMode({ onBack }) {

  const words = [
    { 
      letra: "C",
      palabra: ["Canje", "Canjear" ],
      definicion: "Cambiar una cantidad de un orden de valor por una cantidad equivalente de otro orden"
    },
    {
      letra: "C",
      palabra: ["Centena"],
      definicion: "En un número de tres cifras, corresponde al dígito que se ubica en el tercer lugar de derecha a izquierda" 
    },
    {
      letra: "C",
      palabra: ["Comparación", "Comparacion", "Comparar"],
      definicion: "Establecer las diferencias o semejanzas existentes entre dos o más cosas"
    },
    {
      letra: "D",
      palabra: ["Docena"],
      definicion: "Grupo que representa el conjunto de doce objetos o unidades"
    },
    {
      letra: "D",
      palabra: ["Decena"],
      definicion: "En un número de dos cifras, corresponde al dígito que se ubica en el segundo lugar de derecha a izquierda"
    },
    {
      letra: "E",
      palabra: ["Estimación", "Estimacion", "Estimar"],
      definicion: "Calcular o determinar el valor o la medida de algo aproximado, es decir, no exacto"
    },
    {
      letra: "A",
      palabra: ["Angulo", "Ángulo"],
      definicion: "Figura formada por dos líneas que concurren en un lugar punto llamado vértice"
    },
    {
      letra: "M",
      palabra: ["Multiplicacion", "Multiplicar", "Multiplicación"],
      definicion: "Es la suma iterada, es decir, sumar el mismo número una cantidad de veces determinada"
    },
    {
      letra: "A",
      palabra: ["Adicion", "Suma", "Sumar", "Adición"],
      definicion: "Operación matemática que se resuelve sumando cantidades numéricas"
    },
    {
      letra: "E",
      palabra: ["Ecuación", "Ecuacion"],
      definicion: "Una igualdad matemática que muestra que dos expresiones son iguales, usando un signo igual (=)"
    },
    {
      letra: "O",
      palabra: ["Angulo obtuso", "Obtuso", "Ángulo obtuso"],
      definicion: "Un ángulo que mide más de 90 grados, pero menos de 180 grados"
    },
    {
      letra: "A",
      palabra: ["Angulo agudo", "Agudo", "Ángulo agudo"],
      definicion: "Un ángulo que mide más de 0 grados y menos de 90 grados"
    },
    {
      letra: "R",
      palabra: ["Angulo recto", "Recto", "Ángulo recto"], 
      definicion: "Un ángulo que mide exactamente 90 grados"
    },
    {
      letra: "D",
      palabra: ["División", "Dividir", "Division"],
      definicion: "El proceso de distribuir o repartir un número en partes o grupos iguales"
    }
  ];

  const [sortedWords] = useState(() =>
    words.sort(() => Math.random() - 0.5).slice(0, 3)
  );
  
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [lettersState, setLettersState] = useState(Array(sortedWords.length).fill('pendiente'));
  const [secondRound, setSecondRound] = useState(false);

  // ⏸️ Nuevo: control de pausa manual
  const [paused, setPaused] = useState(false);

  const letters = sortedWords.map((w) => w.letra.toUpperCase());
  const currentWord = sortedWords[index];

  const roscoSize = 810;

  const radiusWords = roscoSize / 2 - 70; // margen interior para las letras

  // ⏱️ Temporizador
  useEffect(() => {
    if (finished || paused) return;
  }, [finished, paused]);

  const nextIndex = (current) => {
    for (let i = 1; i <= sortedWords.length; i++) {
      const next = (current + i) % sortedWords.length;
      if (lettersState[next] === 'pendiente' || lettersState[next] === 'pasada') {
        return next;
      }
    }
    return -1;
  };

  const handleAnswer = () => {
    const normalizedAnswer = answer.trim().toLowerCase();

    // Varias respuestas correctas
    const possibleAnswers = Array.isArray(currentWord.palabra)
      ? currentWord.palabra.map((p) => p.trim().toLowerCase())
      : [currentWord.palabra.trim().toLowerCase()];

    const isCorrect = possibleAnswers.includes(normalizedAnswer);

    setLettersState((prev) => {
      const newState = [...prev];
      newState[index] = isCorrect ? 'correcto' : 'incorrecto';
      return newState;
    });

    if (isCorrect) {
      setFeedback("✅ ¡Correcto!");
      const correctSound = new Audio(correctS);
      correctSound.play().catch(() => {});
    } else {
      setFeedback(`❌ Incorrecto. Era:\n${currentWord.palabra.at(-1)}`);
      const incorrectSound = new Audio(incorrectS);
      incorrectSound.play().catch(() => {});
    }



    // 🔹 Pausa el juego y muestra botón "Continuar"
    setPaused(true);
  };

  const handleSkip = () => {
    setLettersState((prev) => {
      const newState = [...prev];
      newState[index] = 'pasada';
      return newState;
    });
    const pasarSound = new Audio(pasarS);
    pasarSound.play().catch(() => {});
    setFeedback("⏭️ Pasaste esta palabra");
    setPaused(true); // también pausa para que puedan prepararse
  };

  const next = () => {
    const next = nextIndex(index);
    if (next === -1) {
      if (!secondRound && lettersState.some((e) => e === 'pasada')) {
        setSecondRound(true);
        setLettersState((prev) => prev.map((e) => (e === 'pasada' ? 'pendiente' : e)));
        setIndex(lettersState.findIndex((e) => e === 'pendiente'));
        setFeedback("🔁 Segunda ronda: palabras pasadas");
        setPaused(false);
      } else {
        setFinished(true);
      }
    } else {
      setIndex(next);
      setAnswer("");
      setFeedback("");
      setPaused(false); // 🔹 al avanzar, reanuda el juego
    }
  };

  if (finished) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", background: "whitesmoke", padding: "30px 30px", borderRadius: "10px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
        <h1>🎯 PRÁCTICA FINALIZADA</h1>
        <h2>¿Listos para el desafío real?</h2>
        <button
          onClick={onBack}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            background: "#007bff",
            color: "white",
            fontSize: "1.2rem",
            cursor: "pointer",
          }}
        >
          Volver al inicio
        </button>
      </div>
    );
  }


  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <style>
        {`
          @keyframes pulse {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(0deg) scale(1.05); }
            100% { transform: rotate(0deg) scale(1); }
          }
        `}
      </style>

      <div style={{
        background: "whitesmoke",
        padding: "6px 10px",
        borderRadius: "10px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      }}>
        <h1 style={{ color: "#007bff", fontSize: "2em" }}>🧪 Pasapalabra Científico</h1>
        <h3 style={{ color: "#2c3e50" }}>Palabra {index + 1} de {sortedWords.length}</h3>
      </div>

      <div
        style={{
          position: "relative",
          width: `${roscoSize}px`,
          height: `${roscoSize}px`,
          margin: "15px auto",
        }}
      >

        {/* Rosco con letras */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "radial-gradient(circle at center, #eaf6ff 60%, #d0ebff 100%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 0 25px rgba(0,0,0,0.2)",
            zIndex: 10,
            transform: "rotate(-90deg)",
          }}
        >

          {/* Letras del rosco */}
          {letters.map((letra, i) => {
            const angle = (i / letters.length) * 2 * Math.PI;
            
            const x = (roscoSize/2) + radiusWords * Math.cos(angle);
            const y = (roscoSize/2) + radiusWords * Math.sin(angle);

            let color = "#bdc3c7";
            let border = "2px solid #ecf0f1";
            let glow = "";

            if (lettersState[i] === "correcto") {
              color = "#2ecc71";
              border = "2px solid #27ae60";
            }
            if (lettersState[i] === "incorrecto") {
              color = "#e74c3c";
              border = "2px solid #c0392b";
            }
            if (lettersState[i] === "pasada") {
              color = "#f1c40f";
              border = "2px solid #f39c12";
            }
            if (i === index) {
              color = "#3498db";
              border = "2px solid #2980b9";
              glow = "0 0 10px #2980b9";
            }

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: "translate(-50%, -50%) rotate(90deg)",
                  width: "55px",
                  height: "55px",
                  borderRadius: "50%",
                  background: color,
                  color: "white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                  border,
                  boxShadow: glow,
                  transition: "all 0.3s ease",
                  zIndex: 15,
                }}
              >
                {letra}
              </div>
            );
          })}

          {/* Centro del rosco */}
          <div
            style={{
              width: "500px",
              textAlign: "center",
              background: "linear-gradient(145deg, #ffffff 0%, #eaf6ff 100%)",
              padding: "8px",
              borderRadius: "40px",
              boxShadow: "0 0 8px rgba(0,0,0,0.1)",
              zIndex: 20,
              transform: "rotate(90deg)",
            }}
          >
            <p style={{ fontStyle: "", fontWeight: "bold", minHeight: "80px", color: "#2c3e50", fontSize: "1.4rem", alignContent:"center" }}>
              { !feedback ? `Comienza por la letra: ${letters[index]}`: "" }
              {/* {palabraActual.definicion.toUpperCase()} */}
              {feedback ? feedback.toUpperCase() : currentWord.definicion.toUpperCase()}
            </p>

            {/* Si está pausado, mostramos botón continuar */}
            {paused ? (
              <button
                onClick={next}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.4rem",
                }}
              >
                Continuar
              </button>
            ) : (
              <>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnswer()}
                  placeholder="Tu respuesta..."
                  style={{
                    padding: "10px",
                    width: "80%",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    outline: "none",
                    fontSize: "1.2rem"
                  }}
                />
                <div style={{ marginTop: "10px" }}>
                  <button
                    onClick={() => handleAnswer()}
                    style={{
                      padding: "8px 15px",
                      borderRadius: "8px",
                      background: "#27ae60",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      marginRight: "10px",
                      fontSize: "1.4rem",
                    }}
                  >
                    Responder
                  </button>
                  <button
                    onClick={handleSkip}
                    style={{
                      padding: "8px 15px",
                      borderRadius: "8px",
                      background: "#f39c12",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.4rem",
                    }}
                  >
                    Pasapalabra
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <button 
        onClick={onBack}
        style={{
          position: "fixed",
          zIndex: "9999",
          top: "20px",
          right: "20px",
          padding: "8px 15px",
          backgroundColor: "#e74c3c",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "1.4rem",
        }}
      
      
      >
        Salir
      </button>
    </div>
  );
}
