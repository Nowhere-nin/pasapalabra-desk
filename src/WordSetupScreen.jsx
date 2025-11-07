import { useState, useEffect } from "react";

export default function WordSetupScreen({ onFinish, onBack }) {
  const [roscoName, setRoscoName] = useState('');
  const [entries, setEntries] = useState([{ letra: "", definicion: "", palabra: [""] }]);
  const [savedRoscos, setSavedRoscos] = useState([]);
  const [roscoLoaded, setRoscoLoaded] = useState(false);

  // Cargar roscos guardados del Store
  useEffect( () => {
    const load = async () => {
      const data = await window.store.get('roscosPersonalizados');
      setSavedRoscos(data)
    }
    load();
  }, []);

  // Manejar cambio de letra o definición
  const handleChange = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  // Manejar cambio de palabra específica
  const handleWordChange = (entryIndex, wordIndex, value) => {
    const updated = [...entries];
    updated[entryIndex].palabra[wordIndex] = value;
    setEntries(updated);
  };

  // Agregar otra palabra a la misma definición
  const addWordToEntry = (index) => {
    const updated = [...entries];
    updated[index].palabra.push("");
    setEntries(updated);
  };
  
  // Remover una palabra a la misma definición
  const removeWordToEntry = (index) => {
    const updated = [...entries];
    if (updated[index].palabra.length > 1) {
      updated[index].palabra.pop();
      setEntries(updated);
    } else {
      return;
    }
  };

  // Agregar nueva entrada
  const addRow = () => {
    setEntries([...entries, { letra: "", definicion: "", palabra: [""] }]);
  };

  // Remueve una entrada
  const removeRow = (index) => {
    if (index == 0) {
      return
    }
    const updated = ([...entries]);
    updated.splice(index, 1);
    setEntries(updated)
    
  };


  // Cargar rosco existente o limpia para crear uno nuevo
  const loadRosco = (nombre) => {

    nombre != 'new' || '' ? setRoscoLoaded(true) : setRoscoLoaded(false);
    
    const rosco = savedRoscos.find(r => r.nombre === nombre);
    if (rosco) {
      setRoscoName(rosco.nombre);
      setEntries(rosco.palabra);
    } else {
      setRoscoName('');
      setEntries([{ letra: "", definicion: "", palabra: [""] }]);
    }
  };

  // Guardar rosco en el Store
  const saveRoscoToStore = (rosco) => {
    const updatedList = savedRoscos.filter(r => r.nombre !== rosco.nombre);
    deleteRosco(rosco)
    updatedList.push(rosco);
    window.store.set('roscosPersonalizados', updatedList)
    setSavedRoscos(updatedList);
  };

  // Eliminar rosco en el Store y limpia para crear un nuevo rosco
  const deleteRosco = () => {
    const updatedList = savedRoscos.filter(r => r.nombre !== roscoName);
    window.store.set('roscosPersonalizados', updatedList)
    setSavedRoscos(updatedList);
    loadRosco('new')
  }


  // Finalizar y enviar datos
  const handleFinish = () => {

    // Comprueba si ingresó un nombre para el rosco
    if (!roscoName.trim()) {
      alert("Debes ingresar un nombre para tu rosco.");
      return;
    }

    const filtradas = entries
      .filter(
        e =>
          e.letra.trim() &&
          e.definicion.trim() &&
          e.palabra.some(p => p.trim() !== "")
      )
      .map(e => ({
        letra: e.letra.trim().toUpperCase(),
        definicion: e.definicion.trim(),
        palabra: e.palabra.map(p => p.trim()).filter(p => p !== "")
      }));

      // Comprueba si se añadieron datos válidos para las entradas
    if (filtradas.length === 0) {
      alert("Debes ingresar al menos una letra, definición y palabra válida.");
      return;
    }

    // Guardar en Store
    const newRosco = { nombre: roscoName.trim(), palabra: filtradas };
    saveRoscoToStore(newRosco);

    // Enviar al componente principal
    onFinish();
  };

  return (
    <div
      style={{
        textAlign: "center",
        maxWidth: "850px",
        background: "whitesmoke",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        margin: "auto"
      }}
    >
      <h1 style={{ color: "#007bff", fontSize: "2.8rem" }}>🧩 Crea tu rosco</h1>
      <p style={{ color: "#2c3e50" , fontSize: "1.4rem"}}>Puedes agregar varias respuestas correctas por definición.</p>

      {/* Cargar rosco existente */}
      {savedRoscos.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "1.2rem" }}>Cargar rosco existente: </label>
          <select onChange={(e) => loadRosco(e.target.value)} defaultValue="" style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", outline: "none", fontSize: "1rem" }}>
            <option value="new">-- Selecciona uno --</option>
            {savedRoscos.map((r, i) => (
              <option key={i} value={r.nombre}>{r.nombre}</option>
            ))}
          </select>
        </div>
      )}

      {/* Nombre del rosco */}
      <div style={{ marginBottom: "15px" }}>
        <h2>Ingrese un nombre para el rosco</h2>
        <input
          type="text"
          placeholder="Nombre del rosco"
          value={roscoName}
          onChange={(e) => setRoscoName(e.target.value)}
          style={{
            width: "60%",
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            fontSize: "1.2rem",
          }}
        />
      </div>

      {/* Entradas */}
      <div>
        {entries.map((item, i) => (
          <div
            key={i}
            style={{
              marginBottom: "25px",
              padding: "15px",
              borderRadius: "15px",
              background: "#f8f9fa",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
            }}
          >
            <h3 style={{ margin: "auto" }}>Letra</h3>
            <input
              type="text"
              placeholder="Letra"
              value={item.letra}
              maxLength={1}
              onChange={(e) => handleChange(i, "letra", e.target.value)}
              style={{
                width: "50px",
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "1rem"
              }}
            />

            <h3 >Definición</h3>
            <textarea
              rows={3}
              placeholder={`Definición N°${i+1}`}
              value={item.definicion}
              onChange={(e) => handleChange(i, "definicion", e.target.value)}
              style={{
                width: "50%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                marginBottom: "10px",
                fontSize: "1.1rem",
                resize: "none",
                fontFamily: "Poppins, sans-serif",
              }}
            />

            <h3>Palabra(s) correcta(s)</h3>
            <div>
              {item.palabra.map((pal, j) => (
                <input
                  key={j}
                  type="text"
                  placeholder={`Palabra ${j + 1}`}
                  value={pal}
                  onChange={(e) => handleWordChange(i, j, e.target.value)}
                  style={{
                    width: "35%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #ccc",
                    margin: "5px",
                    fontSize: "1.1rem"
                  }}
                />
              ))}
              <br />

              <button
                onClick={() => addWordToEntry(i)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  background: "#3498db",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  margin: "10px",
                  fontSize: "1.1rem"
                }}
              >
                Otra palabra
              </button>
              <button
                onClick={() => removeWordToEntry(i)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  background: "#db9834ff",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  margin: "10px",
                  fontSize: "1.1rem"
                }}
                disabled={
                  entries[i].palabra.length <= 1 ? true : false
                }
              >
                Quitar palabra
              </button>
              <br />
              <button
                onClick={() => removeRow(i)}
                style={{
                  marginTop: "15px",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  background: "#db3f34ff",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.2rem"
                }}
                disabled={
                  entries.length <= 1 ? true : false
                }
              >
                Quitar definición
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addRow}
        style={{
          marginTop: "15px",
          padding: "10px 20px",
          borderRadius: "10px",
          background: "#2980b9",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "1.2rem"
        }}
      >
        ➕ Añadir nueva definición
      </button>

      <div style={{ marginTop: "30px" }}>

        <button
          onClick={handleFinish}
          style={{
            padding: "15px 45px",
            borderRadius: "12px",
            background: "#27ae60",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "1.2rem",
            marginRight: "15px"
          }}
        >
          💾 Guardar
        </button>

        <button
          onClick={onBack}
          style={{
            padding: "15px 45px",
            borderRadius: "12px",
            background: "#e74c3c",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "1.2rem"
          }}
        >
          ⬅️ Volver
        </button>

        <br />

        <button
          onClick={deleteRosco}
          style={{
            padding: "15px 45px",
            borderRadius: "12px",
            background: "#27ae60",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "1.2rem",
            marginTop: "15px"
          }}
          disabled = {
            !roscoLoaded
          }
        >
          🗑 Eliminar rosco
        </button>
      </div>
    </div>
  );
}
