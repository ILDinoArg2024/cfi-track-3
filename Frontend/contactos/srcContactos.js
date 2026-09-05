document.addEventListener('DOMContentLoaded', () => {

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../login/indexLogin.html';
        return;
    }

    const API_BASE_URL = 'http://localhost:8080/api';
    const listaItemsContactos = document.getElementById('listaItemsContactos');
    const msgSinContactos = document.getElementById('msgSinContactos');
    const msgSinResultados = document.getElementById('msgSinResultados');
    const inputBusqueda = document.getElementById('inputBusquedaContactos');

    // Paleta de colores para los avatares
    const avatarColors = [
        { bg: 'bg-blue-100', text: 'text-blue-600' },
        { bg: 'bg-indigo-100', text: 'text-indigo-600' },
        { bg: 'bg-orange-100', text: 'text-orange-500' },
        { bg: 'bg-emerald-100', text: 'text-emerald-600' },
        { bg: 'bg-purple-100', text: 'text-purple-600' },
        { bg: 'bg-rose-100', text: 'text-rose-600' }
    ];

    let contactosActuales = [];
    let contactoIdAEliminar = null;
    let contactoElementoAEliminar = null;


    // CARGAR CONTACTOS DESDE EL BACKEND

    async function cargarContactos() {
        try {
            const response = await fetch(`${API_BASE_URL}/contacts`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '../login/indexLogin.html';
                return;
            }

            const result = await response.json();

            if (response.ok && result.success) {
                contactosActuales = result.data || [];
                renderizarContactos(contactosActuales);
            } else {
                console.error('Error al obtener contactos:', result.message);
                renderizarContactos([]);
            }
        } catch (error) {
            console.error('Error al conectar con el servidor:', error);
            renderizarContactos([]);
        }
    }


    // RENDERIZAR CONTACTOS EN EL DOM

    function renderizarContactos(contactos) {
        if (!listaItemsContactos) return;

        listaItemsContactos.innerHTML = '';

        if (contactos.length === 0) {
            if (msgSinContactos) {
                msgSinContactos.classList.remove('hidden');
                msgSinContactos.classList.add('flex');
            }
            if (msgSinResultados) {
                msgSinResultados.classList.add('hidden');
                msgSinResultados.classList.remove('flex');
            }
            return;
        }

        if (msgSinContactos) {
            msgSinContactos.classList.add('hidden');
            msgSinContactos.classList.remove('flex');
        }

        contactos.forEach((contacto, index) => {
            const color = avatarColors[index % avatarColors.length];
            
            // Obtener iniciales del nombre
            const nombreMostrar = contacto.name || `${contacto.contactFirstName || ''} ${contacto.contactLastName || ''}`.trim() || 'Contacto';
            const iniciales = nombreMostrar.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'C';
            const aliasMostrar = contacto.alias || contacto.accountNumber || contacto.contactEmail || '';

            const itemDiv = document.createElement('div');
            itemDiv.className = 'contacto-item flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl shadow-sm mb-3 transition hover:border-blue-100';
            itemDiv.setAttribute('data-id', contacto.id);
            itemDiv.setAttribute('data-nombre', nombreMostrar.toLowerCase());
            itemDiv.setAttribute('data-alias', aliasMostrar.toLowerCase());

            itemDiv.innerHTML = `
                <div class="flex items-center gap-3 overflow-hidden">
                    <div class="w-11 h-11 rounded-full ${color.bg} flex items-center justify-center ${color.text} font-extrabold text-sm shrink-0">
                        ${iniciales}
                    </div>
                    <div class="flex flex-col min-w-0">
                        <span class="contacto-nombre text-sm font-bold text-slate-800 truncate">${nombreMostrar}</span>
                        <span class="contacto-alias text-[10px] font-medium text-slate-400 truncate">${aliasMostrar}</span>
                    </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <button class="btn-eliminar-contacto w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-500 transition" title="Eliminar" data-id="${contacto.id}" data-name="${nombreMostrar}">
                        <i class="fa-solid fa-trash-can text-[12px]"></i>
                    </button>
                    <a href="../transferencia/indexTransferencia.html?alias=${encodeURIComponent(aliasMostrar)}&nombre=${encodeURIComponent(nombreMostrar)}" class="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition page-transition" title="Transferir">
                        <i class="fa-solid fa-paper-plane text-[11px]"></i>
                    </a>
                </div>
            `;

            listaItemsContactos.appendChild(itemDiv);
        });

        // Re-vincular botones de eliminar creados
        vincularBotonesEliminar();
    }


    // LÓGICA DE BÚSQUEDA / FILTRO

    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', (e) => {
            const termino = e.target.value.toLowerCase().trim();
            const items = document.querySelectorAll('.contacto-item');
            let visibles = 0;

            items.forEach(item => {
                const nombre = item.getAttribute('data-nombre') || '';
                const alias = item.getAttribute('data-alias') || '';

                if (nombre.includes(termino) || alias.includes(termino)) {
                    item.style.display = 'flex';
                    visibles++;
                } else {
                    item.style.display = 'none';
                }
            });

            if (msgSinResultados) {
                if (visibles === 0 && items.length > 0) {
                    msgSinResultados.classList.remove('hidden');
                    msgSinResultados.classList.add('flex');
                } else {
                    msgSinResultados.classList.add('hidden');
                    msgSinResultados.classList.remove('flex');
                }
            }
        });
    }


    // LÓGICA DEL BOTÓN VOLVER

    const btnVolver = document.getElementById('btnVolver');
    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            document.body.classList.add('opacity-0');
            setTimeout(() => {
                window.history.back();
            }, 100);
        });
    }


    // MODAL NUEVO CONTACTO

    const btnNuevoContacto = document.getElementById('btnNuevoContacto');
    const modalNuevaCuenta = document.getElementById('modalNuevaCuenta');
    const btnCerrarModalCuenta = document.getElementById('btnCerrarModalCuenta');
    const modalNuevaCuentaContent = document.getElementById('modalNuevaCuentaContent');
    const btnGuardarModalCuenta = document.getElementById('btnGuardarModalCuenta');

    if (btnNuevoContacto && modalNuevaCuenta) {
        const cerrarModal = () => {
            modalNuevaCuenta.classList.add('opacity-0');
            modalNuevaCuentaContent.classList.add('translate-y-full');
            setTimeout(() => {
                modalNuevaCuenta.classList.add('hidden');
            }, 300);
        };

        btnNuevoContacto.addEventListener('click', (e) => {
            e.preventDefault();
            modalNuevaCuenta.classList.remove('hidden');
            setTimeout(() => {
                modalNuevaCuenta.classList.remove('opacity-0');
                modalNuevaCuentaContent.classList.remove('translate-y-full');
            }, 10);
        });

        btnCerrarModalCuenta.addEventListener('click', cerrarModal);

        modalNuevaCuenta.addEventListener('click', (e) => {
            if (e.target === modalNuevaCuenta) {
                cerrarModal();
            }
        });

        btnGuardarModalCuenta.addEventListener('click', async () => {
            const aliasInput = document.getElementById('inputModalCbu');
            const nombreInput = document.getElementById('inputModalNombre');
            const accountIdentifier = aliasInput.value.trim();
            const name = nombreInput.value.trim();

            if (!accountIdentifier || !name) {
                alert('Por favor completa tanto el alias/CVU como el nombre del contacto.');
                return;
            }

            const textoOriginal = btnGuardarModalCuenta.innerHTML;
            btnGuardarModalCuenta.disabled = true;
            btnGuardarModalCuenta.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando...`;

            try {
                const response = await fetch(`${API_BASE_URL}/contacts`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        accountIdentifier: accountIdentifier,
                        name: name
                    })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    cerrarModal();
                    aliasInput.value = '';
                    nombreInput.value = '';
                    // Recargar la lista de contactos desde el backend
                    await cargarContactos();
                } else {
                    alert(result.message || 'No se pudo guardar el contacto.');
                }
            } catch (error) {
                console.error('Error al guardar contacto:', error);
                alert('Ocurrió un error al conectar con el servidor.');
            } finally {
                btnGuardarModalCuenta.disabled = false;
                btnGuardarModalCuenta.innerHTML = textoOriginal;
            }
        });
    }


    // MODAL ELIMINAR CONTACTO (DELETE AL BACKEND)

    const modalEliminarContacto = document.getElementById('modalEliminarContacto');
    const modalEliminarContactoContent = document.getElementById('modalEliminarContactoContent');
    const nombreContactoAEliminar = document.getElementById('nombreContactoAEliminar');
    const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');
    const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');

    const cerrarModalEliminar = () => {
        if (!modalEliminarContacto) return;
        modalEliminarContacto.classList.add('opacity-0');
        modalEliminarContactoContent.classList.add('scale-95');
        setTimeout(() => {
            modalEliminarContacto.classList.add('hidden');
            contactoIdAEliminar = null;
            contactoElementoAEliminar = null;
        }, 300);
    };

    function vincularBotonesEliminar() {
        const botonesEliminar = document.querySelectorAll('.btn-eliminar-contacto');
        botonesEliminar.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                contactoIdAEliminar = btn.getAttribute('data-id');
                const nombre = btn.getAttribute('data-name');
                contactoElementoAEliminar = btn.closest('.contacto-item');

                if (nombreContactoAEliminar) {
                    nombreContactoAEliminar.innerText = nombre || 'este contacto';
                }

                if (modalEliminarContacto) {
                    modalEliminarContacto.classList.remove('hidden');
                    setTimeout(() => {
                        modalEliminarContacto.classList.remove('opacity-0');
                        modalEliminarContactoContent.classList.remove('scale-95');
                    }, 10);
                }
            });
        });
    }

    if (btnCancelarEliminar) {
        btnCancelarEliminar.addEventListener('click', cerrarModalEliminar);
    }

    if (modalEliminarContacto) {
        modalEliminarContacto.addEventListener('click', (e) => {
            if (e.target === modalEliminarContacto) {
                cerrarModalEliminar();
            }
        });
    }

    if (btnConfirmarEliminar) {
        btnConfirmarEliminar.addEventListener('click', async () => {
            if (!contactoIdAEliminar) return;

            const textoOriginal = btnConfirmarEliminar.innerHTML;
            btnConfirmarEliminar.disabled = true;
            btnConfirmarEliminar.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;

            try {
                const response = await fetch(`${API_BASE_URL}/contacts/${contactoIdAEliminar}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    cerrarModalEliminar();

                    // Animación suave de eliminación
                    if (contactoElementoAEliminar) {
                        contactoElementoAEliminar.style.transition = 'all 0.3s ease';
                        contactoElementoAEliminar.style.opacity = '0';
                        contactoElementoAEliminar.style.transform = 'scale(0.95)';

                        setTimeout(() => {
                            contactoElementoAEliminar.remove();
                            // Si ya no quedan elementos, mostrar mensaje de vacio
                            const restantes = document.querySelectorAll('.contacto-item');
                            if (restantes.length === 0 && msgSinContactos) {
                                msgSinContactos.classList.remove('hidden');
                                msgSinContactos.classList.add('flex');
                            }
                        }, 300);
                    }
                } else {
                    alert(result.message || 'No se pudo eliminar el contacto.');
                }
            } catch (error) {
                console.error('Error al eliminar contacto:', error);
                alert('Ocurrió un error al intentar eliminar el contacto.');
            } finally {
                btnConfirmarEliminar.disabled = false;
                btnConfirmarEliminar.innerHTML = textoOriginal;
            }
        });
    }

    // Iniciar carga de contactos
    cargarContactos();
});
