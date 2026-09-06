// ==========================================
// INTEGRACI�N CON BACKEND (Desde develop)
// ==========================================
// Se activa al cargar la pogina
addEventListener("DOMContentLoaded", (event) => onInit(event));

// Clase que almacenaro los datos de la cuenta
class AccountData {
    constructor(balance, accountNumber, currency, alias, isActive){
        this.balance = balance;
        this.accountNumber = accountNumber;
        this.currency = currency;
        this.alias = alias;
        this.isActive = isActive;
    }
}

class DepositResponse {
    constructor(amount, type, category_name, description, createdAt){
        this.amount = amount,
        this.type = type,
        this.category_name = category_name,
        this.description = description,
        this.createdAt = createdAt
    }
}

// Funcin asncrona que se ejcuta al cargar la pogina se encarga de comprobar
// si hay o no un token y en caso de no haberlo o ser involido redirige a login
async function onInit(event) {
    const token = localStorage.getItem("token");
    if (token != null) {
        let accountData = await getAccount();
        if (accountData) {
            mostrarInfo(accountData);
        }
    } else {
        // window.location.href = "../login/indexLogin.html"; // Comentado temporalmente si se quiere ver el mockup
    }
}

// Instancia para poder realizar peticiones HTTP
const axiosInstance = typeof axios !== 'undefined' ? axios.create({
    baseURL: "http://localhost:8080/api",
    timeout: 5000,
    headers: {
        "Authorization": "Bearer " + localStorage.getItem("token"),
        "Content-Type": "application/json"
    },
}) : null;

const getAccount = async () => {
    if (!axiosInstance) return null;
    try {
        const response = await axiosInstance.get("/account");
        return response.data;
    }
    catch (error) {
        // window.location.href= "../login/indexLogin.html";
        console.error(error);
        return null;
    }
}

const depositar = async (amount) => {
    if (!axiosInstance) return null;
    try {
        const response = await axiosInstance.post("/transaction/deposit",
            null,
            {
                params: { amount: amount }
            }
        );
        return response.data;
    }
    catch (error) {
        // window.location.href= "../login/indexLogin.html";
        console.error(error);
        console.log("Error: " + error.response.data)
        return null;
    }
}

function mostrarInfo(accountData){
    const balanceEl = document.getElementById('saldoTotal');
    if (balanceEl) {
        balanceEl.textContent = "$ " + parseFloat(accountData.balance).toFixed(2);
    }
    
    // Si tuvieramos un H1 'welcome', podramos inyectarlo aquí
    const welcome = document.getElementById('welcome');
    if (welcome) welcome.textContent = "Hola de nuevo";
}

function mostrarMensaje(texto, elemento) {
    elemento.textContent = texto;
    elemento.style.display = "block"
}
function ocultarMensaje(elemento) {
    elemento.textContent = '';
    elemento.style.display = "none";
}

// ==========================================
// L�GICA DE UI (NUESTRA)
// ==========================================
/**
 * Hola, hola! acá hay un ejemplo de cómo generar los componentes dinámicamente
 * cuando leas los datos desde el Backend
 *
 * Actualmente los datos están hardcodeados
 * para que podamos ver y ajustar el diseño.
 * Cuando conectes los datos reales, los borramos
 *
 * CONTACTOS RECIENTES
 * ---------------------------------------------------------------------------
 * function cargarContactosRecientes(contactosBD) {
 *     const contenedor = document.getElementById('listaContactos');
 *     
 *     contactosBD.forEach(contacto => {
 *         const tarjetaHTML = `
 *             <button class="min-w-[76px] h-[92px] rounded-[20px] bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition">
 *                 <div class="w-[38px] h-[38px] rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shadow-inner">
 *                     ${contacto.iniciales}
 *                 </div>
 *                 <span class="text-[10px] text-slate-600 font-semibold">${contacto.nombre}</span>
 *             </button>
 *         `;
 *         contenedor.innerHTML += tarjetaHTML;
 *     });
 * }
 */

