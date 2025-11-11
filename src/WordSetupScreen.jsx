import { useState, useEffect } from "react";
import Papa from 'papaparse';
import XLSX from 'xlsx'
import swal from 'sweetalert';

export default function WordSetupScreen({ onFinish, onBack }) {
  const [roscoName, setRoscoName] = useState('');
  const [entries, setEntries] = useState([{ letra: "", definicion: "", palabra: [""] }]);
  const [savedRoscos, setSavedRoscos] = useState([]);
  const [roscoLoaded, setRoscoLoaded] = useState(false);

  // Cargar roscos guardados del Store
  useEffect( () => {
    const load = async () => {
      const data = await window.store.get('roscosPersonalizados');
      if(!data) {
        return;
      }

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

  // Trabajo en progreso...

  // Manejar importación de roscos
  const handleImport = (e) => {
    
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    if (isExcel) {
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        const parsed = worksheet.map((row) => ({
          letra: row.Letra || "",
          definicion: row.Definicion || "",
          palabra: row.Palabras ? row.Palabras.split(",").map((p) => p.trim()) : [""],
        }));
        if(!sheetName.includes("Sheet")) {
          setRoscoName(sheetName);
        }
        
        setEntries(parsed);
      };

      e.target.value = "";
      reader.readAsArrayBuffer(file);
    } else {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const parsed = results.data.map((row) => ({
            letra: row.Letra || "",
            definicion: row.Definicion || "",
            palabras: row.Palabras ? row.Palabras.split(",").map((p) => p.trim()) : [""],
          }));
          setEntries(parsed);
        },
      });
    }

  }


  // Manejar exportación de roscos
  const handleExport = () => {

    // Comprueba si ingresó un nombre para el rosco
    if (!roscoName.trim()) {
      // alert("Debes ingresar un nombre para tu rosco.");
      swal("Espera!", "Debes ingresar un nombre para tu rosco", "error")
      document.getElementById("rosco-name").focus();
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
      swal("Espera!", "Debes ingresar al menos una letra, definición y palabra válida.", "error");
      return;
    }




    const csvData = entries.map((e) => ({
      Letra: e.letra,
      Definicion: e.definicion,
      Palabras: e.palabra.join(", "),
    }));
    // const csv = Papa.unparse(csvData);

    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, roscoName); // <---- Revisar

    XLSX.writeFile(workbook, "rosco_personalizado.xlsx", { compression: true });

    // const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    // const link = document.createElement("a");
    // link.href = URL.createObjectURL(blob);
    // link.download = "rosco_personalizado.csv";
    // link.click();
  }

  // Agregar otra palabra a la misma definición
  const addWordToEntry = (index) => {
    if (entries[index].palabra.length > 3 ) {
      return;
    }
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
    if (entries.length == 1) {
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
      swal("Espera!", "Debes ingresar un nombre para tu rosco", "error");
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
      swal("Espera!", "Debes ingresar al menos una letra, definición y palabra válida.", "error");
      return;
    }

    // Guardar en Store
    const newRosco = { nombre: roscoName.trim(), palabra: filtradas };
    saveRoscoToStore(newRosco);

    swal("Listo", "Guardado completo", "success", {
      buttons: false,
      timer: 1500
    })

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
        margin: "auto",
        width: "100%",
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
          id="rosco-name"
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
      {/* <div>
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
              rows={2}
              placeholder={`Definición N°${i+1}`}
              value={item.definicion}
              onChange={(e) => handleChange(i, "definicion", e.target.value)}
              style={{
                width: "70%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                marginBottom: "10px",
                fontSize: "1.1rem",
                resize: "none",
                fontFamily: "Poppins, sans-serif",
              }}
            />

            <h3 style={{ marginTop: "5px" }}>Palabra(s) correcta(s)</h3>
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
      </div> */}

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
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              display: "flex",
              // flexDirection: "column", // 👈 Esto fuerza disposición vertical
              flexDirection: "row",
              justifyContent: "center",
              gap: "30px"
            }}
          >
            <div>
              <h3>Letra</h3>
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
            </div>

            <div>
              <h3>Definición</h3>
              <textarea
                rows={4}
                placeholder={`Definición N°${i + 1}`}
                value={item.definicion}
                onChange={(e) => handleChange(i, "definicion", e.target.value)}
                style={{
                  width: "90%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                  fontSize: "1.1rem",
                  resize: "none",
                  fontFamily: "Poppins, sans-serif"
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column", // 👈 vertical dentro del subgrupo también
                alignItems: "center",
                gap: "8px"
              }}
              >
              <h3>Palabra(s) correcta(s)</h3>
              {item.palabra.map((pal, j) => (
                <input
                  key={j}
                  type="text"
                  placeholder={`Palabra ${j + 1}`}
                  value={pal}
                  onChange={(e) => handleWordChange(i, j, e.target.value)}
                  style={{
                    width: "60%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #ccc",
                    fontSize: "1.1rem"
                  }}
                />
              ))}

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginTop: "10px"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:"center",
                  }}
                >
                  <button
                    onClick={() => addWordToEntry(i)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "10px",
                      background: "#3498db",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.1rem"
                    }}
                  >
                    Otra palabra
                  </button>
                </div>
                <div
                  style={{
                    display:"flex",
                    flexDirection: "row",
                    gap: "10px"
                  }}
                >
                  <button
                    onClick={() => removeWordToEntry(i)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "10px",
                      background: "#db9834ff",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.1rem"
                    }}
                    disabled={entries[i].palabra.length <= 1}
                  >
                    Quitar palabra
                  </button>

                  <button
                    onClick={() => removeRow(i)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "10px",
                      background: "#db3f34ff",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.1rem"
                    }}
                    disabled={entries.length <= 1}
                  >
                    Quitar definición
                  </button>
                </div>
              </div>
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

        <div
          style={{
            height: "100%",
            display: "flex",
          }}
        >
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
              marginLeft: "auto",
              marginRight: "5px",
              width: "35%",
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
              fontSize: "1.2rem",
              marginRight: "auto",
              marginLeft: "5px",
              width: "35%",
            }}
          >
            ⬅️ Volver
          </button>
        </div>

        <br />
        
        <div
          style={{
            height: "100%",
            display: "flex",
          }}
        >
          <button
            onClick={handleExport}
            style={{
              padding: "15px 45px",
              borderRadius: "12px",
              background: "#27ae60",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem",
              borderTopRightRadius: "0px",
              borderBottomRightRadius: "0px",

              marginLeft: "auto"
            }}
          >
            📤 Exportar
          </button>
          <label
            htmlFor="import-input"
            style={{
              padding: "15px 45px",
              borderRadius: "12px",
              background: "#e7973cff",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem",
              height: "100%",
              borderTopLeftRadius: "0px",
              borderBottomLeftRadius: "0px",

              marginRight: "auto",
            }}      
          >
            📥 Importar
          </label>
          <input
            type="file"
            accept=".csv, .xlsx, .xls"
            id="import-input"
            onChange={handleImport}
            style={{ display: "none" }}
          />
        </div>

        <br />

        <button
          onClick={deleteRosco}
          style={{
            padding: "15px 45px",
            background: "#27ae60",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "1.2rem",
            marginTop: "10px",
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
