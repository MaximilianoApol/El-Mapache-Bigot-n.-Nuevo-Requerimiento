// API Base URL
const API_BASE_URL = "http://localhost:8080/api";

// Variables globales
let servicioSeleccionado = null;
let barberoSeleccionado = null;
let barberos = [];
let sucursales = [];

// Inicializar cuando se carga la página
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const servicioId = urlParams.get("servicio");

  if (servicioId) {
    cargarServicioSeleccionado(servicioId);
  }

  cargarBarberos();
  cargarSucursales();
  configurarFechaMinima();
  configurarFormulario();
});

// Cargar sucursales
async function cargarSucursales() {
  try {
    const response = await fetch(`${API_BASE_URL}/sucursales`);
    if (!response.ok) throw new Error("Error al cargar sucursales");

    sucursales = await response.json();
    mostrarSucursales();
  } catch (error) {
    console.error("Error:", error);
    const select = document.getElementById("sucursalSelect");
    select.innerHTML = '<option value="">Error al cargar sucursales</option>';
  }
}

// Mostrar sucursales en el select
function mostrarSucursales() {
  const select = document.getElementById("sucursalSelect");

  if (sucursales.length === 0) {
    select.innerHTML =
      '<option value="">No hay sucursales disponibles</option>';
    return;
  }

  select.innerHTML =
    '<option value="">Seleccione una sucursal *</option>' +
    sucursales
      .map(
        (sucursal) =>
          `<option value="${sucursal.id}">${sucursal.direccion}</option>`
      )
      .join("");
}

// Configurar fecha mínima (hoy)
function configurarFechaMinima() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const minDate = `${year}-${month}-${day}`;

  document.getElementById("fechaCita").min = minDate;
}

// Cargar información del servicio seleccionado
async function cargarServicioSeleccionado(servicioId) {
  try {
    const response = await fetch(`${API_BASE_URL}/servicios/${servicioId}`);
    if (!response.ok) throw new Error("Error al cargar servicio");

    servicioSeleccionado = await response.json();
    mostrarServicioSeleccionado();
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("servicio-info").style.display = "none";
  }
}

// Mostrar información del servicio seleccionado
function mostrarServicioSeleccionado() {
  if (!servicioSeleccionado) return;

  document.getElementById("servicio-nombre").textContent =
    servicioSeleccionado.descripcion;
  document.getElementById(
    "servicio-precio"
  ).textContent = `$${servicioSeleccionado.costo}`;
  document.getElementById("servicio-info").style.display = "block";
}

// Cargar barberos disponibles
async function cargarBarberos() {
  try {
    const response = await fetch(`${API_BASE_URL}/barberos`);
    if (!response.ok) throw new Error("Error al cargar barberos");

    barberos = await response.json();
    mostrarBarberos();
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("barberos-selection").innerHTML =
      '<div class="col-12 text-center"><p class="text-danger">Error al cargar barberos</p></div>';
  }
}

// Mostrar barberos para selección - CORREGIDO
function mostrarBarberos() {
  const container = document.getElementById("barberos-selection");

  if (barberos.length === 0) {
    container.innerHTML =
      '<div class="col-12 text-center"><p>No hay barberos disponibles</p></div>';
    return;
  }

  container.innerHTML = `
        <div class="col-12">
            <div class="barbero-selection">
                ${barberos
                  .map((barbero) => {
                    // Construir URL de imagen correctamente
                    let imagenUrl = `http://localhost:8080/${barbero.fotoUrl}`;

                    // Imagen por defecto inline en base64 (sin necesidad de conexión externa)
                    const imagenPorDefecto =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjNjY2NjY2Ij7wn5GoPC90ZXh0Pjwvc3ZnPg==";

                    return `
                        <div class="barbero-option" onclick="seleccionarBarbero(${barbero.id})">
                            <img src="${imagenUrl}" 
                                 alt="${barbero.nombre}" 
                                 onerror="this.src='${imagenPorDefecto}'">
                            <h5>${barbero.nombre}</h5>
                            <p>Barbero profesional</p>
                            <input type="radio" name="barbero" value="${barbero.id}" id="barbero-${barbero.id}">
                        </div>
                    `;
                  })
                  .join("")}
            </div>
        </div>
    `;
}

// Seleccionar barbero
function seleccionarBarbero(barberoId) {
  document.querySelectorAll(".barbero-option").forEach((option) => {
    option.classList.remove("selected");
  });

  event.currentTarget.classList.add("selected");
  document.getElementById(`barbero-${barberoId}`).checked = true;
  barberoSeleccionado = barberos.find((b) => b.id === barberoId);
  validarFormulario();
}

// Configurar eventos del formulario
function configurarFormulario() {
  const form = document.getElementById("citaForm");

  const inputs = form.querySelectorAll("input, select");
  inputs.forEach((input) => {
    input.addEventListener("input", validarFormulario);
    input.addEventListener("change", validarFormulario);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (validarFormulario()) {
      registrarCita();
    }
  });
}

// Validar formulario
function validarFormulario() {
  const nombre = document.getElementById("clienteNombre").value.trim();
  const telefono = document.getElementById("clienteTelefono").value.trim();
  const sucursal = document.getElementById("sucursalSelect").value;
  const fecha = document.getElementById("fechaCita").value;
  const hora = document.getElementById("horaCita").value;

  const isValid =
    nombre && telefono && sucursal && fecha && hora && barberoSeleccionado;

  document.getElementById("btnConfirmar").disabled = !isValid;

  return isValid;
}

// Registrar cita
async function registrarCita() {
  const btnConfirmar = document.getElementById("btnConfirmar");
  const originalText = btnConfirmar.innerHTML;

  try {
    // Mostrar loading
    btnConfirmar.disabled = true;
    btnConfirmar.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Registrando...';

    // 1️⃣ Crear cliente primero
    const clienteData = {
      nombre: document.getElementById("clienteNombre").value.trim(),
      telefono: document.getElementById("clienteTelefono").value.trim(),
    };

    const clienteResponse = await fetch(`${API_BASE_URL}/clientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clienteData),
    });

    if (!clienteResponse.ok) throw new Error("Error al registrar cliente");
    const cliente = await clienteResponse.json();

    // 2️⃣ Construir fecha y hora en formato compatible con LocalDateTime
    const fecha = document.getElementById("fechaCita").value;
    const hora = document.getElementById("horaCita").value;
    const fechaHora = `${fecha} ${hora}:00`; // yyyy-MM-dd HH:mm:ss

    // 3️⃣ Preparar datos de la cita
