const axiosInstance = axios.create({
    baseURL: (window.API_BASE_URL || "http://localhost:8080/api") + "/auth",
    timeout: 5000,
    headers: {
        "Content-Type": "application/json"
    },
});
const form = document.getElementById('logIn');
form.onsubmit = (data) => logIn(data);
class UserRequest {
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }
}

async function logIn(data) {
    data.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (isValidEmail(email)) {
        ocultarMensaje(document.getElementById('responseEmail'));
        if (isValidPassword(password)) {
            ocultarMensaje(document.getElementById('responsePassword'))
            try {
                // Si los campos son válidos hago la petición http
                const userRequest = new UserRequest(email, password);
                userResponse = await findUser(userRequest);
                if (userResponse && userResponse.data && userResponse.data.token) {
                    const token = userResponse.data.token;
                    localStorage.setItem('token', token);

                    // Detecta si es admin desde la respuesta o decodificando el payload del token
                    let role = userResponse.data.role;
                    if (!role) {
                        try {
                            const payloadBase64 = token.split('.')[1];
                            const payload = JSON.parse(atob(payloadBase64));
                            role = payload.role;
                        } catch (e) {
                            console.error("Error al leer rol del token:", e);
                        }
                    }

                    mostrarMensaje("Inicio de sesión exitoso", document.getElementById('responseGeneral'));

                    // Si es administrador va a su panel, si es usuario normal va al dashboard
                    if (role === 'ADMIN') {
                        window.location.href = "../admin/indexAdmin.html";
                    } else {
                        window.location.href = "../dashboard/indexDashboard.html";
                    }
                }
            } catch (error) {
                mostrarMensaje("Ocurrió un error al iniciar sesión", document.getElementById('responseGeneral'));
            }
        } else mostrarMensaje("Intente ingresando una contraseña de 8 caracteres o más", document.getElementById('responsePassword'));
    } else {
        console.log("Contraseña invalida")
        mostrarMensaje("Intente ingresando una dirección de email válida", document.getElementById('responseEmail'));
    }
}
const findUser = async (loginRequest) => {
    try {
        const userResponse = await axiosInstance.post("/login", loginRequest);
        return userResponse.data;
    }
    catch (error) {
        console.error(error);
        const mensajeError = error.response?.data?.message || 'Email o contraseña incorrectos';
        mostrarMensaje(
            mensajeError,
            document.getElementById('responseGeneral')
        );
        return null;
    }
    finally {
        console.log("Request completed");
    }
};
function isValidPassword(password) {
    return (password !== "" && password.length >= 8);
}
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (email !== '') && regex.test(email);
}
function mostrarMensaje(texto, elemento) {
    elemento.textContent = texto;
    elemento.style.display = "block"
}
function ocultarMensaje(elemento) {
    elemento.textContent = '';
    elemento.style.display = "none";
}
function seePassword() {
    const password = document.getElementById('password');
    if (password.type === "password") {
        password.type = "text";
    } else if (password.type === "text") {
        password.type = "password";
    }
}
