// Instancia de Axios para llamadas a la API
const axiosInstance = typeof axios !== 'undefined' ? axios.create({
    baseURL: "http://localhost:8080/api",
    timeout: 5000,
    headers: {
        "Content-Type": "application/json"
    }
}) : null;

if (axiosInstance) {
    axiosInstance.interceptors.request.use((config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });
}

// Formatea la fecha de la notificación para que se vea amigable
function formatearFecha(fechaStr) {
    if (!fechaStr) return "";
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return fechaStr;

    const ahora = new Date();
    const esMismoDia = fecha.toDateString() === ahora.toDateString();

    const ayer = new Date();
    ayer.setDate(ahora.getDate() - 1);
    const esAyer = fecha.toDateString() === ayer.toDateString();

    const hora = fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });

    if (esMismoDia) {
        return `Hoy, ${hora}`;
    } else if (esAyer) {
        return `Ayer, ${hora}`;
    } else {
        const opciones = { day: '2-digit', month: 'short' };
        return `${fecha.toLocaleDateString('es-AR', opciones)}, ${hora}`;
    }
}

// Configuración de íconos y colores según el tipo de notificación
function obtenerEstiloPorTipo(tipo) {
    switch (tipo) {
        case 'TRANSFER_RECEIVED':
            return {
                icono: 'fa-solid fa-money-bill-transfer',
                bg: 'bg-blue-100',
                color: 'text-blue-600'
            };
        case 'TRANSFER_SENT':
            return {
                icono: 'fa-solid fa-arrow-up-right-from-square',
                bg: 'bg-blue-100',
                color: 'text-blue-600'
            };
        case 'PAYMENT_RECEIVED':
            return {
                icono: 'fa-solid fa-qrcode',
                bg: 'bg-emerald-100',
                color: 'text-emerald-600'
            };
        case 'PAYMENT_SENT':
            return {
                icono: 'fa-solid fa-receipt',
                bg: 'bg-indigo-100',
                color: 'text-indigo-600'
            };
        case 'DEPOSIT':
            return {
                icono: 'fa-solid fa-arrow-down',
                bg: 'bg-emerald-100',
                color: 'text-emerald-600'
            };
        case 'WELCOME':
            return {
                icono: 'fa-solid fa-hand-wave',
                bg: 'bg-slate-100',
                color: 'text-slate-500'
            };
        case 'SECURITY':
            return {
                icono: 'fa-solid fa-shield-halved',
                bg: 'bg-orange-100',
                color: 'text-orange-500'
            };
        default:
            return {
                icono: 'fa-solid fa-bell',
                bg: 'bg-blue-100',
                color: 'text-blue-600'
            };
    }
}

// Transforma visualmente una tarjeta no leída a leída
function marcarElementoComoLeido(itemElement) {
    if (!itemElement || !itemElement.classList.contains('notif-no-leida')) return;

    itemElement.classList.remove('bg-blue-50/40', 'border-blue-50', 'hover:bg-blue-50/80', 'notif-no-leida');
    itemElement.classList.add('bg-white', 'border-slate-100', 'hover:bg-slate-50', 'opacity-70');

    const puntito = itemElement.querySelector('.puntito-azul');
    if (puntito) puntito.remove();

    const icono = itemElement.querySelector('.icono-wrapper');
    if (icono) icono.classList.add('ml-1.5');

    const titulo = itemElement.querySelector('.notif-titulo');
    if (titulo) {
        titulo.classList.remove('font-extrabold', 'text-slate-900');
        titulo.classList.add('font-bold', 'text-slate-800');
    }

    const fecha = itemElement.querySelector('.notif-fecha');
    if (fecha) {
        fecha.classList.remove('font-bold', 'text-blue-600');
        fecha.classList.add('font-medium', 'text-slate-400');
    }

    const texto = itemElement.querySelector('.notif-texto');
    if (texto) {
        texto.classList.remove('font-semibold', 'text-slate-700');
        texto.classList.add('font-medium', 'text-slate-500');
    }
}

