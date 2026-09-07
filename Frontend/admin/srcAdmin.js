class UserUpdateRequest {
    constructor(firstName, lastName, email, dni, role, isActive) {
        this.firstName = firstName,
            this.lastName = lastName,
            this.email = email,
            this.dni = dni,
            this.role = role,
            this.isActive = isActive
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

const getAllUsers = async () => {
    if (!axiosInstance) return null;
    try {
        const response = await axiosInstance.get("/user");
        return response.data.data;
    }
    catch (error) {
        console.error(error);
        if (error.status == 401) {
            window.location.href = "../login/indexLogin.html"
        }
        return null;
    }
}
const deleteUser = async (id) => {
    if (!axiosInstance) return false;
    try {
        const response = await axiosInstance.delete("/user/" + id);
        return response.status == 204 || response.status == 200;
    }
    catch (error) {
        console.error(error);
        if (error.status == 401 || error.status == 403) {
            window.location.href = "../login/indexLogin.html"
        }
        return false;
    }
}
const toggleBlock = async (id) => {
    if (!axiosInstance) return null;
    try {
        const response = await axiosInstance.post("/user/block/" + id);
        return response.status == 201 || response.status == 200;
    }
    catch (error) {
        console.error(error);
        if (error.status == 401 || error.status == 403) {
            window.location.href = "../login/indexLogin.html"
        }
        return null;
    }
}
const editUser = async (id, userUpdateRequest) => {
    if (!axiosInstance) return null;
    try {
        const response = await axiosInstance.put("/user/" + id, userUpdateRequest);
        return response.status == 201 || response.status == 200;
    }
    catch (error) {
        console.error(error);
        if (error.status == 401 || error.status == 403) {
            window.location.href = "../login/indexLogin.html"
        }
        return null;
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    // Si no está logueado o no es administrador, redirige al login
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../login/indexLogin.html";
        return;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role && payload.role !== 'ADMIN') {
            window.location.href = "../dashboard/indexDashboard.html";
            return;
        }
    } catch (e) {
        console.error("Error al verificar permisos de admin:", e);
    }

    let usuariosBD = await getAllUsers();
    if (!usuariosBD) return;

    const listaUsuariosContenedor = document.getElementById('listaUsuarios');
    const inputBuscarUsuario = document.getElementById('inputBuscarUsuario');
    const msgVacio = document.getElementById('msgVacio');

    // Variables de estado para modales
    let usuarioSeleccionado = null;
    let accionPendiente = null; // 'bloquear', 'desbloquear', 'eliminar'


    // RENDERIZADO DE LA LISTA

    const renderizarUsuarios = (filtroTexto = '') => {

        if (!listaUsuariosContenedor || !msgVacio) return;

        listaUsuariosContenedor.innerHTML = '';
        const textoBusqueda = filtroTexto.toLowerCase().trim();

        const usuariosFiltrados = usuariosBD.filter(u =>
            u.firstName.toLowerCase().includes(textoBusqueda) ||
            u.lastName.toLowerCase().includes(textoBusqueda) ||
            u.dni.includes(textoBusqueda)
        );

        if (usuariosFiltrados.length === 0) {
            msgVacio.classList.remove('hidden');
            msgVacio.classList.add('flex');
            listaUsuariosContenedor.classList.add('hidden');
        } else {
            msgVacio.classList.add('hidden');
            msgVacio.classList.remove('flex');
            listaUsuariosContenedor.classList.remove('hidden');

            usuariosFiltrados.forEach(u => {
                const inicial = u.firstName.charAt(0).toUpperCase();

                // Clases dinámicas según estado y rol
                const esAdmin = u.role === 'ADMIN';
                const esBloqueado = u.isActive == false;

                const badgeRol = esAdmin
                    ? '<span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-extrabold uppercase tracking-wide">Admin</span>'
                    : '<span class="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-extrabold uppercase tracking-wide">User</span>';

                const claseFondoAvatar = esBloqueado ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600';
                const opacityCard = esBloqueado ? 'opacity-70 grayscale-[30%]' : '';

                // HTML de la tarjeta
                const cardHTML = `
                    <div class="bg-white border ${esBloqueado ? 'border-red-200' : 'border-slate-200'} rounded-[20px] p-4 shadow-sm flex flex-col gap-3 transition hover:shadow-md ${opacityCard}">
                        <!-- Info superior -->
                        <div class="flex items-start justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full ${claseFondoAvatar} flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                                    ${inicial}
                                </div>
                                <div class="flex flex-col">
                                    <h4 class="text-sm font-bold text-slate-900 leading-none">${u.firstName} ${u.lastName}</h4>
                                    <div class="flex gap-2 mt-1.5 items-center">
                                        ${badgeRol}
                                        ${esBloqueado ? '<span class="text-[9px] font-bold text-red-500 flex items-center gap-1"><i class="fa-solid fa-lock"></i> Bloqueado</span>' : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Info Inferior (DNI/CVU) -->
                        <div class="bg-slate-50 rounded-xl p-2.5 flex flex-col gap-1 border border-slate-100">
                            <div class="flex justify-between">
                                <span class="text-[10px] font-bold text-slate-400">DNI</span>
                                <span class="text-[10px] font-bold text-slate-700">${u.dni}</span>
                            </div><!--
                            <div class="flex justify-between">
                                <span class="text-[10px] font-bold text-slate-400">CVU</span>
                                <span class="text-[10px] font-bold text-slate-700 font-mono">${u.cvu}</span> 
                            </div>-->
                        </div>

                        <!-- Botones de Acción -->
                        <div class="flex justify-end gap-2 mt-1">
                            <button onclick="abrirModalEditar(${u.id})" class="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5 transition"><i class="fa-solid fa-pen"></i> Editar</button>
                            ${!esBloqueado
                        ? `<button onclick="abrirModalAccion(${u.id}, 'bloquear')" class="px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5 transition"><i class="fa-solid fa-ban"></i> Bloquear</button>`
                        : `<button onclick="abrirModalAccion(${u.id}, 'desbloquear')" class="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5 transition"><i class="fa-solid fa-unlock"></i> Desbloquear</button>`
                    }
                            <button onclick="abrirModalAccion(${u.id}, 'eliminar')" class="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5 transition"><i class="fa-solid fa-trash-can"></i> Eliminar</button>
                        </div>
                    </div>
                `;

                listaUsuariosContenedor.insertAdjacentHTML('beforeend', cardHTML);
            });
        }
    };

    // Inicializar render
    renderizarUsuarios();

    // Evento de Búsqueda
    if (inputBuscarUsuario) {
        inputBuscarUsuario.addEventListener('input', (e) => {
            renderizarUsuarios(e.target.value);
        });
    }



    // LÓGICA DEL MODAL DE CONFIRMACIÓN (Eliminar/Bloquear)

    const modalConfirmacion = document.getElementById('modalConfirmacion');
    const modalConfirmacionContent = document.getElementById('modalConfirmacionContent');
    const btnCancelarAccion = document.getElementById('btnCancelarAccion');
    const btnConfirmarAccion = document.getElementById('btnConfirmarAccion');
    const tituloAlerta = document.getElementById('tituloAlerta');
    const descAlerta = document.getElementById('descAlerta');
    const iconoAlerta = document.getElementById('iconoAlerta');

    window.abrirModalAccion = (id, accion) => {
        usuarioSeleccionado = usuariosBD.find(u => u.id === id);
        accionPendiente = accion;

        // Configurar aspecto del modal según acción
        if (accion === 'bloquear') {
            tituloAlerta.innerText = "¿Bloquear usuario?";
            descAlerta.innerText = `El usuario ${usuarioSeleccionado.firstName} ${usuarioSeleccionado.lastName} no podrá operar.`;
            iconoAlerta.className = "w-16 h-16 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-2xl mb-4 shadow-inner";
            iconoAlerta.innerHTML = '<i class="fa-solid fa-ban"></i>';
            btnConfirmarAccion.className = "flex-1 h-14 bg-orange-500 text-white rounded-2xl font-bold text-sm hover:bg-orange-600 transition shadow-md";
        } else if (accion === 'desbloquear') {
            tituloAlerta.innerText = "¿Desbloquear usuario?";
            descAlerta.innerText = `El usuario ${usuarioSeleccionado.firstName} ${usuarioSeleccionado.lastName} recuperará el acceso.`;
            iconoAlerta.className = "w-16 h-16 rounded-full bg-green-100 text-green-500 flex items-center justify-center text-2xl mb-4 shadow-inner";
            iconoAlerta.innerHTML = '<i class="fa-solid fa-unlock"></i>';
            btnConfirmarAccion.className = "flex-1 h-14 bg-green-500 text-white rounded-2xl font-bold text-sm hover:bg-green-600 transition shadow-md";
        } else if (accion === 'eliminar') {
            tituloAlerta.innerText = "¿Eliminar usuario?";
            descAlerta.innerText = `Se borrará a ${usuarioSeleccionado.firstName} ${usuarioSeleccionado.lastName} de forma permanente.`;
            iconoAlerta.className = "w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl mb-4 shadow-inner";
            iconoAlerta.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
            btnConfirmarAccion.className = "flex-1 h-14 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 transition shadow-md";
        }

        // Mostrar Modal
        modalConfirmacion.classList.remove('hidden');
        setTimeout(() => {
            modalConfirmacion.classList.remove('opacity-0');
            modalConfirmacionContent.classList.remove('translate-y-full');
        }, 10);
    };

    const cerrarModal = () => {
        modalConfirmacion.classList.add('opacity-0');
        modalConfirmacionContent.classList.add('translate-y-full');
        setTimeout(() => {
            modalConfirmacion.classList.add('hidden');
            usuarioSeleccionado = null;
            accionPendiente = null;
        }, 300);
    };

    if (btnCancelarAccion && btnConfirmarAccion) {
        btnCancelarAccion.addEventListener('click', cerrarModal);
        modalConfirmacion.addEventListener('click', (e) => {
            if (e.target === modalConfirmacion) cerrarModal();
        });

        // Ejecutar la acción
        btnConfirmarAccion.addEventListener('click', async () => {
            btnConfirmarAccion.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

            // Petición al backend
            if (accionPendiente === 'eliminar') {
                exito = await deleteUser(usuarioSeleccionado.id);
                if (exito) {
                    usuariosBD = usuariosBD.filter(u => u.id !== usuarioSeleccionado.id);
                }
            } else if (accionPendiente === 'bloquear') {
                exito = await toggleBlock(usuarioSeleccionado.id);
                if (exito) {
                    const idx = usuariosBD.findIndex(u => u.id === usuarioSeleccionado.id);
                    if (idx !== -1) usuariosBD[idx].isActive = false;
                }
            } else if (accionPendiente === 'desbloquear') {
                exito = await toggleBlock(usuarioSeleccionado.id);
                if (exito) {
                    const idx = usuariosBD.findIndex(u => u.id === usuarioSeleccionado.id);
                    if (idx !== -1) usuariosBD[idx].isActive = true;
                }
            } 

            if (exito) {
                renderizarUsuarios(inputBuscarUsuario.value);
            }
            cerrarModal();
            btnConfirmarAccion.innerHTML = 'Confirmar';


            // Disparar Notificación Toast
            if (exito) {
                if (accionPendiente === 'eliminar') {
                    mostrarNotificacion("Usuario eliminado permanentemente.", "eliminar");
                } else if (accionPendiente === 'bloquear') {
                    mostrarNotificacion("Usuario bloqueado con éxito.", "bloquear");
                } else if (accionPendiente === 'desbloquear') {
                    mostrarNotificacion("Usuario desbloqueado.", "exito");
                }
            } else mostrarNotificacion("No se pudo completar la acción")
        });
    }


    // LÓGICA DEL MODAL DE EDICIÓN

    const modalEditarUsuario = document.getElementById('modalEditarUsuario');
    const modalEditarUsuarioContent = document.getElementById('modalEditarUsuarioContent');
    const btnCerrarEditar = document.getElementById('btnCerrarEditar');
    const btnGuardarEdicion = document.getElementById('btnGuardarEdicion');

    const inputEditNombre = document.getElementById('inputEditNombre');
    const inputEditlastName = document.getElementById('inputEditApellido');
    const inputEditDni = document.getElementById('inputEditDni');
    const inputEditEmail = document.getElementById('inputEditEmail');
    const selectEditRol = document.getElementById('selectEditRol');

    window.abrirModalEditar = (id) => {
        usuarioSeleccionado = usuariosBD.find(u => u.id === id);

        // Poblar campos
        inputEditNombre.value = usuarioSeleccionado.firstName;
        inputEditlastName.value = usuarioSeleccionado.lastName;
        inputEditDni.value = usuarioSeleccionado.dni;
        inputEditEmail.value = usuarioSeleccionado.email;
        selectEditRol.value = usuarioSeleccionado.role;

        // Mostrar Modal
        modalEditarUsuario.classList.remove('hidden');
        setTimeout(() => {
            modalEditarUsuario.classList.remove('opacity-0');
            modalEditarUsuarioContent.classList.remove('translate-y-full');
        }, 10);
    };

    const cerrarModalEditar = () => {
        modalEditarUsuario.classList.add('opacity-0');
        modalEditarUsuarioContent.classList.add('translate-y-full');
        setTimeout(() => {
            modalEditarUsuario.classList.add('hidden');
            usuarioSeleccionado = null;
        }, 300);
    };

    if (btnCerrarEditar && modalEditarUsuario && btnGuardarEdicion) {
        btnCerrarEditar.addEventListener('click', cerrarModalEditar);
        modalEditarUsuario.addEventListener('click', (e) => {
            if (e.target === modalEditarUsuario) cerrarModalEditar();
        });

        // Guardar Edición
        btnGuardarEdicion.addEventListener('click', async () => {
            btnGuardarEdicion.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

            // Petición al backend
            const userUpdateRequest = new UserUpdateRequest(
                inputEditNombre.value.trim(),
                inputEditlastName.value.trim(),
                inputEditEmail.value,
                inputEditDni.value.trim(),
                selectEditRol.value,
                usuarioSeleccionado.isActive
            );
            exito = await editUser(usuarioSeleccionado.id, userUpdateRequest);

            // Actualizar array
            const idx = usuariosBD.findIndex(u => u.id === usuarioSeleccionado.id);
            usuariosBD[idx].nombre = inputEditNombre.value.trim();
            usuariosBD[idx].apellido = inputEditlastName.value.trim();
            usuariosBD[idx].dni = inputEditDni.value.trim();
            usuariosBD[idx].email = inputEditEmail.value;
            usuariosBD[idx].role = selectEditRol.value;
            renderizarUsuarios(inputBuscarUsuario.value);
            cerrarModalEditar();
            btnGuardarEdicion.innerHTML = 'Guardar Cambios';

            // Mostrar notificación de éxito
            if (exito) {
                mostrarNotificacion("Usuario editado correctamente.", "exito");
            } else mostrarNotificacion("No se pudieron editar los datos del usuario");
        });
    }


    //TOAST DE NOTIFICACIÓN

    const toastNotificacion = document.getElementById('toastNotificacion');
    const toastMensaje = document.getElementById('toastMensaje');
    const toastIconoContainer = document.getElementById('toastIconoContainer');
    const toastIcono = document.getElementById('toastIcono');
    let toastTimer;

    const mostrarNotificacion = (mensaje, tipo = 'exito') => {
        if (!toastNotificacion) return;

        toastMensaje.innerText = mensaje;

        // Colores según tipo
        if (tipo === 'eliminar') {
            toastIconoContainer.className = "w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0";
            toastIcono.className = "fa-solid fa-trash-can text-sm";
        } else if (tipo === 'bloquear') {
            toastIconoContainer.className = "w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0";
            toastIcono.className = "fa-solid fa-ban text-sm";
        } else {
            // exito genérico (editar, desbloquear)
            toastIconoContainer.className = "w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0";
            toastIcono.className = "fa-solid fa-check text-sm";
        }

        // Animación de entrada
        toastNotificacion.classList.remove('opacity-0', '-translate-y-12', 'pointer-events-none');
        toastNotificacion.classList.add('opacity-100', 'translate-y-0');

        // Ocultar después de 3s
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toastNotificacion.classList.remove('opacity-100', 'translate-y-0');
            toastNotificacion.classList.add('opacity-0', '-translate-y-12', 'pointer-events-none');
        }, 3000);
    };

    // Botón para cerrar sesión
    const btnCerrarSesionAdmin = document.getElementById('btnCerrarSesionAdmin');
    if (btnCerrarSesionAdmin) {
        btnCerrarSesionAdmin.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = "../login/indexLogin.html";
        });
    }

});
