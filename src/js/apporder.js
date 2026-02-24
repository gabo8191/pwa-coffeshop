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
  
  // Event listeners para métodos de pago
  const cashRadio = document.getElementById('cash');
  const cardRadio = document.getElementById('card');
  
  if (cashRadio) {
    cashRadio.addEventListener('change', mostrarCamposPago);
  }
  
  if (cardRadio) {
    cardRadio.addEventListener('change', mostrarCamposPago);
  }
  
  // Event listener para cálculo de cambio
  const cashAmount = document.getElementById('cash-amount');
  if (cashAmount) {
    cashAmount.addEventListener('input', calcularCambio);
  }
  
  // Formateo automático de tarjeta - asegurar que los elementos existan
  const cardNumber = document.getElementById('card-number');
  if (cardNumber) {
    cardNumber.addEventListener('input', formatearNumeroTarjeta);
  }
  
  const cardExpiry = document.getElementById('card-expiry');
  if (cardExpiry) {
    cardExpiry.addEventListener('input', formatearFechaVencimiento);
  }
  
  // CVV solo números (formato más simple)
  const cardCvv = document.getElementById('card-cvv');
  if (cardCvv) {
    cardCvv.addEventListener('input', function(e) {
      // Solo permitir números y limitar a 4 dígitos
      let valor = e.target.value.replace(/[^0-9]/g, '');
      if (valor.length > 4) valor = valor.substring(0, 4);
      e.target.value = valor;
    });
  }
});

// =========================================================
// Funciones para Manejo de Métodos de Pago
// =========================================================
function mostrarCamposPago() {
  const cashFields = document.getElementById('cash-fields');
  const cardFields = document.getElementById('card-fields');
  const cashRadio = document.getElementById('cash');
  const cardRadio = document.getElementById('card');
  
  if (cashRadio && cashRadio.checked) {
    cashFields.style.display = 'block';
    cardFields.style.display = 'none';
    limpiarCamposTarjeta();
  } else if (cardRadio && cardRadio.checked) {
    cashFields.style.display = 'none';
    cardFields.style.display = 'block';
    limpiarCamposEfectivo();
  }
}

function limpiarCamposTarjeta() {
  document.getElementById('card-number').value = '';
  document.getElementById('card-expiry').value = '';
  document.getElementById('card-cvv').value = '';
  document.getElementById('card-holder').value = '';
}

function limpiarCamposEfectivo() {
  document.getElementById('cash-amount').value = '';
  document.getElementById('change-display').style.display = 'none';
}

function calcularCambio() {
  const cashAmount = parseFloat(document.getElementById('cash-amount').value) || 0;
  const precio = parseFloat(document.getElementById('price-value').textContent.replace('$', '')) || 0;
  const changeDisplay = document.getElementById('change-display');
  const changeAmount = document.getElementById('change-amount');
  
  if (cashAmount >= precio && cashAmount > 0) {
    const cambio = cashAmount - precio;
    changeAmount.textContent = '$' + cambio;
    changeDisplay.style.display = 'block';
  } else {
    changeDisplay.style.display = 'none';
  }
}

function formatearNumeroTarjeta(e) {
  try {
    // Permitir entrada libre, solo formatear números
    let valor = e.target.value.replace(/[^0-9]/g, '');
    
    // Limitar a 16 dígitos máximo
    if (valor.length > 16) {
      valor = valor.substring(0, 16);
    }
    
    // Formatear en grupos de 4 solo si hay contenido
    if (valor.length > 0) {
      let parts = [];
      for (let i = 0; i < valor.length; i += 4) {
        parts.push(valor.substring(i, i + 4));
      }
      e.target.value = parts.join(' ');
    }
  } catch (error) {
    // Error silencioso
  }
}

function formatearFechaVencimiento(e) {
  try {
    let valor = e.target.value.replace(/[^0-9]/g, '');
    
    // Limitar a 4 dígitos
    if (valor.length > 4) {
      valor = valor.substring(0, 4);
    }
    
    // Formatear como MM/AA solo si hay suficientes dígitos
    if (valor.length >= 3) {
      valor = valor.substring(0, 2) + '/' + valor.substring(2);
    }
    
    e.target.value = valor;
  } catch (error) {
    // Error silencioso
  }
}

function validarPago() {
  const cashRadio = document.getElementById('cash');
  const cardRadio = document.getElementById('card');
  
  if (!cashRadio.checked && !cardRadio.checked) {
    alert('Por favor seleccione un método de pago.');
    return false;
  }
  
  if (cashRadio.checked) {
    return validarPagoEfectivo();
  } else if (cardRadio.checked) {
    return validarPagoTarjeta();
  }
  
  return false;
}

