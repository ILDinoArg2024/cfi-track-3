const axiosInstance = axios.create({
    baseURL: (window.API_BASE_URL || "http://localhost:8080/api") + "/transaction",
    timeout: 5000,
    headers: {
        "Authorization": "Bearer " + localStorage.getItem("token"),
        "Content-Type": "application/json"
    },
});

const obtenerMovimientos = async (type = null) => {
    if(!axiosInstance) return null;

    try{
        const response = type === null ? await axiosInstance.get() : await axiosInstance.get("", {
            params: {type: type}
        });

        return response.data.data;
    }catch (error) {
        console.error(error);
        return null;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);

    const today = new Date();
    const yesterday = new Date();

    today.setHours(0, 0, 0, 0);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const transactionDate = new Date(date);
    transactionDate.setHours(0, 0, 0, 0);

    if (transactionDate.getTime() === today.getTime()) {
        return "Hoy";
    }

    if (transactionDate.getTime() === yesterday.getTime()) {
        return "Ayer";
    }

    return transactionDate.toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long"
    });
}

const ESTILOS_CATEGORIAS = {
    'SUPERMERCADO': { icon: 'fa-cart-shopping', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-500', iconBorderColor: 'border-indigo-100' },
    'COMIDA': { icon: 'fa-burger', iconBg: 'bg-orange-50', iconColor: 'text-orange-500', iconBorderColor: 'border-orange-100' },
    'TRANSPORTE': { icon: 'fa-car', iconBg: 'bg-sky-50', iconColor: 'text-sky-500', iconBorderColor: 'border-sky-100' },
    'SERVICIOS': {  icon: 'fa-bolt', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500', iconBorderColor: 'border-emerald-100' },
    'ENTRETENIMIENTO': { icon: 'fa-ticket', iconBg: 'bg-pink-50', iconColor: 'text-pink-500', iconBorderColor: 'border-pink-100' },
    'FARMACIA_SALUD': { icon: 'fa-heart-pulse', iconBg: 'bg-rose-50', iconColor: 'text-rose-500', iconBorderColor: 'border-rose-100' },
    'INDUMENTARIA': { icon: 'fa-shirt', iconBg: 'bg-purple-50', iconColor: 'text-purple-500', iconBorderColor: 'border-purple-100' },
    'OTROS': { icon: 'fa-box-archive', iconBg: 'bg-slate-50', iconColor: 'text-slate-500', iconBorderColor: 'border-slate-100' }
};
function obtenerIconoParaCategoria(label) {
    return ESTILOS_CATEGORIAS[label] ?? ESTILOS_CATEGORIAS['OTROS'];
}

export async function obtenerMovimientosHTML(type = null, mostrarFecha = true, limite = null) {
    let fechaActual = "";
    const movimientos = (await obtenerMovimientos(type)) || [];
    let movimientosHTML = "";
    if(limite === null) limite = movimientos.length;
    else limite = Math.min(limite, movimientos.length);
    for(let i=0; i<limite; i++){
        let mov = movimientos[i];
        if(mostrarFecha){
            // Mostrar separador de fecha si cambia
            let fechaFormateada = formatDate(mov.createdAt);
            if (fechaFormateada !== fechaActual) {
                fechaActual = fechaFormateada;
                movimientosHTML += `<h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 mt-2 px-1">${fechaFormateada}</h4>`;
            }
        }

        const montoFormateado = Math.abs(mov.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 });
        let icono = {
            icon: 'fa-receipt',
            iconColor: "text-slate-500",
            iconBg: "bg-slate-50",
            iconBorderColor: "border-slate-100"
        };
        let esIngreso = mov.type === "CREDIT";
        let colorMonto = esIngreso ? 'text-blue-600' : 'text-slate-800';
        let titulo = 'Operación';
        let desc = '';

        if(mov.categoryName === "TRANSFER"){
            esIngreso = mov.type === "CREDIT";
            colorMonto = esIngreso ? 'text-blue-600' : 'text-slate-800';
            icono = esIngreso ? {
                icon: 'fa-arrow-down',
                iconColor: "text-green-500",
                iconBg: "bg-green-50",
                iconBorderColor: "border-green-100"
            } : {
                icon: "fa-arrow-up",
                iconColor: "text-red-500",
                iconBg: "bg-red-50",
                iconBorderColor: "border-red-100"
            };

            const nombreRelacionado = [mov.transfer?.relatedAccountFirstName, mov.transfer?.relatedAccountLastName]
                .filter(Boolean)
                .join(' ');

            titulo = `Transferencia ${esIngreso ? 'Recibida' : 'Enviada'}`;
            desc = nombreRelacionado ? `${esIngreso ? 'De' : 'Para'}: ${nombreRelacionado}` : (mov.transfer?.description || 'Transferencia');
        }else if(mov.categoryName === "DEPOSIT"){
            esIngreso = true;
            colorMonto = 'text-blue-600';
            icono = {
                icon: 'fa-money-bill',
                iconColor: "text-blue-600",
                iconBg: "bg-blue-50",
                iconBorderColor: "border-blue-100"
            };
            titulo = 'Depósito';
            desc = '';
        }else if(mov.categoryName === "PAYMENT"){
            esIngreso = mov.type === "CREDIT";
            colorMonto = esIngreso ? 'text-blue-600' : 'text-slate-800';

            if (esIngreso) {
                // Si es un cobro que recibio con QR
                icono = {
                    icon: 'fa-qrcode',
                    iconColor: 'text-emerald-600',
                    iconBg: 'bg-emerald-50',
                    iconBorderColor: 'border-emerald-100'
                };
                titulo = 'Cobro recibido';
                const pagador = [mov.payment?.relatedFirstName, mov.payment?.relatedLastName]
                    .filter(Boolean)
                    .join(' ');
                desc = pagador
                    ? `De: ${pagador}${mov.payment?.category ? ` • ${mov.payment.category}` : ''}`
                    : (mov.payment?.category || 'Cobro con QR');
            } else {
                // Si es un pago que realizo el usuario
                const catKey = mov.payment?.categoryKey || 'OTROS';
                icono = obtenerIconoParaCategoria(catKey);
                titulo = 'Pago';
                desc = mov.payment?.category || 'Pago con QR';
            }
        }

        movimientosHTML += `
                <div class="p-4 rounded-[20px] bg-white border border-slate-200 shadow-sm flex items-center justify-between hover:bg-slate-50 transition cursor-pointer">
                        <div class="flex items-center gap-3">
                            <div class="w-11 h-11 rounded-full border ${icono.iconBorderColor} flex items-center justify-center ${icono.iconColor} ${icono.iconBg} shrink-0">
                                <i class="fa-solid ${icono.icon}"></i>
                            </div>
                            <div>
                                <p class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    ${titulo} <span class="w-1 h-1 bg-blue-600 rounded-full"></span>
                                </p>
                                <p class="text-[10px] text-slate-500 mt-0.5">
                                    ${desc}
                                </p>
                            </div>
                        </div>
                        <span class="text-xs font-bold tracking-wide ${colorMonto}">
                            ${esIngreso ? '+' : '-'}$ ${montoFormateado}
                        </span>
                </div>
                `;
    }

    return movimientosHTML
}

document.addEventListener('DOMContentLoaded', () => {

    // LÓGICA DEL BOTÓN VOLVER

    const btnVolver = document.getElementById('btnVolver');
    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            // Efecto de fade out
            document.body.classList.add('opacity-0');
            setTimeout(() => {
                window.history.back(); 
            }, 100);
        });
    }

    // RENDERIZADO DEL HISTORIAL Y FILTROS

    const listaMovimientos = document.getElementById('listaMovimientos');
    const msgHistorialVacio = document.getElementById('msgHistorialVacio');
    const botonesFiltro = document.querySelectorAll('.filtro-btn');

    async function renderizarLista(filtro = 'todos'){
        if (!listaMovimientos || !msgHistorialVacio) return;

        listaMovimientos.innerHTML = '';
        
        let type;
        if (filtro === 'ingresos') type = "CREDIT";
        else if (filtro === 'egresos') type = ("DEBIT");
        else type = null;

        let movimientosHTML = await obtenerMovimientosHTML(type);

        if (movimientosHTML === "") {
            // Mostrar mensaje vacío
            msgHistorialVacio.classList.remove('hidden');
            msgHistorialVacio.classList.add('flex');
            listaMovimientos.classList.add('hidden');
        } else {
            listaMovimientos.innerHTML = movimientosHTML;
            // Ocultar mensaje vacío
            msgHistorialVacio.classList.add('hidden');
            msgHistorialVacio.classList.remove('flex');
            listaMovimientos.classList.remove('hidden');
        }
    }

    // Inicializar con 'todos'
    renderizarLista('todos');

    // Manejar Clicks en los Filtros
    botonesFiltro.forEach(btn => {
        btn.addEventListener('click', () => {
            //Quitar estilos activos de todos
            botonesFiltro.forEach(b => {
                b.classList.remove('bg-slate-900', 'text-white', 'shadow-md', 'activo');
                b.classList.add('bg-white', 'border', 'border-slate-200', 'text-slate-600', 'hover:bg-slate-50');
            });

            // Aplicar estilos activos al clickeado
            btn.classList.add('bg-slate-900', 'text-white', 'shadow-md', 'activo');
            btn.classList.remove('bg-white', 'border', 'border-slate-200', 'text-slate-600', 'hover:bg-slate-50');

            //  Renderizar lista filtrada
            const filtroElegido = btn.getAttribute('data-filtro');
            renderizarLista(filtroElegido);
        });
    });

});
