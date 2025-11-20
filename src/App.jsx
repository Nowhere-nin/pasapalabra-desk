import { useState } from 'react';
import './App.css';
import StartScreen from './components/StartScreen';
import ConfigScreen from './components/ConfigScreen';
import WordSetupScreen from './components/WordSetupScreen';
import PasapalabraApp from './components/PasapalabraApp';
import PracticeMode from './components/PracticeMode';


function App() {
  const [screen, setScreen] = useState('home'); //Para establecer que parte de la aplicación se mostrará
  const [timePerWord, setTimePerWord] = useState(30); // Se usa en la sección de configuración del rosco para establecer cuanto tiempo por palabra se usará
  // const [customUse, setCustomUse] = useState(false); // Se utilizaran o no palabras personalizadas: true o false
  const [customWords, setCustomWords] = useState([]); // Que palabras personalizadas se usarán
  const [selectedRosco, setSelectedRosco] = useState('default'); // El nombre del rosco a usar

  // Iniciar la pantalla de configuración
  const startConfig = () => {
    setScreen('config');
  };

  // Seleccionar el modo y palabras a utilizar a utilizar
  const selectMode = (mode, words) => {
    setCustomWords(words);
    setScreen(mode);
  };

  // Iniciar el modo práctica mostrando las reglas de práctica
  const startPractice = () => {
    setScreen('rulesP')
  }

  // Iniciar la pantalla del juego
  const startGame = () => setScreen('game');

  // Iniciar la pantalla de la práctica
  const startPracticeGame = () => setScreen('practice');

  return (
    <>
      {/* Pantalla de inicio */}
      {screen === 'home' && 
        <StartScreen
          onStart={startConfig} // onStart llama a startConfig para pasar a la pantalla de configuración
          onStartPractice={startPractice} // onStartPractice llama a startPractice para pasar a la pantalla de reglas de la práctica y posteriormente a la pantalla de práctica
        />}
      {/* Pantalla de configuración */}
      {screen === 'config' && (
        <ConfigScreen
          onSelectMode={selectMode} // onSelectMode llama a selectMode para cargar si se utilizaran palabras predefinidas o palabras personalizadas
          onBack={() => setScreen('home')} // onBack es el método que se usará para regresar a la pantalla de inicio (home)
          onSetTime={setTimePerWord} // onSetTime llama a setTimePerWord para establecer el tiempo por palabra
          onSelectRosco={setSelectedRosco} // onSelectRosco llama a setSelectedRosco para establecer el rosco a usar

        />
      )}

      {/* Pantalla de configuración de roscos */}
      {screen === 'setup' && (
        <WordSetupScreen
          onFinish={startConfig} // onDinish llama a startConfig para pasar a la pantalla de configuración
          onBack={() => setScreen('config')} // onBack es el método que se usará para regresar a la pantalla de inicio (home)
        />
      )}

      {/* Pantalla del juego */}
      {screen === 'game' && (
        <PasapalabraApp
          initialTime={timePerWord} // initialTime pasa el tiempo establecido para cada palabra del rosco
          // customWords={customUse ? customWords : null} // customWords pregunta si se utilizarán palabras personalizadas y si es así, pasa las palabras escogidas
          customWords={customWords} // customWords pregunta si se utilizarán palabras personalizadas y si es así, pasa las palabras escogidas
          onBack={() => setScreen('home')} // onBack es el método que se usará para regresar a la pantalla de inicio (home)
          selectedRosco={selectedRosco} // selectedRosco pasa el el nombre del rosco seleccionado
        />
      )}

      {/* Pantalla de la práctica */}
      {screen === 'practice' && (
        <PracticeMode
          words={customWords.length ? customWords : undefined} // words pregunta si se utilizarán palabras personalizadas y si es así, pasa las palabras escogidas
          onBack={() => setScreen('home')} // onBack es el método que se usará para regresar a la pantalla de inicio (home)
        />
      )}

      {/* Pantalla de reglas */}
      {screen === 'rules' && (
        <div
          style={{
            textAlign: "center",
            background: "whitesmoke",
            padding: "30px",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            maxWidth: "700px",
            margin: "50px auto",
          }}
        >
          <h2 style={{ color: "#007bff", fontSize: "2.2rem" }}>Reglas del juego</h2>
          <ul
            style={{
              textAlign: "left",
              fontSize: "1.2rem",
              lineHeight: "1.6",
              margin: "20px 0",
              color: "#2c3e50",
              listStyleType: "none"
            }}
          >
            <li style={{ fontSize: "1.4rem" }}>Responde cada definición antes de que se acabe el tiempo.</li>
            <li style={{ fontSize: "1.4rem" }}>Puedes escribir la palabra o pasar con el botón "Pasapalabra".</li>
            <li style={{ fontSize: "1.4rem" }}>Si pasas una palabra esta se repetirá al final del rosco</li>
            <li style={{ fontSize: "1.4rem" }}>Si fallas, la palabra se marcará como incorrecta.</li>
            <li style={{ fontSize: "1.4rem" }}>Completa todas las letras para terminar el rosco.</li>
            <li style={{ fontSize: "1.4rem" }}>El tiempo por palabra será de <strong>{timePerWord}</strong> segundos.</li>
          </ul>

          <button
            onClick={startGame} // Inicia el modo normal
            style={{
              padding: "15px 35px",
              marginTop: "20px",
              borderRadius: "12px",
              background: "#3498db",
              color: "white",
              fontSize: "1.4rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            ¡Comenzar!
          </button>

          <button
            onClick={() => setScreen('config')} // Cambia la pantalla a la de configuración (config)
            style={{
              display: "block",
              margin: "20px auto 0",
              padding: "10px 25px",
              borderRadius: "8px",
              background: "#e74c3c",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
          >
            Volver
          </button>
        </div>
      )}

      {/* Pantalla de reglas de práctica */}
      {screen === 'rulesP' && (
        <div
          style={{
            textAlign: "center",
            background: "whitesmoke",
            padding: "30px",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            maxWidth: "700px",
            margin: "50px auto",
          }}
        >
          <h2 style={{ color: "#007bff", fontSize: "2.2rem" }}>Reglas de la práctica</h2>
          <ul
            style={{
              textAlign: "left",
              fontSize: "1.2rem",
              lineHeight: "1.6",
              margin: "20px 0",
              color: "#2c3e50",
            }}
          >
            <li style={{ fontSize: "1.4rem" }}>En el modo práctica no hay tiempo para responder, pero en el juego real tendrás que responder las definiciones en el tiempo establecido</li>
            <li style={{ fontSize: "1.4rem" }}>En la práctica serán 3 palabras al azar</li>
            <li style={{ fontSize: "1.4rem" }}>Puedes escribir la palabra o pasar con el botón "Pasapalabra".</li>
            <li style={{ fontSize: "1.4rem" }}>Cuando pasas una palabra, se volverá a repetir al final del rosco.</li>
            <li style={{ fontSize: "1.4rem" }}>Si fallas, la palabra se marcará como incorrecta.</li>
            <li style={{ fontSize: "1.4rem" }}>Completa todas las letras para terminar el rosco.</li>
          </ul>

          <button
            onClick={startPracticeGame} // Inicia el modo de práctica
            style={{
              padding: "15px 35px",
              marginTop: "20px",
              borderRadius: "12px",
              background: "#3498db",
              color: "white",
              fontSize: "1.4rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            ¡Comenzar!
          </button>

          <button
            onClick={() => setScreen('home')} // Cambia la pantalla a la de inicio (home)
            style={{
              display: "block",
              margin: "20px auto 0",
              padding: "10px 25px",
              borderRadius: "8px",
              background: "#e74c3c",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
          >
            Volver
          </button>
        </div>
      )}
    </>
  );
}

export default App;
