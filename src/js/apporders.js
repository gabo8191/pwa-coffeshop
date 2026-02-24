const modal = document.getElementById('confirmation-modal');
const btnConfirm = document.getElementById('confirm-btn');
const btnCancel = document.getElementById('cancel-btn');
const editModal = document.getElementById('edit-modal');
const saveEditBtn = document.getElementById('save-edit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
let ordenSeleccionadaId = null;
let ordenSeleccionadaParaEditar = null;

// Precios base y multiplicadores (copiados de apporder.js)
const precios = {
  Latte: 1000,
  Expresso: 800,
  Capuchino: 900,
  Mokachino: 1100,
  Chocolate: 1200,
  'Cafe con leche': 950,
  'Capuchino con chocolate': 1300,
  Tradicional: 700,
  'Capuchino Vienes': 1250,
};

const multiplicadores = {
  Pequeño: 1,
  Mediano: 1.2,
  Grande: 1.5,
};

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
      const metodoPago = orden.metodoPago ? ` | ${orden.metodoPago === 'efectivo' ? 'Efectivo' : 'Tarjeta'}` : '';
      output += `
        <div class="price-display" style="margin-bottom:1rem;" id="orden-${orden.id}">
          <strong>${orden.cafe}</strong> — ${orden.tamaño} — ${orden.precio}<br>
          <small>Azúcar: ${orden.azucar ? 'Sí' : 'No'} | ${orden.fecha}${metodoPago}</small><br>
          <div class="modal-actions" style="margin-top:0.5rem;">
            <button class="btn-confirm" onclick="abrirModal(${orden.id}, 'confirmar')">Confirmar</button>
            <button class="btn-cancel" onclick="abrirModal(${orden.id}, 'rechazar')">Rechazar</button>
            <button class="btn-submit" onclick="abrirModalModificar(${orden.id})" style="background-color: #007bff; margin-left: 0.5rem;">Modificar</button>
          </div>
        </div>
      `;
    });
    lista.innerHTML = output;
    resolve('Órdenes renderizadas.');
  });
};

// =========================================================
// Promesa: Actualizar orden en localStorage
// =========================================================
const actualizarOrden = (id, nuevosDetalles) => {
  return new Promise((resolve) => {
    let ordenes = JSON.parse(localStorage.getItem('misOrdenesArray')) || [];
    const indiceOrden = ordenes.findIndex(o => o.id === id);
    
    if (indiceOrden !== -1) {
      ordenes[indiceOrden] = { ...ordenes[indiceOrden], ...nuevosDetalles };
      localStorage.setItem('misOrdenesArray', JSON.stringify(ordenes));
      resolve(ordenes[indiceOrden]);
    } else {
      resolve(null);
    }
  });
};

// =========================================================
// Función para calcular precio basado en café y tamaño
// =========================================================
function calcularPrecio(nombreCafe, tamaño) {
  const precioBase = precios[nombreCafe] || 1000;
  const multiplicador = multiplicadores[tamaño] || 1;
  return Math.round(precioBase * multiplicador);
}

// =========================================================
// Función para actualizar precio en el modal de edición
// =========================================================
function actualizarPrecioEdicion() {
  if (ordenSeleccionadaParaEditar) {
    const tamaño = document.getElementById('edit-size').value;
    const precioFinal = calcularPrecio(ordenSeleccionadaParaEditar.cafe, tamaño);
    document.getElementById('edit-price-value').textContent = '$' + precioFinal;
  }
}

// =========================================================
// Función para abrir modal de modificación
// =========================================================
function abrirModalModificar(id) {
  const ordenes = JSON.parse(localStorage.getItem('misOrdenesArray')) || [];
  ordenSeleccionadaParaEditar = ordenes.find(o => o.id === id);
  
  if (ordenSeleccionadaParaEditar) {
    // Precargar valores actuales
    document.getElementById('edit-size').value = ordenSeleccionadaParaEditar.tamaño;
    document.getElementById('edit-sugar').checked = ordenSeleccionadaParaEditar.azucar;
    
    // Actualizar precio
    actualizarPrecioEdicion();
    
    // Mostrar modal
    editModal.style.display = 'block';
  }
}

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
// Event listeners para el modal de edición
// =========================================================
if (document.getElementById('edit-size')) {
  document.getElementById('edit-size').addEventListener('change', actualizarPrecioEdicion);
}

if (cancelEditBtn) {
  cancelEditBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
    ordenSeleccionadaParaEditar = null;
  });
}

if (saveEditBtn) {
  saveEditBtn.addEventListener('click', () => {
    if (ordenSeleccionadaParaEditar) {
      const nuevoTamaño = document.getElementById('edit-size').value;
      const nuevaAzucar = document.getElementById('edit-sugar').checked;
      const nuevoPrecio = document.getElementById('edit-price-value').textContent;
      
      // Verificar si realmente hubo cambios
      const huboCambios = 
        nuevoTamaño !== ordenSeleccionadaParaEditar.tamaño ||
        nuevaAzucar !== ordenSeleccionadaParaEditar.azucar;
      
      if (!huboCambios) {
        alert('No se detectaron cambios en la orden.');
        editModal.style.display = 'none';
        ordenSeleccionadaParaEditar = null;
        return;
      }
      
      const nuevosDetalles = {
        tamaño: nuevoTamaño,
        azucar: nuevaAzucar,
        precio: nuevoPrecio,
        fecha: new Date().toLocaleString() + ' (modificada)'
      };
      
      actualizarOrden(ordenSeleccionadaParaEditar.id, nuevosDetalles)
        .then((ordenActualizada) => {
          if (ordenActualizada) {
            // Actualizar la visualización
            const elemento = document.getElementById(`orden-${ordenSeleccionadaParaEditar.id}`);
            if (elemento) {
              const metodoPago = ordenActualizada.metodoPago ? ` | ${ordenActualizada.metodoPago === 'efectivo' ? 'Efectivo' : 'Tarjeta'}` : '';
              elemento.innerHTML = `
                <strong>${ordenActualizada.cafe}</strong> — ${ordenActualizada.tamaño} — ${ordenActualizada.precio}<br>
                <small>Azúcar: ${ordenActualizada.azucar ? 'Sí' : 'No'} | ${ordenActualizada.fecha}${metodoPago}</small><br>
                <div class="modal-actions" style="margin-top:0.5rem;">
                  <button class="btn-confirm" onclick="abrirModal(${ordenActualizada.id}, 'confirmar')">Confirmar</button>
                  <button class="btn-cancel" onclick="abrirModal(${ordenActualizada.id}, 'rechazar')">Rechazar</button>
                  <button class="btn-submit" onclick="abrirModalModificar(${ordenActualizada.id})" style="background-color: #007bff; margin-left: 0.5rem;">Modificar</button>
                </div>
              `;
              
              // Animación de confirmación
              elemento.style.background = '#d1ecf1';
              elemento.style.border = '2px solid #007bff';
              setTimeout(() => {
                elemento.style.background = '#f9f9f9';
                elemento.style.border = 'none';
              }, 2000);
            }
            
            console.log('Orden modificada exitosamente:', ordenActualizada);
            alert('¡Orden modificada exitosamente!');
          }
          
          editModal.style.display = 'none';
          ordenSeleccionadaParaEditar = null;
        });
    }
  });
}

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
  accionPendiente = null;
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
  
  ordenSeleccionadaId = null;
  accionPendiente = null;
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