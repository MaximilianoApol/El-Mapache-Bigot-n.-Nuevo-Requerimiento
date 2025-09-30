// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// Variables globales
let todasLasCitas = [];
let citasFiltradas = [];
let barberos = [];
let citaAEliminarId = null;
let vistaActual = 'tabla';

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    cargarDatos();
    configurarFiltros();
});

// Cargar todos los datos necesarios
async function cargarDatos() {
    try {
        await Promise.all([
            cargarCitas(),
            cargarBarberos()
        ]);
        calcularEstadisticas();
    } catch (error) {
        console.error('Error al cargar datos:', error);
        mostrarError('Error al cargar los datos');
    }
}

// Cargar todas las citas
async function cargarCitas() {
    try {
        const response = await fetch(`${API_BASE_URL}/citas`);
        if (!response.ok) throw new Error('Error al cargar citas');
        
        todasLasCitas = await response.json();
        citasFiltradas = [...todasLasCitas];
        
        // Ordenar por fecha (más recientes primero)
        citasFiltradas.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
        
        mostrarCitas();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al cargar las citas');
    }
}

// Cargar barberos para filtros
async function cargarBarberos() {
    try {
        const response = await fetch(`${API_BASE_URL}/barberos`);
        if (!response.ok) throw new Error('Error al cargar barberos');
        
        barberos = await response.json();
        llenarFiltroBarberos();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Llenar select de filtro de barberos
function llenarFiltroBarberos() {
    const select = document.getElementById('filtroBarbero');
    select.innerHTML = '<option value="">Todos los barberos</option>';
    
    barberos.forEach(barbero => {
        const option = document.createElement('option');
        option.value = barbero.id;
        option.textContent = barbero.nombre;
        select.appendChild(option);
    });
}

// Mostrar citas según la vista actual
function mostrarCitas() {
    if (citasFiltradas.length === 0) {
        mostrarSinResultados();
        return;
    }
    
    ocultarSinResultados();
    
    if (vistaActual === 'tabla') {
        mostrarCitasTabla();
    } else {
        mostrarCitasTarjetas();
    }
}

// Mostrar citas en formato tabla
function mostrarCitasTabla() {
    const tbody = document.getElementById('citas-tabla-body');
    
    tbody.innerHTML = citasFiltradas.map(cita => {
        const fecha = new Date(cita.fechaHora);
        const fechaFormateada = fecha.toLocaleDateString('es-ES');
        const horaFormateada = fecha.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const estado = obtenerEstadoCita(fecha);
        
        return `
            <tr>
                <td>
                    <strong>${cita.cliente.nombre}</strong>
                </td>
                <td>${cita.cliente.telefono}</td>
                <td>${cita.barbero.nombre}</td>
                <td>${cita.servicio.descripcion}</td>
                <td>${fechaFormateada}</td>
                <td>${horaFormateada}</td>
                <td><strong>$ ${cita.servicio.costo}</strong></td>
                <td>
                    <span class="estado-badge ${estado.clase}">${estado.texto}</span>
                </td>
                <td>
                    <button class="btn btn-action btn-info" onclick="verDetallesCita(${cita.id})" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-action btn-danger" onclick="confirmarEliminarCita(${cita.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Mostrar citas en formato tarjetas
function mostrarCitasTarjetas() {
    const container = document.getElementById('citas-tarjetas-container');
    
    container.innerHTML = citasFiltradas.map(cita => {
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
        
        const estado = obtenerEstadoCita(fecha);
        
        return `
            <div class="col-lg-6 col-xl-4">
                <div class="cita-card">
                    <div class="cita-card-header">
                        <div class="cliente-info">
                            <h5>${cita.cliente.nombre}</h5>
                            <p><i class="fas fa-phone"></i> ${cita.cliente.telefono}</p>
                        </div>
                        <span class="estado-badge ${estado.clase}">${estado.texto}</span>
                    </div>
                    
                    <div class="cita-card-body">
                        <div class="info-item">
                            <i class="fas fa-cut"></i>
                            <span>${cita.barbero.nombre}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-scissors"></i>
                            <span>${cita.servicio.descripcion}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-calendar"></i>
                            <span>${fechaFormateada}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-clock"></i>
                            <span>${horaFormateada}</span>
                        </div>
                    </div>
                    
                    <div class="cita-card-footer">
                        <div class="costo-info">$ ${cita.servicio.costo}</div>
                        <div class="card-actions">
                            <button class="btn btn-action btn-info" onclick="verDetallesCita(${cita.id})">
                                <i class="fas fa-eye"></i> Ver
                            </button>
                            <button class="btn btn-action btn-danger" onclick="confirmarEliminarCita(${cita.id})">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Obtener estado de la cita basado en la fecha
function obtenerEstadoCita(fechaCita) {
    const ahora = new Date();
    const fecha = new Date(fechaCita);
    
    if (fecha < ahora) {
        return { clase: 'estado-completada', texto: 'Completada' };
    } else if (fecha.toDateString() === ahora.toDateString()) {
        return { clase: 'estado-programada', texto: 'Hoy' };
    } else {
        return { clase: 'estado-programada', texto: 'Programada' };
    }
}

// Calcular estadísticas
function calcularEstadisticas() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const citasHoy = todasLasCitas.filter(cita => {
        const fechaCita = new Date(cita.fechaHora);
        fechaCita.setHours(0, 0, 0, 0);
        return fechaCita.getTime() === hoy.getTime();
    });
    
    const clientesUnicos = new Set(todasLasCitas.map(cita => cita.cliente.id)).size;
    
    const ingresosDia = citasHoy.reduce((total, cita) => total + parseFloat(cita.servicio.costo), 0);
    
    // Actualizar elementos
    document.getElementById('totalCitas').textContent = todasLasCitas.length;
    document.getElementById('citasHoy').textContent = citasHoy.length;
    document.getElementById('totalClientes').textContent = clientesUnicos;
    document.getElementById('ingresosDia').textContent = `${ingresosDia.toFixed(2)}`;
}

// Configurar eventos de filtros
function configurarFiltros() {
    document.getElementById('filtroFecha').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroBarbero').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroCliente').addEventListener('input', aplicarFiltros);
}

// Aplicar filtros
function aplicarFiltros() {
    const filtroFecha = document.getElementById('filtroFecha').value;
    const filtroBarbero = document.getElementById('filtroBarbero').value;
    const filtroCliente = document.getElementById('filtroCliente').value.toLowerCase();
    
    citasFiltradas = todasLasCitas.filter(cita => {
        const fechaCita = new Date(cita.fechaHora).toISOString().split('T')[0];
        
        const cumpleFecha = !filtroFecha || fechaCita === filtroFecha;
        const cumpleBarbero = !filtroBarbero || cita.barbero.id.toString() === filtroBarbero;
        const cumpleCliente = !filtroCliente || cita.cliente.nombre.toLowerCase().includes(filtroCliente);
        
        return cumpleFecha && cumpleBarbero && cumpleCliente;
    });
    
    mostrarCitas();
}

// Limpiar filtros
function limpiarFiltros() {
    document.getElementById('filtroFecha').value = '';
    document.getElementById('filtroBarbero').value = '';
    document.getElementById('filtroCliente').value = '';
    
    citasFiltradas = [...todasLasCitas];
    mostrarCitas();
}

// Cambiar vista
function cambiarVista(nuevaVista) {
    vistaActual = nuevaVista;
    
    // Actualizar botones
    document.querySelectorAll('.view-toggle .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`btnVista-${nuevaVista}`).classList.add('active');
    
    // Mostrar/ocultar vistas
    document.querySelectorAll('.vista-citas').forEach(vista => {
        vista.classList.remove('active');
    });
    document.getElementById(`vista-${nuevaVista}`).classList.add('active');
    
    mostrarCitas();
}

// Ver detalles de cita
async function verDetallesCita(citaId) {
    try {
        const response = await fetch(`${API_BASE_URL}/citas/${citaId}`);
        if (!response.ok) throw new Error('Error al cargar detalles');
        
        const cita = await response.json();
        mostrarModalDetalles(cita);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los detalles de la cita');
    }
}

// Mostrar modal con detalles
function mostrarModalDetalles(cita) {
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
    
    const estado = obtenerEstadoCita(fecha);
    
    const contenido = `
        <div class="detalle-cita">
            <div class="detalle-item">
                <label>Cliente</label>
                <span>${cita.cliente.nombre}</span>
            </div>
            <div class="detalle-item">
                <label>Teléfono</label>
                <span>${cita.cliente.telefono}</span>
            </div>
            <div class="detalle-item">
                <label>Barbero</label>
                <span>${cita.barbero.nombre}</span>
            </div>
            <div class="detalle-item">
                <label>Servicio</label>
                <span>${cita.servicio.descripcion}</span>
            </div>
            <div class="detalle-item">
                <label>Fecha</label>
                <span>${fechaFormateada}</span>
            </div>
            <div class="detalle-item">
                <label>Hora</label>
                <span>${horaFormateada}</span>
            </div>
            <div class="detalle-item">
                <label>Costo</label>
                <span>$ ${cita.servicio.costo}</span>
            </div>
            <div class="detalle-item">
                <label>Estado</label>
                <span class="estado-badge ${estado.clase}">${estado.texto}</span>
            </div>
        </div>
    `;
    
    document.getElementById('detallesCitaContent').innerHTML = contenido;
    
    const modal = new bootstrap.Modal(document.getElementById('detallesCitaModal'));
    modal.show();
}

// Confirmar eliminación de cita
function confirmarEliminarCita(citaId) {
    const cita = todasLasCitas.find(c => c.id === citaId);
    if (!cita) return;
    
    citaAEliminarId = citaId;
    
    const fecha = new Date(cita.fechaHora);
    const fechaFormateada = fecha.toLocaleDateString('es-ES');
    const horaFormateada = fecha.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    document.getElementById('citaAEliminar').innerHTML = `
        <div class="alert alert-warning">
            <strong>Cliente:</strong> ${cita.cliente.nombre}<br>
            <strong>Fecha:</strong> ${fechaFormateada} a las ${horaFormateada}<br>
            <strong>Servicio:</strong> ${cita.servicio.descripcion}
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('confirmarEliminacionModal'));
    modal.show();
}

// Eliminar cita
async function confirmarEliminacion() {
    if (!citaAEliminarId) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/citas/${citaAEliminarId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error al eliminar cita');
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmarEliminacionModal'));
        modal.hide();
        
        // Actualizar datos
        await cargarCitas();
        calcularEstadisticas();
        
        // Mostrar confirmación
        mostrarNotificacion('Cita eliminada exitosamente', 'success');
        
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al eliminar la cita', 'error');
    } finally {
        citaAEliminarId = null;
    }
}

// Actualizar citas
async function actualizarCitas() {
    const btnActualizar = document.querySelector('.btn-secondary');
    const originalText = btnActualizar.innerHTML;
    
    btnActualizar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
    btnActualizar.disabled = true;
    
    try {
        await cargarDatos();
        mostrarNotificacion('Datos actualizados exitosamente', 'success');
    } catch (error) {
        mostrarNotificacion('Error al actualizar los datos', 'error');
    } finally {
        btnActualizar.innerHTML = originalText;
        btnActualizar.disabled = false;
    }
}

// Mostrar/ocultar sin resultados
function mostrarSinResultados() {
    document.getElementById('sin-resultados').style.display = 'block';
    document.querySelector('.citas-table-container').style.display = 'none';
}

function ocultarSinResultados() {
    document.getElementById('sin-resultados').style.display = 'none';
    document.querySelector('.citas-table-container').style.display = 'block';
}

// Mostrar notificaciones
function mostrarNotificacion(mensaje, tipo) {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `alert alert-${tipo === 'success' ? 'success' : 'danger'} notification`;
    notificacion.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${mensaje}
    `;
    
    // Agregar estilos
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notificacion);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notificacion);
        }, 300);
    }, 3000);
}

// Mostrar errores
function mostrarError(mensaje) {
    const containers = ['citas-tabla-body', 'citas-tarjetas-container'];
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle"></i>
                        ${mensaje}
                    </div>
                </div>
            `;
        }
    });
}

// Función para redirigir a citas
function verCitasRegistradas() {
    actualizarCitas();
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);