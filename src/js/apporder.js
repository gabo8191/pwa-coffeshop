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

const urlParams = new URLSearchParams(window.location.search);
const coffeeName = decodeURIComponent(urlParams.get('coffee'));

function actualizarPrecio() {
  const tamaño = document.getElementById('size').value;
  const precioBase = precios[coffeeName];
  const multiplicador = multiplicadores[tamaño];
  const precioFinal = Math.round(precioBase * multiplicador);
  document.getElementById('price-value').textContent = '$' + precioFinal;
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('coffee-title').textContent =
    'Personaliza tu ' + coffeeName;

  actualizarPrecio();

  document.getElementById('size').addEventListener('change', actualizarPrecio);
});

const guardarEnArray = (nuevaOrden) => {
  return new Promise((resolve) => {
    let misOrdenes = JSON.parse(localStorage.getItem('misOrdenesArray'));
    if (misOrdenes === null) {
      misOrdenes = [];
    }

    misOrdenes.push(nuevaOrden);
    localStorage.setItem('misOrdenesArray', JSON.stringify(misOrdenes));

    console.log('Arreglo actualizado:', misOrdenes);
    resolve('Orden guardada exitosamente.');
  });
};

// =========================================================
// Capturar el envío del formulario de la orden
// =========================================================
const orderForm = document.getElementById('order-form');
const modal = document.getElementById('confirmation-modal');
const btnConfirm = document.getElementById('confirm-btn');
const btnCancel = document.getElementById('cancel-btn');

if (orderForm) {
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    modal.style.display = 'block';
  });
}

if (btnCancel) {
  btnCancel.addEventListener('click', () => {
    modal.style.display = 'none';
  });
}

if (btnConfirm) {
  btnConfirm.addEventListener('click', () => {
    modal.style.display = 'none';

    const size = document.getElementById('size').value;
    const hasSugar = document.getElementById('sugar').checked;

    const nuevaOrden = {
      id: Date.now(),
      cafe: coffeeName,
      tamaño: size,
      azucar: hasSugar,
      fecha: new Date().toLocaleString(),
      precio: document.getElementById('price-value').textContent,
    };

    const resultDiv = document.getElementById('order-result');
    const btnSubmit = document.querySelector('.btn-submit');

    resultDiv.textContent = 'Procesando tu orden...';
    resultDiv.className = 'success';
    resultDiv.style.display = 'block';
    btnSubmit.disabled = true;

    guardarEnArray(nuevaOrden)
      .then((mensaje) => {
        resultDiv.textContent = `¡Listo! ${mensaje}`;
        setTimeout(() => {
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'Hacer otro pedido igual';
        }, 1000);
      })
      .catch((error) => {
        console.error(error);
      });
  });
}
