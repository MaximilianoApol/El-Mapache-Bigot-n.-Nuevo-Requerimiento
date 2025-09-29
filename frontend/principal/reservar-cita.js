// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// Variables globales
let servicioSeleccionado = null;
let barberoSeleccionado = null;
let barberos = [];

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Obtener el servicio seleccionado de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const servicioId = urlParams.get('servicio');
    
    if (servicioId) {
        cargarServicioSeleccionado(servicioId);
    }
    
    cargarBarberos();
    configurarFechaMinima();
    configurarFormulario();
});

// Configurar fecha mínima (hoy)
function configurarFechaMinima() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const minDate = `${year}-${month}-${day}`;
    
    document.getElementById('fechaCita').min = minDate;
}

// Cargar información del servicio seleccionado
async function cargarServicioSeleccionado(servicioId) {
    try {
        const response = await fetch(`${API_BASE_URL}/servicios/${servicioId}`);
        if (!response.ok) throw new Error('Error al cargar servicio');
        
        servicioSeleccionado = await response.json();
        mostrarServicioSeleccionado();
    } catch (error) {
        console.error('Error:', error);
        // Si hay error, ocultar la sección del servicio
        document.getElementById('servicio-info').style.display = 'none';
    }
}

// Mostrar información del servicio seleccionado
function mostrarServicioSeleccionado() {
    if (!servicioSeleccionado) return;
    
    document.getElementById('servicio-nombre').textContent = servicioSeleccionado.descripcion;
    document.getElementById('servicio-precio').textContent = `$${servicioSeleccionado.costo}`;
    document.getElementById('servicio-info').style.display = 'block';
}

// Cargar barberos disponibles
async function cargarBarberos() {
    try {
        const response = await fetch(`${API_BASE_URL}/barberos`);
        if (!response.ok) throw new Error('Error al cargar barberos');
        
        barberos = await response.json();
        mostrarBarberos();
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('barberos-selection').innerHTML = 
            '<div class="col-12 text-center"><p class="text-danger">Error al cargar barberos</p></div>';
    }
}

// Mostrar barberos para selección
function mostrarBarberos() {
    const container = document.getElementById('barberos-selection');
    
    if (barberos.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p>No hay barberos disponibles</p></div>';
        return;
    }
    
    container.innerHTML = `
        <div class="col-12">
            <div class="barbero-selection">
                ${barberos.map(barbero => `
                    <div class="barbero-option" onclick="seleccionarBarbero(${barbero.id})">
                        <img src="http://localhost:8080/${barbero.fotoUrl || 'images/default-barbero.jpg'}" 
                             alt="${barbero.nombre}" 
                             onerror="this.src='https://via.placeholder.com/80x80/cccccc/666666?text=👨‍💼'">
                        <h5>${barbero.nombre}</h5>
                        <p>Barbero profesional</p>
                        <input type="radio" name="barbero" value="${barbero.id}" id="barbero-${barbero.id}">
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Seleccionar barbero
function seleccionarBarbero(barberoId) {
    // Remover selección anterior
    document.querySelectorAll('.barbero-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Agregar selección al barbero clickeado
    event.currentTarget.classList.add('selected');
    
    // Marcar el radio button
    document.getElementById(`barbero-${barberoId}`).checked = true;
    
    // Guardar barbero seleccionado
    barberoSeleccionado = barberos.find(b => b.id === barberoId);
    
    // Validar formulario
    validarFormulario();
}

// Configurar eventos del formulario
function configurarFormulario() {
    const form = document.getElementById('citaForm');
    
    // Validación en tiempo real
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', validarFormulario);
        input.addEventListener('change', validarFormulario);
    });
    
    // Envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validarFormulario()) {
            registrarCita();
        }
    });
}

// Validar formulario
function validarFormulario() {
    const nombre = document.getElementById('clienteNombre').value.trim();
    const telefono = document.getElementById('clienteTelefono').value.trim();
    const fecha = document.getElementById('fechaCita').value;
    const hora = document.getElementById('horaCita').value;
    
    const isValid = nombre && telefono && fecha && hora && barberoSeleccionado;
    
    document.getElementById('btnConfirmar').disabled = !isValid;
    
    return isValid;
}

