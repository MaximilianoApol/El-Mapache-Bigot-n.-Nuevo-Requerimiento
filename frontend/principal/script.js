// API Base URL - Cambia esto por tu URL real
const API_BASE_URL = 'http://localhost:8080/api';

// Navbar scroll effect
window.addEventListener('scroll', function() {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offsetTop = target.offsetTop - 80;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  });
});

// Cargar barberos
async function cargarBarberos() {
  try {
    const response = await fetch(`${API_BASE_URL}/barberos`);
    if (!response.ok) throw new Error('Error al cargar barberos');
    const barberos = await response.json();
    mostrarBarberos(barberos);
  } catch (error) {
    console.error('Error:', error);
    const container = document.getElementById('barberos-container');
    if (container) {
      container.innerHTML = "<p>Error al cargar barberos</p>";
    }
  }
}

function mostrarBarberos(barberos) {
  const container = document.getElementById('barberos-container');
  if (!container) return;
  
  if (barberos.length === 0) {
    container.innerHTML = "<p>No hay barberos registrados</p>";
    return;
  }

  container.innerHTML = barberos.map(barbero => `
    <div class="col-lg-4 col-md-6">
      <div class="barbero-card">
        <div class="barbero-img" style="background-image: url('http://localhost:8080/${barbero.fotoUrl || ''}');">
          <div class="barbero-overlay">
            <h3 class="barbero-name">${barbero.nombre}</h3>
          </div>
        </div>
        <div class="barbero-info">
          <p class="barbero-specialty">Especialista en cortes clásicos y modernos</p>
        </div>
      </div>
    </div>
  `).join('');
}

async function cargarServicios() {
  try {
    const response = await fetch(`${API_BASE_URL}/servicios`);
    if (!response.ok) throw new Error('Error al cargar servicios');
    const servicios = await response.json();
    mostrarServicios(servicios);
  } catch (error) {
    console.error('Error:', error);
    const container = document.getElementById('servicios-container');
    if (container) {
      container.innerHTML = "<p>Error al cargar servicios</p>";
    }
  }
}

function mostrarServicios(servicios) {
  const container = document.getElementById('servicios-container');
  if (!container) return;
  
  if (servicios.length === 0) {
    container.innerHTML = "<p>No hay servicios registrados</p>";
    return;
  }

  container.innerHTML = servicios.map(servicio => `
    <div class="col-lg-4 col-md-6">
      <div class="servicio-card">
        <div class="servicio-img" style="background-image: url('http://localhost:8080/${servicio.imagenUrl || ''}');"></div>
        <div class="servicio-content">
          <h3 class="servicio-title">${servicio.descripcion}</h3>
          <p class="servicio-precio">$ ${servicio.costo}</p>
          <button class="btn btn-reservar" onclick="reservarCita(${servicio.id})">
            <i class="fas fa-calendar-plus"></i> Reservar Cita
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Función reservar cita - MODIFICADA para redirigir a la página de reservas
function reservarCita(servicioId) {
  // Verificar si el archivo existe antes de redirigir
  const url = `reservar-cita.html?servicio=${servicioId}`;
  
  // Usar ruta absoluta si hay problemas
  window.location.href = url;
  
  // Alternativa en caso de problemas de ruta:
  // window.location.href = `./reservar-cita.html?servicio=${servicioId}`;
}

// Función para ver citas registradas - NUEVA
function verCitasRegistradas() {
  window.location.href = 'citas-registradas.html';
}

// Función iniciar sesión (mantenida por compatibilidad)
function iniciarSesion() {
  alert('Funcionalidad de inicio de sesión - Próximamente disponible');
}

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', function() {
  // Verificar si estamos en la página principal
  if (document.getElementById('barberos-container') && document.getElementById('servicios-container')) {
    cargarBarberos();
    cargarServicios();
  }
});