/**
 * ----------------------------------------------------------------------------
 * HISTORIAL DE MOVIMIENTOS
 * ----------------------------------------------------------------------
 * function cargarMovimientos(movimientosBD) {
 *     const contenedor = document.getElementById('listaMovimientos');
 *     
 *     movimientosBD.forEach(mov => {
 *         // Pequeña lógica para diferenciar ingresos de egresos
 *         const esIngreso = mov.monto > 0;
 *         const colorMonto = esIngreso ? 'text-blue-600' : 'text-slate-800';
 *         const signo = esIngreso ? '+' : '-';
 *         const montoFormateado = Math.abs(mov.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 });
 *         
 *         const movimientoHTML = `
 *             <div class="p-4 rounded-[20px] bg-white border border-slate-200 shadow-sm flex items-center justify-between hover:bg-slate-50 transition cursor-pointer">
 *                 <div class="flex items-center gap-3">
 *                     <!-- En un caso real, los colores e íconos dependerán de la categoría del movimiento -->
 *                     <div class="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-500 bg-slate-50">
 *                         <i class="${mov.iconoClase} text-sm"></i>
 *                     </div>
 *                     <div>
 *                         <p class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
 *                             ${mov.titulo} <span class="w-1 h-1 bg-slate-400 rounded-full"></span>
 *                         </p>
 *                         <p class="text-[10px] text-slate-500 mt-0.5">${mov.descripcion}</p>
 *                     </div>
 *                 </div>
 *                 <span class="text-xs font-bold ${colorMonto} tracking-wide">${signo} $ ${montoFormateado}</span>
 *             </div>
 *         `;
 *         
 *         contenedor.innerHTML += movimientoHTML;
 *     });
 * }
 */