const citaData = {
    fechaHora: `${fecha} ${hora}:00`,  // yyyy-MM-dd HH:mm:ss
    cliente: { id: cliente.id },
    barbero: { id: barberoSeleccionado.id },
    servicio: { id: servicioSeleccionado ? servicioSeleccionado.id : 1 }, // ✅ número
    sucursal: { id: parseInt(document.getElementById('sucursalSelect').value) } // ✅ número
};

    console.log("Datos de la cita:", citaData);
    // 4️⃣ Registrar cita en backend
    const citaResponse = await fetch(`${API_BASE_URL}/citas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(citaData),
    });

    if (!citaResponse.ok) {
      const errorText = await citaResponse.text();
      console.error("Error backend:", errorText);
      throw new Error("Error al registrar cita");
    }

    const cita = await citaResponse.json();

    // 5️⃣ Mostrar confirmación
    mostrarConfirmacion(cita, cliente);

    // Restaurar botón
    btnConfirmar.disabled = false;
    btnConfirmar.innerHTML = originalText;
  } catch (error) {
    console.error("Error:", error);
    alert("Error al registrar la cita. Por favor, intente nuevamente.");
    btnConfirmar.disabled = false;
    btnConfirmar.innerHTML = originalText;
  }
}

// Mostrar modal de confirmación
function mostrarConfirmacion(cita, cliente) {
  const fecha = new Date(cita.fechaHora);
  const fechaFormateada = fecha.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const horaFormateada = fecha.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const detalles = `
        <div class="cita-confirmada">
            <p><strong>Cliente:</strong> ${cliente.nombre}</p>
            <p><strong>Teléfono:</strong> ${cliente.telefono}</p>
            <p><strong>Sucursal:</strong> ${
              cita.sucursal ? cita.sucursal.direccion : "N/A"
            }</p>
            <p><strong>Barbero:</strong> ${barberoSeleccionado.nombre}</p>
            ${
              servicioSeleccionado
                ? `<p><strong>Servicio:</strong> ${servicioSeleccionado.descripcion}</p>`
                : ""
            }
            <p><strong>Fecha:</strong> ${fechaFormateada}</p>
            <p><strong>Hora:</strong> ${horaFormateada}</p>
        </div>
    `;

  document.getElementById("detallesCita").innerHTML = detalles;

  const modal = new bootstrap.Modal(
    document.getElementById("confirmacionModal"),
    {
      backdrop: "static",
      keyboard: false,
    }
  );
  modal.show();
}

function cancelarCita() {
  if (confirm("¿Está seguro que desea cancelar el registro de la cita?")) {
    window.location.href = "index.html";
  }
}

function volverInicio() {
  window.location.href = "index.html";
}

function validarTelefono(telefono) {
  const regex = /^[\d\s\-\+\(\)]+$/;
  return regex.test(telefono) && telefono.length >= 10;
}

function validarNombre(nombre) {
  return nombre.length >= 2 && /^[a-zA-ZÀ-ÿ\s]+$/.test(nombre);
}

document.addEventListener("DOMContentLoaded", function () {
  const nombreInput = document.getElementById("clienteNombre");
  const telefonoInput = document.getElementById("clienteTelefono");

  if (nombreInput) {
    nombreInput.addEventListener("blur", function () {
      if (this.value && !validarNombre(this.value)) {
        this.classList.add("error");
        mostrarError(this, "Ingrese un nombre válido");
      } else {
        this.classList.remove("error");
        ocultarError(this);
      }
    });
  }

  if (telefonoInput) {
    telefonoInput.addEventListener("blur", function () {
      if (this.value && !validarTelefono(this.value)) {
        this.classList.add("error");
        mostrarError(this, "Ingrese un teléfono válido (mínimo 10 dígitos)");
      } else {
        this.classList.remove("error");
        ocultarError(this);
      }
    });
  }
});

function mostrarError(elemento, mensaje) {
  let errorDiv = elemento.parentNode.querySelector(".error-message");
  if (!errorDiv) {
    errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    elemento.parentNode.appendChild(errorDiv);
  }
  errorDiv.textContent = mensaje;
}

function ocultarError(elemento) {
  const errorDiv = elemento.parentNode.querySelector(".error-message");
  if (errorDiv) {
    errorDiv.remove();
  }
}

function verCitasRegistradas() {
  window.location.href = "citas-registradas.html";
}