// Registrar cita
async function registrarCita() {
    const btnConfirmar = document.getElementById('btnConfirmar');
    const originalText = btnConfirmar.innerHTML;
    
    try {
        // Mostrar loading
        btnConfirmar.disabled = true;
        btnConfirmar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
        
        // Preparar datos del cliente
        const clienteData = {
            nombre: document.getElementById('clienteNombre').value.trim(),
            telefono: document.getElementById('clienteTelefono').value.trim()
        };
        
        // Registrar cliente primero
        const clienteResponse = await fetch(`${API_BASE_URL}/clientes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clienteData)
        });
        
        if (!clienteResponse.ok) throw new Error('Error al registrar cliente');
        const cliente = await clienteResponse.json();
        
        // Preparar fecha y hora
        const fecha = document.getElementById('fechaCita').value;
        const hora = document.getElementById('horaCita').value;
        const fechaHora = `${fecha}T${hora}:00`;
        
        // Preparar datos de la cita
        const citaData = {
            fechaHora: fechaHora,
            cliente: { id: cliente.id },
            barbero: { id: barberoSeleccionado.id },
            servicio: { id: servicioSeleccionado ? servicioSeleccionado.id : 1 } // Default servicio si no hay seleccionado
        };
        
        // Registrar cita
        const citaResponse = await fetch(`${API_BASE_URL}/citas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(citaData)
        });
        
        if (!citaResponse.ok) throw new Error('Error al registrar cita');
        const cita = await citaResponse.json();
        
        // Mostrar confirmación
        mostrarConfirmacion(cita, cliente);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al registrar la cita. Por favor, intente nuevamente.');
        
        // Restaurar botón
        btnConfirmar.disabled = false;
        btnConfirmar.innerHTML = originalText;
    }
}

// Mostrar modal de confirmación
function mostrarConfirmacion(cita, cliente) {
    const fecha = new Date(cita.fechaHora);
    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const horaFormateada = fecha.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const detalles = `
        <div class="cita-confirmada">
            <p><strong>Cliente:</strong> ${cliente.nombre}</p>
            <p><strong>Teléfono:</strong> ${cliente.telefono}</p>
            <p><strong>Barbero:</strong> ${barberoSeleccionado.nombre}</p>
            ${servicioSeleccionado ? `<p><strong>Servicio:</strong> ${servicioSeleccionado.descripcion}</p>` : ''}
            <p><strong>Fecha:</strong> ${fechaFormateada}</p>
            <p><strong>Hora:</strong> ${horaFormateada}</p>
        </div>
    `;
    
    document.getElementById('detallesCita').innerHTML = detalles;
    
    const modal = new bootstrap.Modal(document.getElementById('confirmacionModal'), {
        backdrop: 'static',
        keyboard: false
    });
    modal.show();
}

// Cancelar cita y volver al inicio
function cancelarCita() {
    if (confirm('¿Está seguro que desea cancelar el registro de la cita?')) {
        window.location.href = 'index.html';
    }
}

// Volver al inicio después de confirmar
function volverInicio() {
    window.location.href = 'index.html';
}

// Función para iniciar sesión (placeholder)
function iniciarSesion() {
    alert('Funcionalidad de inicio de sesión - Próximamente disponible');
}

// Validaciones adicionales
function validarTelefono(telefono) {
    const regex = /^[\d\s\-\+\(\)]+$/;
    return regex.test(telefono) && telefono.length >= 10;
}

function validarNombre(nombre) {
    return nombre.length >= 2 && /^[a-zA-ZÀ-ÿ\s]+$/.test(nombre);
}

// Eventos adicionales para validación en tiempo real
document.addEventListener('DOMContentLoaded', function() {
    const nombreInput = document.getElementById('clienteNombre');
    const telefonoInput = document.getElementById('clienteTelefono');
    
    if (nombreInput) {
        nombreInput.addEventListener('blur', function() {
            if (this.value && !validarNombre(this.value)) {
                this.classList.add('error');
                mostrarError(this, 'Ingrese un nombre válido');
            } else {
                this.classList.remove('error');
                ocultarError(this);
            }
        });
    }
    
    if (telefonoInput) {
        telefonoInput.addEventListener('blur', function() {
            if (this.value && !validarTelefono(this.value)) {
                this.classList.add('error');
                mostrarError(this, 'Ingrese un teléfono válido (mínimo 10 dígitos)');
            } else {
                this.classList.remove('error');
                ocultarError(this);
            }
        });
    }
});

// Funciones para mostrar/ocultar errores
function mostrarError(elemento, mensaje) {
    let errorDiv = elemento.parentNode.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        elemento.parentNode.appendChild(errorDiv);
    }
    errorDiv.textContent = mensaje;
}

function ocultarError(elemento) {
    const errorDiv = elemento.parentNode.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}