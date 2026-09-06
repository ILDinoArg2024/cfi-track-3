class NewTransferRequest {
    constructor(sourceAccountNumber, destinationAccount, amount, description) {
        this.sourceAccountNumber = sourceAccountNumber;
        this.destinationAccount = destinationAccount;
        this.amount = amount;
        this.description = description;
    }
}
const axiosInstance = typeof axios !== 'undefined' ? axios.create({
    baseURL: "http://localhost:8080/api",
    timeout: 5000,
    headers: {
        "Authorization": "Bearer " + localStorage.getItem("token"),
        "Content-Type": "application/json"
    },
}) : null;
const getUser = async () => {
    if (!axiosInstance) return null;
    try {
        const response = await axiosInstance.get("/user/current");
        console.log(response.data.data)
        return response.data.data;
    }
    catch (error) {
        console.error(error);
        window.location.href = "../dashboard/indexDashboard.html"
        return null;
    }
}
const getUserDataByAliasOrCvu = async (data) => {
    if (!axiosInstance) return null;
    try {
        const response = await axiosInstance.get("/user/identifier/" + data);
        document.getElementById('notFound').innerText = ''
        return response.data.data;
    }
    catch (error) {
        console.error(error);
        if(error.status == 404){
            document.getElementById('notFound').innerText = 'No se encontró un usuario con ese alias/CVU'
        }
        return null;
    }
}
const transferir = async (newTransferRequest) => {
    if (!axiosInstance) return null;
    try {
        const response = await axiosInstance.post("/transaction/transfer",
            newTransferRequest
        );
        return response;
    }
    catch (error) {
        console.error(error);
        return error.response || null;
    }
};

const MENSAJE_ERROR_TRANSFERENCIA_DEFAULT = 'No pudimos enviar el dinero. Verificá tener saldo suficiente e intentá nuevamente.';

// Trae los contactos guardados
const getContactos = async () => {
    if (!axiosInstance) return [];
    try {
        const response = await axiosInstance.get("/contacts");
        return response.data.data || [];
    } catch (error) {
        console.error(error);
        return [];
    }
};

