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
        return response.data;
    }
    catch (error) {
        console.error(error);
        window.location.href = "../dashboard/indexDashboard.html"
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async () => {

    const nombreUsuario = document.getElementById('nombreUsuario');
    const emailUsuario = document.getElementById('emailUsuario');
    const dniUsuario = document.getElementById('dniUsuario');
    const btnCopiarCVU = document.getElementById('btnCopiarCVU');
    const cvuUsuario = document.getElementById('cvuUsuario');
    const btnCopiarAlias = document.getElementById('btnCopiarAlias');
    const aliasUsuario = document.getElementById('aliasUsuario');
    const toastCopiar = document.getElementById('toastCopiar');
    let toastTimeout;

    const inicialesUsuario = document.getElementById('inicialesUsuario');
    const rowCVU = document.getElementById('rowCVU');
    const rowAlias = document.getElementById('rowAlias');

    // Mostrar información del usuario
    const user = await getUser();
    if (user && user.data) {
        const { firstName, lastName, email, dni, account } = user.data;
        if (nombreUsuario) nombreUsuario.innerText = `${firstName} ${lastName}`;
        if (inicialesUsuario && firstName && lastName) {
            inicialesUsuario.innerText = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
        }
        if (emailUsuario) emailUsuario.innerText = email || "";
        if (cvuUsuario) cvuUsuario.innerText = account ? account.accountNumber : "";
        if (aliasUsuario) aliasUsuario.innerText = account ? account.alias : "";
        if (dniUsuario) dniUsuario.innerText = dni || "";
    }
    
    

    // Función para mostrar el aviso "Copiado!" flotante
    const mostrarToast = () => {
        if (!toastCopiar) return;
        clearTimeout(toastTimeout);
        toastCopiar.classList.remove('opacity-0');
        toastCopiar.classList.add('opacity-100');
        toastTimeout = setTimeout(() => {
            toastCopiar.classList.remove('opacity-100');
            toastCopiar.classList.add('opacity-0');
        }, 2500);
    };

    // Función genérica para copiar al portapapeles (con fallback para archivos locales)
    const copiarAlPortapapeles = async (textoElemento) => {
        if (!textoElemento) return;
        
        const texto = textoElemento.innerText.trim();
        
        //Intento con API Moderna (Requiere HTTPS o localhost)
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(texto);
                mostrarToast();
                return;
            } catch (err) {
                console.warn('API Moderna falló, usando método clásico...', err);
            }
        }
        
        // Metodo Clásico Fallback
        try {
            const textAreaTemporal = document.createElement('textarea');
            textAreaTemporal.value = texto;

            textAreaTemporal.style.position = 'fixed';
            textAreaTemporal.style.left = '-999999px';
            textAreaTemporal.style.top = '-999999px';
            
            document.body.appendChild(textAreaTemporal);
            textAreaTemporal.focus();
            textAreaTemporal.select();
            
            const exitoso = document.execCommand('copy');
            document.body.removeChild(textAreaTemporal);
            
            if (exitoso) {
                mostrarToast();
            } else {
                console.error('No se pudo copiar usando execCommand');
            }
        } catch (err) {
            console.error('Error crítico al copiar:', err);
        }
    };

    // Event Listeners para copiar
    if (btnCopiarCVU) {
        btnCopiarCVU.addEventListener('click', (e) => {
            e.stopPropagation();
            copiarAlPortapapeles(cvuUsuario);
        });
    }
    if (rowCVU) {
        rowCVU.addEventListener('click', () => copiarAlPortapapeles(cvuUsuario));
    }

    if (btnCopiarAlias) {
        btnCopiarAlias.addEventListener('click', (e) => {
            e.stopPropagation();
            copiarAlPortapapeles(aliasUsuario);
        });
    }
    if (rowAlias) {
        rowAlias.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            copiarAlPortapapeles(aliasUsuario);
        });
    }

});
