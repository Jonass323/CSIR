/* ============================
      📌 VARIABLES GLOBALES
============================ */
let participantes = [];

/* ============================
      📌 CARGA MANUAL
============================ */
function cargarManual() {
  const texto = document.getElementById("lista").value.trim();

  if (!texto) return alert("⚠ Escribí algo antes de cargar.");

  const nuevos = texto
    .split(/\r?\n|,/)
    .map(p => p.trim())
    .filter(p => p);

  agregarParticipantes(nuevos);

  document.getElementById("lista").value = "";
  actualizarVista();
}

/* ============================
   📌 AGREGA SIN DUPLICADOS
============================ */
function agregarParticipantes(arrayDeNombres) {
  arrayDeNombres.forEach(nombre => {
    if (!participantes.includes(nombre)) participantes.push(nombre);
  });
}

/* ============================
      📌 ACTUALIZAR VISTA
============================ */
function actualizarVista() {
  document.getElementById("cantidad").innerText =
    `Participantes cargados: ${participantes.length}`;

  document.getElementById("lista-participantes").innerHTML =
    participantes.map(p => `<div>${p}</div>`).join("");
}

/* ============================
      📌 CARGA DE EXCEL / CSV
============================ */
function cargarArchivo(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(evt) {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(hoja, { defval: "" });

    let listaTemporal = [];

    json.forEach(fila => {
      // 🔄 Normalizamos claves (minúsculas + sin espacios)
      const normalizadas = {};
      Object.keys(fila).forEach(k => {
        normalizadas[k.trim().toLowerCase()] = fila[k];
      });

      let nombre = normalizadas["nombre"] || "";
      let apellido = normalizadas["apellido"] || "";
      let socio =
        normalizadas["numero de socio"] ||
        normalizadas["número de socio"] ||
        normalizadas["n° socio"] ||
        normalizadas["nro socio"] ||
        normalizadas["socio"] ||
        "";

      nombre = nombre.toString().trim();
      apellido = apellido.toString().trim();
      socio = socio.toString().trim();

      if (nombre && apellido && socio) {
        listaTemporal.push(`${nombre} ${apellido} (Socio N° ${socio})`);
      }
    });

    if (listaTemporal.length === 0) {
      return alert("⚠ No se detectaron columnas válidas.\nEncabezados sugeridos: Nombre / Apellido / Número de socio");
    }

    agregarParticipantes(listaTemporal);
    actualizarVista();
  };

  reader.readAsArrayBuffer(file);
}

/* ============================
      🎉 INICIAR SORTEO
============================ */
function iniciarCuentaRegresiva(btn) {
  if (participantes.length === 0)
    return alert("⚠ Primero cargá participantes.");

  // Animación en el botón
  btn.classList.add("animar-boton");

  // Cambiar pantallas
  document.getElementById("pantalla-principal").classList.add("oculto");
  document.getElementById("pantalla-cuenta").classList.remove("oculto");

  let tiempo = parseInt(document.getElementById("tiempo").value);
  const contador = document.getElementById("contador");
  contador.textContent = tiempo;

  let intervalo = setInterval(() => {
    tiempo--;
    contador.textContent = tiempo;
    if (tiempo <= 0) {
      clearInterval(intervalo);
      sortearGanador();
    }
  }, 1000);
}

/* ============================
      🏆 SORTEO DE GANADOR
============================ */
function sortearGanador() {
  document.getElementById("pantalla-cuenta").classList.add("oculto");
  document.getElementById("pantalla-ganador").classList.remove("oculto");

  const ganador = participantes[Math.floor(Math.random() * participantes.length)];
  document.getElementById("nombre-ganador").textContent = ganador;

  lanzarConfeti();
}

/* ============================
      🔁 VOLVER
============================ */
function volverInicio() {
  document.getElementById("pantalla-ganador").classList.add("oculto");
  document.getElementById("pantalla-principal").classList.remove("oculto");
}

/* ============================
      🎉 CONFETTI
============================ */
function lanzarConfeti() {
  let colores = ["#001f60", "#ffffff", "#6cb6ff"];
  let duracion = 2500;
  let fin = Date.now() + duracion;

  (function frame() {
    confetti({ particleCount: 70, spread: 90, colors: colores });
    if (Date.now() < fin) requestAnimationFrame(frame);
  })();
}

/* ============================
      🖥 FULLSCREEN
============================ */
function toggleFullScreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
}

/* ============================
      🎯 EVENTO DEL INPUT
============================ */
document.getElementById("archivo").addEventListener("change", cargarArchivo);
