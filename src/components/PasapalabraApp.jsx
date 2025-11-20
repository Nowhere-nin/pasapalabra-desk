import { useState, useEffect } from "react";
import tickS from '../assets/sounds/tick.mp3';
import alarmS from '../assets/sounds/alarm.mp3';
import correctS from '../assets/sounds/correct.mp3';
import incorrectS from '../assets/sounds/incorrect.mp3';
import pasarS from '../assets/sounds/pasar.mp3';
import styles from '../css/PasapalabraApp.module.css';

export default function PasapalabraApp({ initialTime, customWords, onBack, selectedRosco }) {

  // const words = [...customWords] // Se cargan las palabras
  // Asegurar que customWords sea un array (fallback seguro)
  const words = Array.isArray(customWords) ? [...customWords] : [];

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
  const letters = words.map(w => String(w.letra || "").toUpperCase()); // Letras de las palabras
  const currentWord = words[index] || { palabra: [""], definicion: "" }; // Palabra actual controlada por el indice

  // Tamaño del rosco
  const roscoSize = 810;
  const center = roscoSize / 2;
  const radius = roscoSize / 2 - 50; // margen interior para el temporizador
  const radiusWords = roscoSize / 2 - 70; // margen interior para las letras

  // Reinicia el juego al cambiar la cantidad de palabras o el tiempo inicial
  useEffect(() => {
    setLetterState(Array(words.length).fill("pendiente"));
    setIndex(0);
    setTime(initialTime);
    setTimerAudio(initialTime);
    setPaused(false);
    setSuccesses(0);
    setSecondRound(false);
    setFeedback("");
    setFinished(words.length === 0);
  }, [words.length, initialTime]);


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

    const correctAnswers = possibleAnswers.map((p) =>
      p.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    );

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
      setFeedback(`❌ Incorrecto. Era:\n${currentWord.palabra[0]}`);
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
        // calcular nuevo estado primero y reutilizarlo
        const newState = letterState.map((e) => (e === 'pasada' ? 'pendiente' : e)); // resetear las pasadas
        setSecondRound(true);
        setLetterState(newState);
        const newIndex = newState.findIndex((e) => e === 'pendiente'); // buscar la primera pendiente
        setIndex(newIndex >= 0 ? newIndex : 0);
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
      <div className={styles.divFinished}>
        <h1>🎯 Pasapalabra terminado</h1>
        <h2>Tu puntaje: {successes} / {words.length}</h2>
        <button
          onClick={onBack}
          className={styles.buttonRestart}
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

  // Si no hay palabras, mostrar mensaje y botón para volver
  if (words.length === 0) {
    return (
      <div className={styles.divFinished}>
        <h1>❗ No hay palabras cargadas</h1>
        <p>Asegúrate de seleccionar un rosco con palabras antes de iniciar.</p>
        <button onClick={onBack} className={styles.buttonRestart}>Volver</button>
      </div>
    );
  }

  return (
    <div
      className={styles.div}
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
      <div
        className={styles.divTitles}
      >
        <h1 className={styles.h1}>PASAPALABRAS DE {selectedRosco === "default" ? "MATEMÁTICAS" : selectedRosco.toUpperCase()}</h1>
        <h3 className={styles.h3}>Palabra {index + 1} de {words.length}</h3>
        <h4 className={styles.h4} style={{ color: timerColor }}>⏱️ Tiempo restante: {time}s</h4>
      </div>

      <div
        className={styles.divGeneralRosco}
        style={{
          width: `${roscoSize}px`,
          height: `${roscoSize}px`,
        }}
      >

        {/* Rosco con letras */}
        <div
          className={styles.divRosco}
        >

          {/* SVG temporizador */}
          <svg
            key={index}
            width={roscoSize}
            height={roscoSize}
            className={styles.svgTemp}
            style={{
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
              className={styles.circle}
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
                key={`${letra}-${i}`}
                className={styles.divLetter}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  background: color,
                  border,
                  boxShadow: glow,
                }}
              >
                {letra}
              </div>
            );
          })}

          {/* Centro del rosco */}
          <div
            className={styles.divCenterRosco}
          >
            {
              !feedback ?
              <div
                className={styles.divLetterCenter}
              >
                {letters[index]}
              </div> : 
              ""
            }
            <p className={styles.p}>
              
              { !feedback ? <br /> : ""}
              {feedback ? feedback.toUpperCase() : currentWord.definicion.toUpperCase()}
            </p>

            {/* Si está pausado, se muestra el botón continuar */}
            {paused ? (
              <button
                onClick={handleNext}
                className={styles.buttonContinue}
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
                  className={styles.inputAnswer}
                />
                <div style={{ marginTop: "10px" }}>
                  <button
                    onClick={() => handleAnswer()}
                    className={styles.buttonAnswer}
                  >
                    Responder
                  </button>
                  <button
                    onClick={handleSkip}
                    className={styles.buttonSkip}
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
        className={styles.buttonBack}
      >
        Salir
      </button>
    </div>
  );
}
