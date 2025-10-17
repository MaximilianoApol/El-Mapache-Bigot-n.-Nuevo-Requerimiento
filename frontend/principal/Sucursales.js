// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// Variables globales
let todasLasSucursales = [];
let sucursalAEliminarId = null;
let modoEdicion = false;
let sucursalEditandoId = null;

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    cargarSucursales();
    configurarFormulario();
});

// Cargar todas las sucursales
async function cargarSucursales() {
    try {
        const response = await fetch(`${API_BASE_URL}/sucursales`);
        if (!response.ok) throw new Error('Error al cargar sucursales');
        
        todasLasSucursales = await response.json();
        mostrarSucursales();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al cargar las sucursales');
    }
}

// Mostrar sucursales en la tabla
function mostrarSucursales() {
    const tbody = document.getElementById('sucursales-tabla-body');
    
    if (todasLasSucursales.length === 0) {
        mostrarSinResultados();
        return;
    }
    
    ocultarSinResultados();
    
    tbody.innerHTML = todasLasSucursales.map(sucursal => `
        <tr>
            <td><strong>#${sucursal.id}</strong></td>
            <td>${sucursal.direccion}</td>
            <td>
                <button class="btn btn-action btn-warning" onclick="editarSucursal(${sucursal.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-action btn-danger" onclick="confirmarEliminarSucursal(${sucursal.id})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Configurar eventos del formulario
function configurarFormulario() {
    const form = document.getElementById('sucursalForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validarFormulario()) {
            return;
        }
        
        if (modoEdicion) {
            await actualizarSucursal();
        } else {
            await crearSucursal();
        }
    });
    
    // Reset modal cuando se cierra
    const modal = document.getElementById('nuevaSucursalModal');
    modal.addEventListener('hidden.bs.modal', function() {
        resetFormulario();
    });
}

// Validar formulario
function validarFormulario() {
    const direccion = document.getElementById('direccion').value.trim();
    const direccionInput = document.getElementById('direccion');
    
    if (direccion.length < 5) {
        direccionInput.classList.add('error');
        mostrarNotificacion('La dirección debe tener al menos 5 caracteres', 'error');
        return false;
    }
    
    direccionInput.classList.remove('error');
    return true;
}

// Crear nueva sucursal
async function crearSucursal() {
    const btnGuardar = document.getElementById('btnGuardar');
    const originalText = btnGuardar.innerHTML;
    
    try {
        btnGuardar.disabled = true;
        btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        
        const sucursalData = {
            direccion: document.getElementById('direccion').value.trim()
        };
        
        const response = await fetch(`${API_BASE_URL}/sucursales`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sucursalData)
        });
        
        if (!response.ok) {
            if (response.status === 400) {
                throw new Error('Datos inválidos. Verifique que la dirección tenga al menos 5 caracteres.');
            }
            throw new Error('Error al crear sucursal');
        }
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('nuevaSucursalModal'));
        modal.hide();
        
        // Recargar sucursales
        await cargarSucursales();
        
        mostrarNotificacion('Sucursal creada exitosamente', 'success');
        
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion(error.message || 'Error al crear la sucursal', 'error');
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = originalText;
    }
}

// Editar sucursal
function editarSucursal(sucursalId) {
    const sucursal = todasLasSucursales.find(s => s.id === sucursalId);
    if (!sucursal) return;
    
    // Cambiar a modo edición
    modoEdicion = true;
    sucursalEditandoId = sucursalId;
    
    // Llenar formulario
    document.getElementById('direccion').value = sucursal.direccion;
    
    // Cambiar título del modal
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Editar Sucursal';
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('nuevaSucursalModal'));
    modal.show();
}

// Actualizar sucursal
async function actualizarSucursal() {
    const btnGuardar = document.getElementById('btnGuardar');
    const originalText = btnGuardar.innerHTML;
    
    try {
        btnGuardar.disabled = true;
        btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
        
        const sucursalData = {
            direccion: document.getElementById('direccion').value.trim()
        };
        
        const response = await fetch(`${API_BASE_URL}/sucursales/${sucursalEditandoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sucursalData)
        });
        
        if (!response.ok) {
            if (response.status === 400) {
                throw new Error('Datos inválidos. Verifique que la dirección tenga al menos 5 caracteres.');
            } else if (response.status === 404) {
                throw new Error('Sucursal no encontrada');
            }
            throw new Error('Error al actualizar sucursal');
        }
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('nuevaSucursalModal'));
        modal.hide();
        
        // Recargar sucursales
        await cargarSucursales();
        
        mostrarNotificacion('Sucursal actualizada exitosamente', 'success');
        
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion(error.message || 'Error al actualizar la sucursal', 'error');
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = originalText;
    }
}