// Carga y dibuja las notificaciones en pantalla
async function cargarNotificaciones() {
    const contenedor = document.getElementById('listaNotificaciones');
    if (!contenedor) return;

    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
        window.location.href = "../login/indexLogin.html";
        return;
    }

    try {
        const response = await axiosInstance.get("/notifications");
        const notificaciones = response.data?.data || [];

        if (notificaciones.length === 0) {
            contenedor.innerHTML = `
                <div class="flex flex-col items-center justify-center h-64 text-center px-4">
                    <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                        <i class="fa-regular fa-bell text-2xl"></i>
                    </div>
                    <p class="text-sm font-bold text-slate-700">No tenés notificaciones</p>
                    <p class="text-xs text-slate-400 mt-1">Acá vas a ver tus movimientos y avisos importantes.</p>
                </div>
            `;
            return;
        }

        contenedor.innerHTML = '';

        notificaciones.forEach(notif => {
            const estilo = obtenerEstiloPorTipo(notif.type);
            const fechaFormateada = formatearFecha(notif.createdAt);
            const isNoLeida = !notif.isRead;

            const div = document.createElement('div');
            div.dataset.id = notif.id;

            if (isNoLeida) {
                div.className = "notif-item notif-no-leida p-4 bg-blue-50/40 border-b border-blue-50 flex gap-4 hover:bg-blue-50/80 transition cursor-pointer relative";
                div.innerHTML = `
                    <div class="absolute top-1/2 -translate-y-1/2 left-2 w-1.5 h-1.5 bg-blue-600 rounded-full puntito-azul"></div>
                    <div class="icono-wrapper w-10 h-10 rounded-full ${estilo.bg} flex items-center justify-center ${estilo.color} shrink-0">
                        <i class="${estilo.icono}"></i>
                    </div>
                    <div class="flex-1">
                        <div class="flex justify-between items-start mb-0.5">
                            <h4 class="notif-titulo text-xs font-extrabold text-slate-900">${notif.title}</h4>
                            <span class="notif-fecha text-[9px] font-bold text-blue-600">${fechaFormateada}</span>
                        </div>
                        <p class="notif-texto text-[10px] font-semibold text-slate-700 leading-tight pr-2">${notif.message}</p>
                    </div>
                `;

                // Al hacer clic, marcar individualmente como leída
                div.addEventListener('click', async () => {
                    marcarElementoComoLeido(div);
                    try {
                        await axiosInstance.patch(`/notifications/${notif.id}/read`);
                    } catch (err) {
                        console.error("Error al marcar notificación como leída:", err);
                    }
                });
            } else {
                div.className = "p-4 bg-white border-b border-slate-100 flex gap-4 hover:bg-slate-50 transition cursor-pointer relative opacity-70";
                div.innerHTML = `
                    <div class="w-10 h-10 rounded-full ${estilo.bg} flex items-center justify-center ${estilo.color} shrink-0 ml-1.5">
                        <i class="${estilo.icono}"></i>
                    </div>
                    <div class="flex-1">
                        <div class="flex justify-between items-start mb-0.5">
                            <h4 class="text-xs font-bold text-slate-800">${notif.title}</h4>
                            <span class="text-[9px] font-medium text-slate-400">${fechaFormateada}</span>
                        </div>
                        <p class="text-[10px] font-medium text-slate-500 leading-tight pr-2">${notif.message}</p>
                    </div>
                `;
            }

            contenedor.appendChild(div);
        });

    } catch (error) {
        console.error("Error al cargar notificaciones:", error);
        contenedor.innerHTML = `
            <div class="flex flex-col items-center justify-center h-64 text-center px-4">
                <p class="text-sm font-bold text-red-500">Error al cargar las notificaciones</p>
                <p class="text-xs text-slate-400 mt-1">Por favor, intentá nuevamente más tarde.</p>
            </div>
        `;
    }
}

// Inicialización de eventos al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    cargarNotificaciones();

    // Botón marcar todas como leídas
    const btnMarcarTodas = document.getElementById('btnMarcarTodas');
    if (btnMarcarTodas) {
        btnMarcarTodas.addEventListener('click', async () => {
            const noLeidas = document.querySelectorAll('.notif-no-leida');
            if (noLeidas.length === 0) return;

            noLeidas.forEach(item => marcarElementoComoLeido(item));
            btnMarcarTodas.classList.remove('text-blue-600', 'hover:bg-blue-50');
            btnMarcarTodas.classList.add('text-slate-300', 'cursor-default');

            try {
                await axiosInstance.patch("/notifications/read-all");
            } catch (err) {
                console.error("Error al marcar todas las notificaciones:", err);
            }
        });
    }

    // Botón volver
    const btnVolver = document.getElementById('btnVolver');
    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            document.body.classList.add('opacity-0');
            setTimeout(() => {
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location.href = "../dashboard/indexDashboard.html";
                }
            }, 100);
        });
    }
});
