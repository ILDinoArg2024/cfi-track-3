const axiosInstance = axios.create({
    baseURL: "http://localhost:8080/api/auth",
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
                if (userResponse && userResponse.data.token !== '') {
                    localStorage.setItem('token', userResponse.data.token);
                    mostrarMensaje("Inicio de sesión exitoso", document.getElementById('responseGeneral'));
                    window.location.href = "../dashboard/indexDashboard.html";
                } else {
                    mostrarMensaje("Email o contraseña incorrectos", document.getElementById('responseGeneral'));
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
        mostrarMensaje(
            'Ocurrió un error al iniciar sesión',
            document.getElementById('responseGeneral')
        );
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