document.addEventListener('DOMContentLoaded', async () => {

    // --- Referencias al DOM ---
    const paso1 = document.getElementById('paso1');
    const paso2 = document.getElementById('paso2');
    const paso3 = document.getElementById('paso3');
    const btnVolver = document.getElementById('btnVolver');


    const inputDestinatario = document.getElementById('inputDestinatario');
    const btnBuscar = document.getElementById('btnBuscar');
    const botonesContactos = document.querySelectorAll('.btn-contacto');


    const avatarDestinatario = document.getElementById('avatarDestinatario');
    const nombreDestinatario = document.getElementById('nombreDestinatario');
    const btnCambiarDestino = document.getElementById('btnCambiarDestino');
    const inputMonto = document.getElementById('inputMonto');
    const btnContinuarMonto = document.getElementById('btnContinuarMonto');


    const resumenMonto = document.getElementById('resumenMonto');
    const resumenNombre = document.getElementById('resumenNombre');
    const resumenAlias = document.getElementById('resumenAlias');
    const contenedorGuardarContacto = document.getElementById('contenedorGuardarContacto');
    const boxInputNombre = document.getElementById('boxInputNombre');
    const nombreAgendado = document.getElementById('nombreAgendado');
    const btnTransferir = document.getElementById('btnTransferir');

    // Guardar
    const toggleGuardar = document.getElementById('toggleGuardar');
    const toggleBolaGuardar = document.getElementById('toggleBolaGuardar');


    let currentStep = 1;
    let destinatarioActual = { firstName: '', alias: '', esNuevo: false };
    let montoActual = 0;
    let guardarContacto = true;

    const paso4 = document.getElementById('paso4');
    const paso5 = document.getElementById('paso5');
    const btnReintentar = document.getElementById('btnReintentar');


    // INICIALIZACIÓN

    const urlParams = new URLSearchParams(window.location.search);
    const paramAlias = urlParams.get('alias');
    const paramNombre = urlParams.get('nombre');

    // NAVEGACIÓN Y TRANSICIONES

    const mostrarPaso = (paso) => {
        paso1.classList.add('hidden');
        paso2.classList.add('hidden');
        paso3.classList.add('hidden');
        if (paso4) paso4.classList.add('hidden');
        if (paso5) paso5.classList.add('hidden');

        paso1.classList.remove('fade-in');
        paso2.classList.remove('fade-in');
        paso3.classList.remove('fade-in');
        if (paso4) paso4.classList.remove('fade-in');
        if (paso5) paso5.classList.remove('fade-in');

        void paso1.offsetWidth;

        if (paso === 1) {
            paso1.classList.remove('hidden');
            paso1.classList.add('fade-in');
            document.getElementById('tituloHeader').innerText = 'Transferir';
        } else if (paso === 2) {
            paso2.classList.remove('hidden');
            paso2.classList.add('fade-in');
            document.getElementById('tituloHeader').innerText = 'Monto';
            if (inputMonto) inputMonto.focus();
        } else if (paso === 3) {
            prepararResumen();
            paso3.classList.remove('hidden');
            paso3.classList.add('fade-in');
            document.getElementById('tituloHeader').innerText = 'Confirmar';
        } else if (paso === 4) {
            if (paso4) {
                paso4.classList.remove('hidden');
                paso4.classList.add('flex', 'fade-in');
            }
        } else if (paso === 5) {
            if (paso5) {
                paso5.classList.remove('hidden');
                paso5.classList.add('flex', 'fade-in');
            }
        }
        currentStep = paso;
    };

    btnVolver.addEventListener('click', () => {
        if (currentStep === 1) {
            document.body.classList.add('opacity-0');
            setTimeout(() => window.history.back(), 100);
        } else if (currentStep === 2) {
            mostrarPaso(1);
        } else if (currentStep === 3) {
            mostrarPaso(2);
        }
    });

    if (btnReintentar) {
        btnReintentar.addEventListener('click', () => {
            mostrarPaso(2); // Volvemos al paso de monto
            btnTransferir.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Transferir`;
        });
    }


    // Habilitar botón si escribe un CBU/Alias (simulación)
    inputDestinatario.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val.length >= 4) {
            btnBuscar.disabled = false;
            btnBuscar.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            btnBuscar.disabled = true;
            btnBuscar.classList.add('opacity-50', 'cursor-not-allowed');
        }
    });

    // Clic en Buscar (Asumimos que es un Alias/CBU NUEVO)
    btnBuscar.addEventListener('click', async () => {
        const busqueda = inputDestinatario.value.trim();
        const usuarioDestino = await getUserDataByAliasOrCvu(busqueda);
        if (!usuarioDestino) return;

        destinatarioActual = usuarioDestino;
        destinatarioActual.esNuevo = true;
        llenarFichaPaso2();
        mostrarPaso(2);
    });

    // Carga los contactos en el paso 1
    const cargarContactosPaso1 = async () => {
        const listaContenedor = document.getElementById('listaContactosTransferir');
        const msgSinContactos = document.getElementById('msgSinContactosTransferir');
        if (!listaContenedor) return;

        const contactos = await getContactos();
        listaContenedor.innerHTML = '';

        if (contactos.length === 0) {
            if (msgSinContactos) msgSinContactos.classList.remove('hidden');
            return;
        }

        if (msgSinContactos) msgSinContactos.classList.add('hidden');

        contactos.forEach(contacto => {
            const nombre = contacto.name || `${contacto.contactFirstName || ''} ${contacto.contactLastName || ''}`.trim();
            const alias = contacto.alias || contacto.accountNumber || '';
            const iniciales = nombre.substring(0, 2).toUpperCase() || 'C';

            const btn = document.createElement('button');
            btn.className = 'btn-contacto flex items-center gap-4 p-3 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 transition shadow-sm text-left w-full';
            btn.innerHTML = `
                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-extrabold text-sm shrink-0">${iniciales}</div>
                <div class="flex flex-col">
                    <span class="text-sm font-bold text-slate-800">${nombre}</span>
                    <span class="text-[10px] font-medium text-slate-500">${alias}</span>
                </div>
            `;

            btn.addEventListener('click', async () => {
                const usuarioDestino = await getUserDataByAliasOrCvu(alias);
                if (usuarioDestino) {
                    destinatarioActual = usuarioDestino;
                    destinatarioActual.esNuevo = false;
                    llenarFichaPaso2();
                    mostrarPaso(2);
                }
            });

            listaContenedor.appendChild(btn);
        });
    };

    cargarContactosPaso1();


    const llenarFichaPaso2 = () => {
        nombreDestinatario.innerText = destinatarioActual.firstName;
        // Tomamos las dos primeras letras para el avatar
        avatarDestinatario.innerText = destinatarioActual.firstName.substring(0, 2).toUpperCase();
    };

    btnCambiarDestino.addEventListener('click', () => {
        mostrarPaso(1);
    });

    // Habilitar botón de monto solo si es > 0
    inputMonto.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (val > 0) {
            btnContinuarMonto.disabled = false;
            btnContinuarMonto.classList.remove('opacity-50', 'cursor-not-allowed');
            montoActual = val;
        } else {
            btnContinuarMonto.disabled = true;
            btnContinuarMonto.classList.add('opacity-50', 'cursor-not-allowed');
        }
    });

    btnContinuarMonto.addEventListener('click', () => {
        mostrarPaso(3);
    });


    const prepararResumen = () => {
        // Formatear monto a moneda argentina
        resumenMonto.innerText = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(montoActual);
        resumenNombre.innerText = destinatarioActual.firstName || '';
        resumenAlias.innerText = destinatarioActual.account ? destinatarioActual.account.alias : (destinatarioActual.alias || '');

        // Si el contacto es nuevo, mostramos la opción de guardarlo. Si ya existía, la ocultamos.
        if (destinatarioActual.esNuevo) {
            contenedorGuardarContacto.classList.remove('hidden');
            contenedorGuardarContacto.classList.add('flex');
            // Limpiar input por si venía de otra búsqueda
            nombreAgendado.value = '';
        } else {
            contenedorGuardarContacto.classList.add('hidden');
            contenedorGuardarContacto.classList.remove('flex');
        }
    };

    // Toggle para Guardar Contacto (Visual y Lógico)
    toggleGuardar.addEventListener('click', () => {
        guardarContacto = !guardarContacto;
        if (guardarContacto) {

            toggleGuardar.classList.replace('bg-slate-300', 'bg-blue-600');
            toggleBolaGuardar.classList.replace('left-[2px]', 'left-[22px]');

            boxInputNombre.classList.remove('opacity-0', 'h-0', 'border-0');
            boxInputNombre.classList.add('opacity-100', 'h-12');
            nombreAgendado.focus();
        } else {

            toggleGuardar.classList.replace('bg-blue-600', 'bg-slate-300');
            toggleBolaGuardar.classList.replace('left-[22px]', 'left-[2px]');

            boxInputNombre.classList.remove('opacity-100', 'h-12');
            boxInputNombre.classList.add('opacity-0', 'h-0', 'border-0');
        }
    });

    btnTransferir.addEventListener('click', async () => {
        // Aquí se enviaría el fetch()/Axios al backend
        console.log("=== ENVIANDO TRANSFERENCIA ===");
        console.log("Destino:", destinatarioActual.account ? destinatarioActual.account.alias : destinatarioActual.alias);
        console.log("Monto:", montoActual);

        if (destinatarioActual.esNuevo && guardarContacto) {
            const nombrePersonalizado = nombreAgendado.value.trim() || destinatarioActual.firstName;
            console.log("Acción extra: Guardar en agenda como ->", nombrePersonalizado);
        } else {
            console.log("¿Guardar en agenda?: No");
        }

        btnTransferir.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Procesando...`;
        // setTimeout(() => {
        const usuarioActual = await getUser();

        if (!usuarioActual || !destinatarioActual || !destinatarioActual.account) {
            console.error("No se pudieron obtener los datos de la cuenta");
            btnTransferir.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Transferir`;
            mostrarPaso(5);
            return;
        }

        const newTransferRequest = new NewTransferRequest(
            usuarioActual.account.accountNumber,
            destinatarioActual.account.accountNumber,
            montoActual,
            "varios"
        );
        let transferencia = await transferir(newTransferRequest);
        if (!transferencia || (transferencia.status != 201 && transferencia.status != 200)) {
            // En caso de error
            mostrarPaso(5);
            const mensajeErrorEl = document.getElementById('mensajeErrorTransferencia');
            if (mensajeErrorEl) {
                mensajeErrorEl.innerText = transferencia?.data?.message || MENSAJE_ERROR_TRANSFERENCIA_DEFAULT;
            }
            const contenedorLottieFail = document.getElementById('lottieFail');
            if (contenedorLottieFail) {
                contenedorLottieFail.innerHTML = '';
                lottie.loadAnimation({
                    container: contenedorLottieFail,
                    renderer: 'svg',
                    loop: false,
                    autoplay: true,
                    path: '../assets/lottie_fail.json'
                });
            }
        } else {
            // Mostrar Paso 4 (Éxito)
            mostrarPaso(4);

            const nombreDestinoFinal = (destinatarioActual.esNuevo && guardarContacto && nombreAgendado.value.trim() !== '') ? nombreAgendado.value.trim() : destinatarioActual.firstName;
            document.getElementById('exitoNombre').innerText = nombreDestinoFinal;

            const contenedorLottie = document.getElementById('lottieSuccess');
            if (contenedorLottie) {
                contenedorLottie.innerHTML = '';
                lottie.loadAnimation({
                    container: contenedorLottie,
                    renderer: 'svg',
                    loop: false,
                    autoplay: true,
                    path: '../assets/lottie_success.json'
                });
            }
        }
        // }, 1500);
    });


    // AUTO-INICIO (Si venimos de Contactos o Dashboard)

    if (paramAlias) {
        const usuarioDestino = await getUserDataByAliasOrCvu(paramAlias);
        if (usuarioDestino) {
            destinatarioActual = usuarioDestino;
            destinatarioActual.esNuevo = false;
            llenarFichaPaso2();
            mostrarPaso(2); // Salta directo al monto
        } else {
            mostrarPaso(1);
        }
    } else {
        // Inicialización normal
        mostrarPaso(1);
    }

});