document.addEventListener('DOMContentLoaded', () => {
    

    // LÓGICA DEL MODAL NUEVA CUENTA

    const btnNuevaCuenta = document.getElementById('btnNuevaCuentaDashboard');
    const modalNuevaCuenta = document.getElementById('modalNuevaCuenta');
    const btnCerrarModalCuenta = document.getElementById('btnCerrarModalCuenta');
    const modalNuevaCuentaContent = document.getElementById('modalNuevaCuentaContent');
    const btnGuardarModalCuenta = document.getElementById('btnGuardarModalCuenta');

    if (btnNuevaCuenta && modalNuevaCuenta) {
        
        // Abrir Modal
        btnNuevaCuenta.addEventListener('click', (e) => {
            e.preventDefault();
            modalNuevaCuenta.classList.remove('hidden');
            setTimeout(() => {
                modalNuevaCuenta.classList.remove('opacity-0');
                modalNuevaCuentaContent.classList.remove('translate-y-full');
            }, 10);
        });

        // Cerrar Modal
        const cerrarModal = () => {
            modalNuevaCuenta.classList.add('opacity-0');
            modalNuevaCuentaContent.classList.add('translate-y-full');
            setTimeout(() => {
                modalNuevaCuenta.classList.add('hidden');
            }, 300); // Esperar que termine la transición de CSS
        };

        // Cerrar al tocar la cruz
        btnCerrarModalCuenta.addEventListener('click', cerrarModal);

        // Cerrar al tocar el fondo oscuro
        modalNuevaCuenta.addEventListener('click', (e) => {
            if (e.target === modalNuevaCuenta) {
                cerrarModal();
            }
        });

        // Lógica de Guardar Contacto
        btnGuardarModalCuenta.addEventListener('click', () => {
            const alias = document.getElementById('inputModalCbu').value;
            const nombre = document.getElementById('inputModalNombre').value;

            console.log("=== NUEVO CONTACTO AGENDADO DESDE DASHBOARD ===");
            console.log("Alias:", alias);
            console.log("Nombre:", nombre);

            btnGuardarModalCuenta.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando...`;
            
            // Simular petición al backend
            setTimeout(() => {
                btnGuardarModalCuenta.innerHTML = `Guardar Contacto`;
                cerrarModal();
                // Limpiar inputs
                document.getElementById('inputModalCbu').value = '';
                document.getElementById('inputModalNombre').value = '';
            }, 1000);
        });
    }



    // Mapa de colores e iconos por categoría
    const ESTILOS_CATEGORIAS = {
        'SUPERMERCADO': { colorClass: 'bg-indigo-500', icon: 'fa-cart-shopping', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-500' },
        'COMIDA': { colorClass: 'bg-orange-500', icon: 'fa-burger', iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
        'TRANSPORTE': { colorClass: 'bg-sky-500', icon: 'fa-car', iconBg: 'bg-sky-50', iconColor: 'text-sky-500' },
        'SERVICIOS': { colorClass: 'bg-emerald-500', icon: 'fa-bolt', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
        'ENTRETENIMIENTO': { colorClass: 'bg-pink-500', icon: 'fa-ticket', iconBg: 'bg-pink-50', iconColor: 'text-pink-500' },
        'FARMACIA_SALUD': { colorClass: 'bg-rose-500', icon: 'fa-heart-pulse', iconBg: 'bg-rose-50', iconColor: 'text-rose-500' },
        'INDUMENTARIA': { colorClass: 'bg-purple-500', icon: 'fa-shirt', iconBg: 'bg-purple-50', iconColor: 'text-purple-500' },
        'OTROS': { colorClass: 'bg-slate-500', icon: 'fa-box-archive', iconBg: 'bg-slate-50', iconColor: 'text-slate-500' }
    };

    // Renderiza el análisis de gastos con los datos reales del usuario
    const renderizarAnalisisGastos = async () => {
        const contenedorBarras = document.getElementById('contenedorBarrasGastos');
        const barraSegmentadaGastos = document.getElementById('barraSegmentadaGastos');
        const textoTotalGastos = document.getElementById('textoTotalGastos');
        const tarjetaAnalisisGastos = document.getElementById('tarjetaAnalisisGastos');
        const iconoAcordeonGastos = document.getElementById('iconoAcordeonGastos');

        if (!contenedorBarras || !barraSegmentadaGastos) return;

        let listaGastos = [];
        const token = localStorage.getItem('token');

        if (token) {
            try {
                const res = await fetch('http://localhost:8080/api/transaction/payment/expenses/month', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data) {
                        listaGastos = data.data;
                    }
                }
            } catch (err) {
                console.error('Error al cargar gastos del mes:', err);
            }
        }

        // Si aún no hay gastos reales registrados en el mes
        if (listaGastos.length === 0) {
            tarjetaAnalisisGastos.classList.remove('cursor-pointer');
            tarjetaAnalisisGastos.onclick = null;
            tarjetaAnalisisGastos.innerHTML = `
                <div class="w-full p-4 flex items-center gap-3.5">
                    <div class="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-sm shrink-0">
                        <i class="fa-solid fa-chart-pie"></i>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-xs font-bold text-slate-800">Sin gastos registrados este mes</span>
                        <span class="text-[11px] font-medium text-slate-400">Tus pagos aparecerán categorizados aquí.</span>
                    </div>
                </div>
            `;
            return;
        }

        const totalGastos = listaGastos.reduce((acc, item) => acc + parseFloat(item.amount), 0);
        textoTotalGastos.innerText = `Total: $ ${totalGastos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

        contenedorBarras.innerHTML = '';
        barraSegmentadaGastos.innerHTML = '';

        listaGastos.forEach((item) => {
            const estilo = ESTILOS_CATEGORIAS[item.category] || ESTILOS_CATEGORIAS['OTROS'];
            const porcentaje = item.percentage;
            const montoFormateado = parseFloat(item.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 });

            // Inyecta el segmento en la barra principal
            const segmentoHTML = `<div class="h-full ${estilo.colorClass} transition-all duration-1000 ease-out" style="width: 0%;" data-target-width="${porcentaje}%"></div>`;
            barraSegmentadaGastos.insertAdjacentHTML('beforeend', segmentoHTML);

            // Inyecta la barra individual detallada
            const barraIndividualHTML = `
                <div class="flex flex-col gap-2 group">
                    <div class="flex justify-between items-end">
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 rounded-full ${estilo.iconBg} ${estilo.iconColor} flex items-center justify-center text-[10px]">
                                <i class="fa-solid ${estilo.icon}"></i>
                            </div>
                            <span class="text-xs font-bold text-slate-700">${item.displayName}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] font-bold text-slate-400">$ ${montoFormateado}</span>
                            <span class="text-xs font-extrabold text-slate-800">${porcentaje}%</span>
                        </div>
                    </div>
                    <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full ${estilo.colorClass} rounded-full transition-all duration-1000 ease-out" style="width: 0%;" data-target-width="${porcentaje}%"></div>
                    </div>
                </div>
            `;
            contenedorBarras.insertAdjacentHTML('beforeend', barraIndividualHTML);
        });

        // Anima las barras
        setTimeout(() => {
            document.querySelectorAll('#seccionAnalisisGastos [data-target-width]').forEach(barra => {
                barra.style.width = barra.getAttribute('data-target-width');
            });
        }, 100);

        // Control del acordeón
        let expandido = false;
        contenedorBarras.onclick = (e) => e.stopPropagation();

        tarjetaAnalisisGastos.onclick = () => {
            expandido = !expandido;
            if (expandido) {
                iconoAcordeonGastos.classList.add('rotate-180');
                contenedorBarras.classList.remove('max-h-0', 'opacity-0', 'mt-0', 'overflow-hidden');
                contenedorBarras.classList.add('max-h-[200px]', 'opacity-100', 'mt-4', 'overflow-y-auto');
                barraSegmentadaGastos.classList.add('hidden');
            } else {
                iconoAcordeonGastos.classList.remove('rotate-180');
                contenedorBarras.classList.add('max-h-0', 'opacity-0', 'mt-0', 'overflow-hidden');
                contenedorBarras.classList.remove('max-h-[200px]', 'opacity-100', 'mt-4', 'overflow-y-auto');
                setTimeout(() => barraSegmentadaGastos.classList.remove('hidden'), 300);
            }
        };
    };

    renderizarAnalisisGastos();


    // CARGAR SALDO (Depósito)

    const btnAbrirDeposito = document.getElementById('btnAbrirDeposito');
    const modalCargarSaldo = document.getElementById('modalCargarSaldo');
    const modalCargarSaldoContent = document.getElementById('modalCargarSaldoContent');
    const btnCerrarModalSaldo = document.getElementById('btnCerrarModalSaldo');
    const inputMontoDeposito = document.getElementById('inputMontoDeposito');
    const btnConfirmarDeposito = document.getElementById('btnConfirmarDeposito');
    const pantallaExitoDeposito = document.getElementById('pantallaExitoDeposito');
    const btnVolverExitoDeposito = document.getElementById('btnVolverExitoDeposito');
    const lottieExitoDeposito = document.getElementById('lottieExitoDeposito');
    const saldoTotalElement = document.getElementById('saldoTotal');

    if (btnAbrirDeposito && modalCargarSaldo) {
        const cerrarModalSaldo = () => {
            modalCargarSaldo.classList.add('opacity-0');
            modalCargarSaldoContent.classList.add('translate-y-full');
            setTimeout(() => {
                modalCargarSaldo.classList.add('hidden');
                inputMontoDeposito.value = '';
                btnConfirmarDeposito.disabled = true;
                btnConfirmarDeposito.classList.add('opacity-50', 'cursor-not-allowed');
            }, 300);
        };

        btnAbrirDeposito.addEventListener('click', () => {
            modalCargarSaldo.classList.remove('hidden');
            setTimeout(() => {
                modalCargarSaldo.classList.remove('opacity-0');
                modalCargarSaldoContent.classList.remove('translate-y-full');
                inputMontoDeposito.focus();
            }, 10);
        });

        btnCerrarModalSaldo.addEventListener('click', cerrarModalSaldo);
        modalCargarSaldo.addEventListener('click', (e) => {
            if (e.target === modalCargarSaldo) cerrarModalSaldo();
        });

        // Validar input para habilitar botón
        inputMontoDeposito.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (val > 0) {
                btnConfirmarDeposito.disabled = false;
                btnConfirmarDeposito.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                btnConfirmarDeposito.disabled = true;
                btnConfirmarDeposito.classList.add('opacity-50', 'cursor-not-allowed');
            }
        });

        // Confirmar Depósito
        btnConfirmarDeposito.addEventListener('click', async () => {
            const montoDepositado = parseFloat(inputMontoDeposito.value);
            
            btnConfirmarDeposito.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Procesando...`;
            let response = await depositar(montoDepositado);
            setTimeout(async () => {
                // Cerrar modal
                cerrarModalSaldo();
                btnConfirmarDeposito.innerHTML = `Confirmar Depósito`;

                // Mostrar pantalla de éxito
                pantallaExitoDeposito.classList.remove('hidden');
                pantallaExitoDeposito.classList.add('flex');
                setTimeout(() => {
                    pantallaExitoDeposito.classList.remove('opacity-0');
                }, 10);

                // Cargar Lottie si no está
                if (lottieExitoDeposito.innerHTML === '') {
                    lottie.loadAnimation({
                        container: lottieExitoDeposito, 
                        renderer: 'svg',
                        loop: false,
                        autoplay: true,
                        path: '../assets/lottie_success.json' 
                    });
                } else {
                    lottie.destroy();
                    lottie.loadAnimation({
                        container: lottieExitoDeposito, 
                        renderer: 'svg',
                        loop: false,
                        autoplay: true,
                        path: '../assets/lottie_success.json' 
                    });
                }

                // Actualizar Saldo Visual
                const nuevoSaldo = (await getAccount()).balance;
                const saldoStr = nuevoSaldo.toLocaleString('es-AR', { minimumFractionDigits: 2 });
                const [enteros, decimales] = saldoStr.split(',');
                saldoTotalElement.innerHTML = `$ ${enteros}<span class="text-xl opacity-80" id="saldoDecimales">,${decimales}</span>`;

            }, 1500);
        });

        btnVolverExitoDeposito.addEventListener('click', () => {
            pantallaExitoDeposito.classList.add('opacity-0');
            setTimeout(() => {
                pantallaExitoDeposito.classList.add('hidden');
                pantallaExitoDeposito.classList.remove('flex');
            }, 300);
        });
    }

});