// Confirmar eliminación
function confirmarEliminarSucursal(sucursalId) {
    const sucursal = todasLasSucursales.find(s => s.id === sucursalId);
    if (!sucursal) return;
    
    sucursalAEliminarId = sucursalId;
    
    document.getElementById('sucursalAEliminar').innerHTML = `
        <div class="alert alert-info">
            <strong>ID:</strong> #${sucursal.id}<br>
            <strong>Dirección:</strong> ${sucursal.direccion}
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('confirmarEliminacionModal'));
    modal.show();
}

// Eliminar sucursal
async function confirmarEliminacion() {
    if (!sucursalAEliminarId) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/sucursales/${sucursalAEliminarId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Sucursal no encontrada');
            } else if (response.status === 409 || response.status === 500) {
                throw new Error('No se puede eliminar esta sucursal porque tiene citas asociadas');
            }
            throw new Error('Error al eliminar sucursal');
        }
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmarEliminacionModal'));
        modal.hide();
        
        // Recargar sucursales
        await cargarSucursales();
        
        mostrarNotificacion('Sucursal eliminada exitosamente', 'success');
        
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion(error.message || 'Error al eliminar la sucursal', 'error');
    } finally {
        sucursalAEliminarId = null;
    }
}

// Actualizar sucursales (botón refresh)
async function actualizarSucursales() {
    const btnActualizar = document.querySelector('.btn-secondary');
    const originalText = btnActualizar.innerHTML;
    
    btnActualizar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
    btnActualizar.disabled = true;
    
    try {
        await cargarSucursales();
        mostrarNotificacion('Datos actualizados exitosamente', 'success');
    } catch (error) {
        mostrarNotificacion('Error al actualizar los datos', 'error');
    } finally {
        btnActualizar.innerHTML = originalText;
        btnActualizar.disabled = false;
    }
}

// Reset formulario
function resetFormulario() {
    document.getElementById('sucursalForm').reset();
    document.getElementById('direccion').classList.remove('error');
    modoEdicion = false;
    sucursalEditandoId = null;
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Nueva Sucursal';
}

// Mostrar/ocultar sin resultados
function mostrarSinResultados() {
    document.getElementById('sin-resultados').style.display = 'block';
    document.querySelector('.sucursales-table-container').style.display = 'none';
}

function ocultarSinResultados() {
    document.getElementById('sin-resultados').style.display = 'none';
    document.querySelector('.sucursales-table-container').style.display = 'block';
}

// Mostrar notificaciones
function mostrarNotificacion(mensaje, tipo) {
    const notificacion = document.createElement('div');
    notificacion.className = `alert alert-${tipo === 'success' ? 'success' : 'danger'} notification`;
    notificacion.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${mensaje}
    `;
    
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
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notificacion);
        }, 300);
    }, 3000);
}

// Mostrar errores
function mostrarError(mensaje) {
    const tbody = document.getElementById('sucursales-tabla-body');
    tbody.innerHTML = `
        <tr>
            <td colspan="3" class="text-center">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    ${mensaje}
                </div>
            </td>
        </tr>
    `;
}

// Función para redirigir a citas (desde navbar)
function verCitasRegistradas() {
    window.location.href = 'citas-registradas.html';
}