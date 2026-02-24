const modal = document.getElementById('confirmation-modal');
const btnConfirm = document.getElementById('confirm-btn');
const btnCancel = document.getElementById('cancel-btn');
let ordenSeleccionadaId = null;

// =========================================================
// Promesa: Obtener órdenes desde localStorage
// =========================================================
const obtenerOrdenes = () => {
  return new Promise((resolve, reject) => {
    const ordenes = JSON.parse(localStorage.getItem('misOrdenesArray')) || [];
    if (ordenes.length > 0) {
      resolve(ordenes);
    } else {
      reject('No hay órdenes registradas.');
    }
  });
};

// =========================================================
// Promesa: Renderizar las órdenes en el DOM
// =========================================================
const renderizarOrdenes = (ordenes) => {
  return new Promise((resolve) => {
    const lista = document.getElementById('orders-list');
    let output = '';
    ordenes.forEach((orden) => {
      output += `
        <div class="price-display" style="margin-bottom:1rem;" id="orden-${orden.id}">
          <strong>${orden.cafe}</strong> — ${orden.tamaño} — ${orden.precio}<br>
          <small>Azúcar: ${orden.azucar ? 'Sí' : 'No'} | ${orden.fecha}</small><br>
          <div class="modal-actions" style="margin-top:0.5rem;">
            <button class="btn-confirm" onclick="abrirModal(${orden.id}, 'confirmar')">Confirmar</button>
            <button class="btn-cancel" onclick="abrirModal(${orden.id}, 'rechazar')">Rechazar</button>
          </div>
        </div>
      `;
    });
    lista.innerHTML = output;
    resolve('Órdenes renderizadas.');
  });
};

// =========================================================
// Promesa: Eliminar orden del localStorage
// =========================================================
const eliminarOrden = (id) => {
  return new Promise((resolve) => {
    let ordenes = JSON.parse(localStorage.getItem('misOrdenesArray')) || [];
    ordenes = ordenes.filter((o) => o.id !== id);
    localStorage.setItem('misOrdenesArray', JSON.stringify(ordenes));
    resolve(ordenes);
  });
};

// =========================================================
// Abrir modal y guardar qué orden se está gestionando
// =========================================================
let accionPendiente = null;

function abrirModal(id, accion) {
  ordenSeleccionadaId = id;
  accionPendiente = accion;
  document.getElementById('confirmation-message').textContent =
    accion === 'confirmar'
      ? '¿Confirmas que esta orden está lista?'
      : '¿Seguro que deseas rechazar esta orden?';
  modal.style.display = 'block';
}

btnCancel.addEventListener('click', () => {
  modal.style.display = 'none';
  ordenSeleccionadaId = null;
});

btnConfirm.addEventListener('click', () => {
  modal.style.display = 'none';
  const id = ordenSeleccionadaId;
  const accion = accionPendiente;

  eliminarOrden(id)
    .then((ordenesRestantes) => {
      console.log(`Orden ${accion === 'confirmar' ? 'confirmada' : 'rechazada'}.`);
      const elemento = document.getElementById(`orden-${id}`);
      if (elemento) {
        elemento.style.background = accion === 'confirmar' ? '#d4edda' : '#f8d7da';
        elemento.innerHTML = accion === 'confirmar'
          ? '<strong>Orden confirmada</strong>'
          : '<strong>Orden rechazada</strong>';
        setTimeout(() => elemento.remove(), 1000);
      }
      if (ordenesRestantes.length === 0) {
        document.getElementById('orders-list').innerHTML =
          '<p style="text-align:center;color:#888;">No quedan órdenes pendientes.</p>';
      }
    });
});

// =========================================================
// Encadenamiento al cargar la página
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('orders-list').innerHTML =
    "<p style='text-align:center;'>Cargando órdenes...</p>";

  obtenerOrdenes()
    .then((ordenes) => {
      console.log('1. Órdenes obtenidas:', ordenes.length);
      return renderizarOrdenes(ordenes);
    })
    .then((msg) => {
      console.log('2.', msg);
    })
    .catch((error) => {
      console.warn(error);
      document.getElementById('orders-list').innerHTML =
        `<p style="text-align:center;color:#888;">${error}</p>`;
    });
});