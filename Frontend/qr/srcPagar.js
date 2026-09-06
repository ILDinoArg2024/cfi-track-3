document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../login/indexLogin.html';
        return;
    }

    const visor = document.getElementById('visorScanner');
    const laser = document.getElementById('laser');
    const msgExitoEscaneo = document.getElementById('msgExitoEscaneo');
    const btnCargarGaleria = document.getElementById('btnCargarGaleria');
    const inputSubirQR = document.getElementById('inputSubirQR');

    const modalConfirmarPago = document.getElementById('modalConfirmarPago');
    const modalPagoContent = document.getElementById('modalPagoContent');
    const vistaConfirmacion = document.getElementById('vistaConfirmacion');
    const vistaExito = document.getElementById('vistaExito');

    const txtNombreComercio = document.getElementById('txtNombreComercio');
    const badgeCategoriaPago = document.getElementById('badgeCategoriaPago');
    const txtDestinoPago = document.getElementById('txtDestinoPago');
    const txtMontoPagar = document.getElementById('txtMontoPagar');
    const txtSaldoDisponible = document.getElementById('txtSaldoDisponible');
    const boxErrorPago = document.getElementById('boxErrorPago');

    const btnConfirmarPago = document.getElementById('btnConfirmarPago');
    const btnCancelarPago = document.getElementById('btnCancelarPago');

    const txtComprobanteMonto = document.getElementById('txtComprobanteMonto');
    const txtComprobanteDestino = document.getElementById('txtComprobanteDestino');
    const txtComprobanteRubro = document.getElementById('txtComprobanteRubro');

    let datosCuentaPagador = null;
    let datosPagoActual = null;

    // Obtiene la cuenta y saldo del pagador
    try {
        const res = await fetch('http://localhost:8080/api/account', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            datosCuentaPagador = await res.json();
            if (txtSaldoDisponible) {
                txtSaldoDisponible.innerText = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(datosCuentaPagador.balance || 0);
            }
        }
    } catch (err) {
        console.error('Error al obtener cuenta pagador:', err);
    }

    // Abre el modal de confirmación con los datos del QR
    function abrirModalPago(payload) {
        datosPagoActual = payload;

        // Detiene la animación del láser
        if (laser) laser.style.display = 'none';
        if (visor) visor.classList.add('scan-success');
        if (msgExitoEscaneo) {
            msgExitoEscaneo.classList.remove('hidden');
            setTimeout(() => msgExitoEscaneo.classList.remove('opacity-0'), 50);
        }

        // Carga los datos del pago en la vista
        txtNombreComercio.innerText = payload.name || 'Cobro QR';
        badgeCategoriaPago.innerText = payload.category || 'Otros';
        txtDestinoPago.innerText = payload.destinationAccount;
        txtMontoPagar.innerText = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(payload.amount);
        
        boxErrorPago.classList.add('hidden');
        boxErrorPago.innerText = '';

        vistaConfirmacion.classList.remove('hidden');
        vistaExito.classList.add('hidden');

        // Muestra el modal con animación
        modalConfirmarPago.classList.remove('hidden');
        setTimeout(() => {
            modalConfirmarPago.classList.remove('opacity-0');
            modalPagoContent.classList.remove('translate-y-full');
        }, 300);
    }

    // Cierra el modal y reanuda el escaneo
    function cerrarModalPago() {
        modalConfirmarPago.classList.add('opacity-0');
        modalPagoContent.classList.add('translate-y-full');
        setTimeout(() => {
            modalConfirmarPago.classList.add('hidden');
            if (laser) laser.style.display = 'block';
            if (visor) visor.classList.remove('scan-success');
            if (msgExitoEscaneo) msgExitoEscaneo.classList.add('hidden', 'opacity-0');
            inputSubirQR.value = '';
        }, 300);
    }

    btnCancelarPago.addEventListener('click', cerrarModalPago);

    // Cargar imagen de QR desde la galería
    btnCargarGaleria.addEventListener('click', () => {
        inputSubirQR.click();
    });

    // Procesa y decodifica la imagen subida con jsQR
    inputSubirQR.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                // Decodifica el QR
                if (typeof jsQR !== 'undefined') {
                    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
                    if (qrCode && qrCode.data) {
                        try {
                            const parsed = JSON.parse(qrCode.data);
                            abrirModalPago(parsed);
                        } catch (err) {
                            console.warn('Formato no JSON:', qrCode.data);
                            alert('El código QR leído no contiene un formato de pago válido.');
                        }
                    } else {
                        alert('No se pudo detectar un código QR en la imagen. Intenta con otra.');
                    }
                } else {
                    console.error('Librería jsQR no cargada');
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Procesa el pago al hacer clic en Confirmar
    btnConfirmarPago.addEventListener('click', async () => {
        if (!datosPagoActual || !datosCuentaPagador) return;

        btnConfirmarPago.disabled = true;
        btnConfirmarPago.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i><span>Procesando...</span>`;
        boxErrorPago.classList.add('hidden');

        const requestBody = {
            sourceAccountNumber: datosCuentaPagador.accountNumber,
            destinationAccount: datosPagoActual.destinationAccount,
            amount: datosPagoActual.amount,
            category: datosPagoActual.category || 'OTROS',
            name: datosPagoActual.name || 'Pago QR'
        };

        try {
            const res = await fetch('http://localhost:8080/api/transaction/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Actualiza comprobante de éxito
                txtComprobanteMonto.innerText = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(datosPagoActual.amount);
                txtComprobanteDestino.innerText = datosPagoActual.name || datosPagoActual.destinationAccount;
                txtComprobanteRubro.innerText = datosPagoActual.category || 'Varios';

                vistaConfirmacion.classList.add('hidden');
                vistaExito.classList.remove('hidden');
            } else {
                boxErrorPago.innerText = data.message || 'Error al procesar el pago. Verifica tu saldo.';
                boxErrorPago.classList.remove('hidden');
            }
        } catch (err) {
            console.error('Error al pagar:', err);
            boxErrorPago.innerText = 'Error de conexión con el servidor.';
            boxErrorPago.classList.remove('hidden');
        } finally {
            btnConfirmarPago.disabled = false;
            btnConfirmarPago.innerHTML = `<span>Confirmar y Pagar</span>`;
        }
    });
});
