import { useState, useEffect } from "react";
import tickS from './assets/sounds/tick.mp3';
import alarmS from './assets/sounds/alarm.mp3';
import correctS from './assets/sounds/correct.mp3';
import incorrectS from './assets/sounds/incorrect.mp3';
import pasarS from './assets/sounds/pasar.mp3';

export default function PasapalabraApp({ initialTime, customWords, onBack, selectedRosco }) {

  const words = [...customWords] // Se cargan las palabras

  const [index, setIndex] = useState(0); // Indice que marca la palabra actual
  const [answer, setAnswer] = useState(""); // Respuesta que ingresa el usuario
  const [successes, setSuccesses] = useState(0); // Cantidad de aciertos
  const [finished, setFinished] = useState(false); // Control del tiempo, si ha finalizado o no
  const [feedback, setFeedback] = useState(""); // Feedback que mostrará datos relevantes al ingresar una respuesta
  const [time, setTime] = useState(initialTime); // Tiempo por palabra
  const [letterState, setLetterState] = useState(Array(words.length).fill('pendiente')); // Estado de las letras: pendiente / pasada / correcta / incorrecta
  const [secondRound, setSecondRound] = useState(false); // Control del segundo round
  const [timerAudio, setTimerAudio] = useState(initialTime); // Timer para reproducir sonido
  const [paused, setPaused] = useState(false); // Control de pausa
  const letters = words.map((w) => w.letra.toUpperCase()); // Letras de las palabras
  const currentWord = words[index]; // Palabra actual controlada por el indice

  // Tamaño del rosco
  const roscoSize = 810;
  const center = roscoSize / 2;
  const radius = roscoSize / 2 - 50; // margen interior para el temporizador
  const radiusWords = roscoSize / 2 - 70; // margen interior para las letras

  // Temporizador
  useEffect(() => {
    if (finished || paused) return;
    if (time === 0) {
      const alarmSound = new Audio(alarmS);
      alarmSound.play().catch(() => {})
      handleAnswer(true);
      return;
    }

    const timer = setTimeout(() => setTime((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [time, finished, paused]);

  // Reproductor del sonido de tick
  useEffect(() => {
      if (finished || paused) return;
      const tickSound = new Audio(tickS);
      tickSound.play().catch(() => {});

      // Aumenta la velocidad
      const delay = time <= (Math.round(initialTime/2)) && time > (Math.round(initialTime/3)) ? 600 : (time <= (Math.round(initialTime/3)) && time > (Math.round(initialTime/5)) ? 300 : (time <= (Math.round(initialTime/5)) ? 150 : 1000));
      const timer = setTimeout(() => setTimerAudio((t) => t - 1), delay);
      
      
      return () => clearTimeout(timer)
  }, [timerAudio, finished, paused])

  // Pasa a la siguiente palabra
  const nextIndex = (current) => {
    for (let i = 1; i <= words.length; i++) {
      const next = (current + i) % words.length;
      if (letterState[next] === 'pendiente' || letterState[next] === 'pasada') {
        return next;
      }
    }
    return -1;
  };

  // Controla la respuesta ingresada por el usuario
  // Determina si está correcta
  const handleAnswer = (autoFallo = false) => {
    const standarizedAnswer = answer.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
    // const palabraCorrecta = palabraActual.palabra.trim().toLowerCase();

    // Varias respuestas correctas
    const possibleAnswers = Array.isArray(currentWord.palabra)
      ? currentWord.palabra.map((p) => p.trim().toLowerCase())
      : [currentWord.palabra.trim().toLowerCase()];

    const correctAnswers = []
    
    possibleAnswers.map( (p) => {
      const normalizedWord = p.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      correctAnswers.push(normalizedWord)
    })

    const isCorrect = correctAnswers.includes(standarizedAnswer);

    setLetterState((prev) => {
      const newState = [...prev];
      newState[index] = isCorrect ? 'correcto' : 'incorrecto';
      return newState;
    });

    if (isCorrect) {
      setSuccesses((prev) => prev + 1);
      setFeedback("✅ ¡Correcto!");
      const correctSound = new Audio(correctS);
      correctSound.play().catch(() => {});
    } else if (autoFallo) {
      setFeedback("⏰ Tiempo agotado");
    } else {
      setFeedback(`❌ Incorrecto. Era:\n${currentWord.palabra.at(0)}`);
      const incorrectSound = new Audio(incorrectS);
      incorrectSound.play().catch(() => {});
    }

    // Pausa el juego y muestra botón "Continuar"
    setPaused(true);
  };

  // Controla cuando se pasa la palabra
  const handleSkip = () => {
    setLetterState((prev) => {
      const newState = [...prev];
      newState[index] = 'pasada';
      return newState;
    });
    const skipSound = new Audio(pasarS);
    skipSound.play().catch(() => {});
    setFeedback("⏭️ Pasaste esta palabra");
    setPaused(true); // también pausa para que puedan prepararse
  };

  // Controla cuando se pasa a la siguiente palabra
  const handleNext = () => {
    const next = nextIndex(index);
    if (next === -1) {
      if (!secondRound && letterState.some((e) => e === 'pasada')) {
        setSecondRound(true);
        setLetterState((prev) => prev.map((e) => (e === 'pasada' ? 'pendiente' : e)));
        setIndex(letterState.findIndex((e) => e === 'pendiente'));
        setTime(initialTime);
        setTimerAudio(initialTime);
        setFeedback("🔁 Segunda ronda: palabras pasadas");
        setPaused(false);
      } else {
        setFinished(true);
      }
    } else {
      setIndex(next);
      setAnswer("");
      setFeedback("");
      setTime(initialTime);
      setTimerAudio(initialTime);
      setPaused(false); // 🔹 al avanzar, reanuda el juego
    }
  };

  // Controla si el juego ya termino, si es así, muestra el puntaje obtenido
  if (finished) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", background: "whitesmoke", padding: "30px 30px", borderRadius: "10px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
        <h1>🎯 Pasapalabra terminado</h1>
        <h2>Tu puntaje: {successes} / {words.length}</h2>
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
          Reiniciar
        </button>
      </div>
    );
  }

  // Temporizador circular
  const circleRadius = roscoSize/2;
  const circumference = 2 * Math.PI * circleRadius;
  const progress = (time / initialTime) * circumference;

  // Colores del temporizador
  let timerColor = "#2ecc71";
  if (time <= (Math.round(initialTime/2))) timerColor = "#f1c40f";
  if (time <= (Math.round(initialTime/4))) timerColor = "#e74c3c";

  // Animación del pulso al quedar poco tiempo
  const pulseAnimation = time <= (Math.round(initialTime/4)) ? "pulse 0.6s infinite" : "none";

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

      {/* Título, tiempo y cantidad de palabras */}
      <div style={{
        background: "whitesmoke",
        padding: "6px 10px",
        borderRadius: "10px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      }}>
        <h1 style={{ color: "#007bff", fontSize: "2em" }}>PASAPALABRAS DE {selectedRosco == "default" ? "MATEMÁTICAS" : selectedRosco.toUpperCase()}</h1>
        <h3 style={{ color: "#2c3e50" }}>Palabra {index + 1} de {words.length}</h3>
        <h4 style={{ color: timerColor , fontSize: "1.6em", margin: "10px"}}>⏱️ Tiempo restante: {time}s</h4>
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

          {/* SVG temporizador */}
          <svg
            key={index}
            width={roscoSize}
            height={roscoSize}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 5,
              animation: pulseAnimation,
            }}
            viewBox={`0 0 ${roscoSize} ${roscoSize}`}
          >
            <circle cx={center} cy={center} r={radius+20} stroke="#d0ebff" strokeWidth="15" fill="none" />
            <circle
              cx={center}
              cy={center}
              r={radius+20}
              stroke={timerColor}
              strokeWidth="15"
              fill="none"
              strokeDasharray={circumference-80}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 1s linear, stroke 0.5s ease",
              }}
            />
          </svg>

          {/* Letras del rosco */}
          {letters.map((letra, i) => {
            const angle = (i / letters.length) * 2 * Math.PI;
            
            const x = (roscoSize/2) + radiusWords * Math.cos(angle);
            const y = (roscoSize/2) + radiusWords * Math.sin(angle);

            let color = "#bdc3c7";
            let border = "2px solid #ecf0f1";
            let glow = "";

            if (letterState[i] === "correcto") {
              color = "#2ecc71";
              border = "2px solid #27ae60";
            }
            if (letterState[i] === "incorrecto") {
              color = "#e74c3c";
              border = "2px solid #c0392b";
            }
            if (letterState[i] === "pasada") {
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
            {
                !feedback ?
                <div
                style={{
                  margin: "auto",
                  width: "55px",
                  height: "55px",
                  borderRadius: "50%",
                  background: "#3498db",
                  color: "white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontWeight: "bold",
                  fontSize: "1.5rem",
                  border: "2px solid #2980b9",
                  // boxShadow: "0 0 10px #2980b9",
                  transition: "all 0.3s ease",
                  zIndex: 15,
                }}
              >
                {letters[index]}
              </div> : 
              ""
            }
            <p style={{ fontStyle: "", fontWeight: "bold", minHeight: "80px", color: "#2c3e50", fontSize: "1.4rem", alignContent:"center" }}>
              
              { !feedback ? <br /> : ""}
              {feedback ? feedback.toUpperCase() : currentWord.definicion.toUpperCase()}
            </p>

            {/* Si está pausado, se muestra el botón continuar */}
            {paused ? (
              <button
                onClick={handleNext}
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

      {/* Botón salir */}
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
