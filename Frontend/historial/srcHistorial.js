const axiosInstance = axios.create({
    baseURL: "http://localhost:8080/api/transaction",
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

export async function obtenerMovimientosHTML(type = null, mostrarFecha = true) {
    let fechaActual = "";
    const movimientos = await obtenerMovimientos(type);
    let movimientosHTML = "";

    movimientos.forEach((mov) => {
        if(mostrarFecha){
            // Mostrar separador de fecha si cambia
            let fechaFormateada = formatDate(mov.createdAt);
            if (fechaFormateada !== fechaActual) {
                fechaActual = fechaFormateada;
                movimientosHTML += `<h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 mt-2 px-1">${fechaFormateada}</h4>`;
            }
        }

        const montoFormateado = Math.abs(mov.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 });
        let icono, esIngreso, titulo, desc, colorMonto;

        if(mov.categoryName === "TRANSFER"){
            esIngreso = mov.type === "CREDIT";
            colorMonto = esIngreso ? 'text-blue-600' : 'text-slate-800';
            icono = esIngreso ? {
                clase: 'fa-solid fa-arrow-down',
                color: "text-green-500",
                bg: "bg-green-50",
                borde: "border-green-100"
            } : {
                clase: "fa-solid fa-arrow-up",
                color: "text-red-500",
                bg: "bg-red-50",
                borde: "border-red-100"
            };

            titulo = `Transferencia ${esIngreso ? 'Recibida' : 'Enviada'}`;
            desc = `${esIngreso ? 'De' : 'Para'}: ${mov.transfer.relatedAccountFirstName} ${mov.transfer.relatedAccountLastName}`;
        }else if(mov.categoryName === "DEPOSIT"){
            esIngreso = true;
            colorMonto = 'text-blue-600';
            icono = {
                clase: 'fa-solid fa-money-bill',
                color: "text-blue-600",
                bg: "bg-blue-50",
                borde: "border-blue-100"
            }
            titulo = 'Depósito'
            desc = '';
        }

        movimientosHTML += `
                <div class="p-4 rounded-[20px] bg-white border border-slate-200 shadow-sm flex items-center justify-between hover:bg-slate-50 transition cursor-pointer">
                        <div class="flex items-center gap-3">
                            <div class="w-11 h-11 rounded-full border ${icono.borde} flex items-center justify-center ${icono.color} ${icono.bg} shrink-0">
                                <i class="${icono.clase}"></i>
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
    });

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