function validarPagoEfectivo() {
  const cashAmount = parseFloat(document.getElementById('cash-amount').value) || 0;
  const precio = parseFloat(document.getElementById('price-value').textContent.replace('$', '')) || 0;
  
  if (cashAmount <= 0) {
    alert('Por favor ingrese el monto entregado.');
    return false;
  }
  
  if (cashAmount < precio) {
    alert('El monto entregado es insuficiente.');
    return false;
  }
  
  return true;
}

function validarPagoTarjeta() {
  const cardNumber = document.getElementById('card-number').value;
  const cardExpiry = document.getElementById('card-expiry').value;
  const cardCvv = document.getElementById('card-cvv').value;
  const cardHolder = document.getElementById('card-holder').value;
  
  if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
    alert('Por favor ingrese un número de tarjeta válido.');
    return false;
  }
  
  if (!cardExpiry || cardExpiry.length < 5) {
    alert('Por favor ingrese la fecha de vencimiento (MM/AA).');
    return false;
  }
  
  if (!cardCvv || cardCvv.length < 3) {
    alert('Por favor ingrese el CVV.');
    return false;
  }
  
  if (!cardHolder.trim()) {
    alert('Por favor ingrese el nombre del titular.');
    return false;
  }
  
  return true;
}

function procesarPago() {
  const paymentModal = document.getElementById('payment-modal');
  const paymentMessage = document.getElementById('payment-message');
  const paymentResult = document.getElementById('payment-result');
  const paymentSuccess = document.getElementById('payment-success');
  const paymentError = document.getElementById('payment-error');
  const paymentButtons = document.getElementById('payment-buttons');
  const successDetails = document.getElementById('success-details');
  const errorDetails = document.getElementById('error-details');
  
  // Mostrar modal de procesamiento
  paymentModal.style.display = 'block';
  paymentMessage.style.display = 'block';
  paymentResult.style.display = 'none';
  paymentButtons.style.display = 'none';
  
  // Simular procesamiento (2 segundos)
  setTimeout(() => {
    paymentMessage.style.display = 'none';
    paymentResult.style.display = 'block';
    paymentButtons.style.display = 'block';
    
    // Simular éxito/fallo aleatorio (80% éxito)
    const exito = Math.random() > 0.2;
    
    if (exito) {
      paymentSuccess.style.display = 'block';
      paymentError.style.display = 'none';
      
      const cashRadio = document.getElementById('cash');
      if (cashRadio.checked) {
        const cashAmount = document.getElementById('cash-amount').value;
        const precio = document.getElementById('price-value').textContent;
        const cambio = parseFloat(cashAmount) - parseFloat(precio.replace('$', ''));
        successDetails.innerHTML = `
          Pago en efectivo: ${cashAmount}<br>
          Total: ${precio}<br>
          Cambio: $${cambio}
        `;
      } else {
        const cardNumber = document.getElementById('card-number').value;
        const ultimosDigitos = cardNumber.slice(-4);
        successDetails.innerHTML = `
          Tarjeta terminada en: ****${ultimosDigitos}<br>
          Transacción aprobada
        `;
      }
    } else {
      paymentSuccess.style.display = 'none';
      paymentError.style.display = 'block';
      
      const cashRadio = document.getElementById('cash');
      if (cashRadio.checked) {
        errorDetails.textContent = 'Error al procesar el pago en efectivo. Verifique el monto.';
      } else {
        errorDetails.textContent = 'Tarjeta rechazada. Verifique los datos o intente con otra tarjeta.';
      }
    }
  }, 2000);
}

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
const paymentModal = document.getElementById('payment-modal');
const acceptPayment = document.getElementById('accept-payment');
const retryPayment = document.getElementById('retry-payment');

if (orderForm) {
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validarPago()) {
      modal.style.display = 'block';
    }
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
    procesarPago();
  });
}

// Event listeners para el modal de pago
if (acceptPayment) {
  acceptPayment.addEventListener('click', () => {
    const paymentSuccess = document.getElementById('payment-success');
    if (paymentSuccess.style.display === 'block') {
      // Pago exitoso, guardar orden
      const size = document.getElementById('size').value;
      const hasSugar = document.getElementById('sugar').checked;
      const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
      
      const nuevaOrden = {
        id: Date.now(),
        cafe: coffeeName,
        tamaño: size,
        azucar: hasSugar,
        fecha: new Date().toLocaleString(),
        precio: document.getElementById('price-value').textContent,
        metodoPago: paymentMethod
      };
      
      paymentModal.style.display = 'none';
      
      const resultDiv = document.getElementById('order-result');
      const btnSubmit = document.querySelector('.btn-submit');
      
      resultDiv.textContent = 'Guardando tu orden...';
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
    }
  });
}

if (retryPayment) {
  retryPayment.addEventListener('click', () => {
    paymentModal.style.display = 'none';
  });
}
