document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../login/indexLogin.html';
        return;
    }

    const inputMonto = document.getElementById('inputMontoCobro');
    const selectCategoria = document.getElementById('selectCategoria');
    const inputDetalle = document.getElementById('inputDetalleCobro');
    const btnGenerarQR = document.getElementById('btnGenerarQR');
    const txtAliasCobrador = document.getElementById('txtAliasCobrador');

    const pasoMonto = document.getElementById('pasoMonto');
    const pasoQR = document.getElementById('pasoQR');
    const montoFinal = document.getElementById('montoFinal');
    const badgeCategoria = document.getElementById('badgeCategoria');
    const txtDetalleResumen = document.getElementById('txtDetalleResumen');
    const imgQR = document.getElementById('imgQR');
    const btnDescargarQR = document.getElementById('btnDescargarQR');
    const btnNuevoCobro = document.getElementById('btnNuevoCobro');

    let datosCuenta = null;

    // Carga los datos de la cuenta del cobrador
    try {
        const res = await fetch('http://localhost:8080/api/account', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            datosCuenta = await res.json();
            if (txtAliasCobrador) {
                txtAliasCobrador.innerText = datosCuenta.alias || datosCuenta.accountNumber;
            }
        }
    } catch (err) {
        console.error('Error al obtener cuenta:', err);
    }

    // Carga las categorías disponibles desde el backend
    try {
        const resCat = await fetch('http://localhost:8080/api/transaction/payment/categories', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resCat.ok) {
            const dataCat = await resCat.json();
            if (dataCat.data && dataCat.data.length > 0) {
                selectCategoria.innerHTML = '';
                dataCat.data.forEach(cat => {
                    const opt = document.createElement('option');
                    opt.value = cat.key;
                    opt.textContent = cat.displayName;
                    selectCategoria.appendChild(opt);
                });
            }
        }
    } catch (err) {
        console.error('Error al obtener categorías:', err);
    }

    // Habilita el botón solo si el monto es mayor a 0
    inputMonto.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (val > 0) {
            btnGenerarQR.disabled = false;
            btnGenerarQR.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            btnGenerarQR.disabled = true;
            btnGenerarQR.classList.add('opacity-50', 'cursor-not-allowed');
        }
    });

    // Genera el código QR con los datos reales
    btnGenerarQR.addEventListener('click', () => {
        const monto = parseFloat(inputMonto.value);
        if (!monto || monto <= 0) return;

        const categoriaKey = selectCategoria.value;
        const categoriaTexto = selectCategoria.options[selectCategoria.selectedIndex]?.text || categoriaKey;
        const detalle = inputDetalle.value.trim();
        const identificadorCuenta = datosCuenta ? (datosCuenta.alias || datosCuenta.accountNumber) : 'cuenta.alkywall';

        // Formato de payload del QR
        const qrPayload = JSON.stringify({
            destinationAccount: identificadorCuenta,
            amount: monto,
            category: categoriaKey,
            name: detalle || categoriaTexto
        });

        // Genera la imagen del QR
        imgQR.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrPayload)}`;

        // Actualiza el resumen visual
        montoFinal.innerText = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);
        badgeCategoria.innerText = categoriaTexto;
        txtDetalleResumen.innerText = detalle ? `• ${detalle}` : '';

        // Muestra la vista del QR
        pasoMonto.classList.add('hidden');
        pasoQR.classList.remove('hidden');
    });

    // Descarga la imagen del QR
    btnDescargarQR.addEventListener('click', async () => {
        if (!imgQR.src) return;
        try {
            const respuesta = await fetch(imgQR.src);
            const blob = await respuesta.blob();
            const urlDescarga = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = urlDescarga;
            a.download = `qr-cobro-${datosCuenta?.alias || 'alkywall'}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(urlDescarga);
        } catch (error) {
            console.error('Error al descargar:', error);
            window.open(imgQR.src, '_blank');
        }
    });

    // Botón para volver y modificar valores
    btnNuevoCobro.addEventListener('click', () => {
        pasoQR.classList.add('hidden');
        pasoMonto.classList.remove('hidden');
    });
});
