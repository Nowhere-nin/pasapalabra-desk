import { useState, useEffect } from "react";
import Papa from 'papaparse';
import XLSX from 'xlsx'
import Swal from 'sweetalert2';
import styles from '../css/WordSetupScreen.module.css';

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

        if( parsed.length <= 30) {
          setEntries(parsed);
        } else {
          setEntries( parsed.slice(0, 30) )
        }
        
        
        
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
      Swal.fire("¡Espera!", "Debes ingresar un nombre para tu rosco", "error", {
        timer: 1500,
      })
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
      Swal.fire("¡Espera!", "Debes ingresar al menos una letra, definición y palabra válida.", "error");
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
    if(entries.length < 30) {
      setEntries([...entries, { letra: "", definicion: "", palabra: [""] }]);
    } else {
      Swal.fire("¡Límite alcanzado!", "Se llegó al límite de palabras para el rosco, que es de 30 palabras", "info", {
        buttons: false,
      })
    }
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
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No serás capaz de recuperar el rosco si no lo exportaste!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "¡Sí, eliminalo!"
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedList = savedRoscos.filter(r => r.nombre !== roscoName);
        window.store.set('roscosPersonalizados', updatedList)
        setSavedRoscos(updatedList);
        loadRosco('new');
        Swal.fire({
          title: "¡Eliminado!",
          text: "El rosco fue eliminado con éxito.",
          icon: "success"
        });
      }
    });
  }


  // Finalizar y enviar datos
  const handleFinish = () => {

    // Comprueba si ingresó un nombre para el rosco
    if (!roscoName.trim()) {
      Swal.fire("¡Espera!", "Debes ingresar un nombre para tu rosco", "error");
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
      Swal.fire("¡Espera!", "Debes ingresar al menos una letra, definición y palabra válida.", "error");
      return;
    }

    // Guardar en Store
    const newRosco = { nombre: roscoName.trim(), palabra: filtradas };
    saveRoscoToStore(newRosco);

    Swal.fire("Listo", "Guardado completo", "success", {
      buttons: false,
      timer: 1500
    })

    // Enviar al componente principal
    onFinish();
  };

  return (
    <div
      className={styles.div}
    >
      <h1 className={styles.h1} >🧩 Crea tu rosco</h1>
      <p className={styles.p} >Puedes agregar varias respuestas correctas por cada letra a responder. <br /> Hay un límite de 4 palabras por definición y un total de 30 letras para el rosco.</p>

      {/* Cargar rosco existente */}
      {savedRoscos.length > 0 && (
        <div className={styles.divSelect}>
          <label style={{ fontSize: "1.2rem" }}>Cargar rosco existente: </label>
          <select onChange={(e) => loadRosco(e.target.value)} defaultValue="" className={styles.select}>
            <option value="new">-- Selecciona uno --</option>
            {savedRoscos.map((r, i) => (
              <option key={i} value={r.nombre}>{r.nombre}</option>
            ))}
          </select>
        </div>
      )}

      {/* Nombre del rosco */}
      <div className={styles.divSelect}>
        <h2>Ingrese un nombre para el rosco</h2>
        <input
          type="text"
          placeholder="Nombre del rosco"
          value={roscoName}
          id="rosco-name"
          onChange={(e) => setRoscoName(e.target.value)}
          className={styles.inputTitle}
        />
      </div>

      {/* Entradas */}
      <div>
        {entries.map((item, i) => (
          <div 
            key={i}
            className={styles.divEntries}
          >
            <div>
              <h3>Letra Nº{i+1}</h3>
              <input
                type="text"
                id={`letter-${i + 1}`}
                placeholder="Letra"
                value={item.letra}
                maxLength={1}
                onChange={(e) => handleChange(i, "letra", e.target.value)}
                className={styles.inputLetter}
              />
            </div>

            <div>
              <h3>Definición</h3>
              <textarea
                rows={4}
                cols={30}
                placeholder={`Definición N°${i + 1}`}
                value={item.definicion}
                onChange={(e) => handleChange(i, "definicion", e.target.value)}
                className={styles.inputDescription}
              />
            </div>

            <div
              className={styles.divWords}
            >
              <h3>Palabra(s) correcta(s)</h3>
              {item.palabra.map((pal, j) => (
                <input
                  key={j}
                  type="text"
                  placeholder={`Palabra ${j + 1}`}
                  value={pal}
                  onChange={(e) => handleWordChange(i, j, e.target.value)}
                  className={styles.inputWord}
                />
              ))}

              {/* Botónes manejo de entradas  */}
              <div
                className={styles.divButtonsEntries}
              >
                <div
                  className={styles.secondDiv}
                >
                  <button
                    onClick={() => addWordToEntry(i)}
                    className={styles.buttonAddWord}
                  >
                    Otra palabra
                  </button>
                </div>
                <div
                  className={styles.divButtonsRemove}
                >
                  <button
                    onClick={() => removeWordToEntry(i)}
                    className={styles.buttonRemoveWord}
                    disabled={entries[i].palabra.length <= 1}
                  >
                    Quitar palabra
                  </button>

                  <button
                    onClick={() => removeRow(i)}
                    className={styles.buttonRemoveDefinition}
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
        className={styles.buttonAddRow}
      >
        ➕ Añadir nueva definición
      </button>

      <div className={styles.divButtonsRosco}>
        <div
          className={styles.divContainer}
        >
          <button
            onClick={handleFinish}
            className={styles.buttonSave}
          >
            💾 Guardar
          </button>

          <button
            onClick={onBack}
            className={styles.buttonBack}
          >
            ⬅️ Volver
          </button>
        </div>

        <br />
        
        <div
          className={styles.divContainer}
        >
          <button
            onClick={handleExport}
            className={styles.buttonExport}
          >
            📤 Exportar
          </button>
          <label
            htmlFor="import-input"
            className={styles.buttonImport}   
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
          className={styles.buttonDelete}
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
