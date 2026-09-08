const axiosInstance = axios.create({
    baseURL: (window.API_BASE_URL || "http://localhost:8080/api") + "/auth",
    timeout: 5000,
    headers: {
        "Content-Type": "application/json"
    },
});
const form = document.getElementById('signIn');
form.onsubmit = (data) => signIn(data);
class UserRequest {
    constructor(
        firstName,
        lastName,
        dni,
        email,
        password
    ) {
        this.firstName = firstName,
            this.lastName = lastName,
            this.dni = dni,
            this.email = email,
            this.password = password
    }
}

async function signIn(data) {
    data.preventDefault();
    ocultarMensaje(document.getElementById('responseGeneral'));
    const userRequest = new UserRequest(document.getElementById('firstName').value,
        document.getElementById('lastName').value,
        document.getElementById('dni').value,
        document.getElementById('email').value,
        document.getElementById('password').value
    );
    // así con los otros campos
    if (validateInputs(userRequest)) {
        try {
            const userResponse = await createUser(userRequest);
            if (userResponse && userResponse.data.token !== '') {
                localStorage.setItem("token", userResponse.data.token);
                console.log(userResponse);
                window.location.href = "../dashboard/indexDashboard.html";
            } else{
                mensaje = document.getElementById('responseGeneral');
                if(mensaje.style.display == 'none') {
                    mostrarMensaje('Ocurrió un error al crear la cuenta', document.getElementById('responseGeneral'));
                }
            } 
        } catch (error) {
            mostrarMensaje(error.response.data.message, document.getElementById('responseGeneral'))
        }
    };
}
function validateInputs(userData) {
    ok = true;
    if (userData.firstName === '' || userData.firstName.length < 2) {
        mostrarMensaje('El nombre no es válido', document.getElementById('responseName'));
        ok = false;
    } else ocultarMensaje(document.getElementById('responseName'))
    if (userData.lastName === '' || userData.lastName.length < 2) {
        mostrarMensaje('El apellido no es válido', document.getElementById('responseLastName'));
        ok = false;
    } else ocultarMensaje(document.getElementById('responseLastName'))
    userData.dni = userData.dni.replaceAll('.', '');
    userData.dni = userData.dni.replaceAll(' ', '');
    const regexDNI = /^[0-9. ]+$/;
    if (!regexDNI.test(userData.dni)) {
        mostrarMensaje('El DNI solo puede contener números', document.getElementById('responseDNI'));
        ok = false;
    } else if (userData.dni === '' || userData.dni.length > 9 || userData.dni.length < 7) {
        mostrarMensaje('El DNI no puede estar vacío y debe tener como mínimo 7 números y como máximo 9', document.getElementById('responseDNI'));
        ok = false;
    } else ocultarMensaje(document.getElementById('responseDNI'))
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(userData.email) && userData.email !== '') {
        mostrarMensaje('Debe ingresar un email válido', document.getElementById('responseEmail'));
        ok = false;
    } else ocultarMensaje(document.getElementById('responseEmail'))
    let regexPassword = /^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!regexPassword.test(userData.password)) {
        mostrarMensaje('La contraseña debe tener como mínimo 8 caracteres y contener al menos un número y un caracter especial', document.getElementById('responsePassword'));
        ok = false;
    } else {
        ocultarMensaje(document.getElementById('responsePassword'));
        const passwordRepeat = document.getElementById('passwordRepeat').value;
        if (userData.password !== passwordRepeat) {
            mostrarMensaje('Las contraseñas deben ser iguales', document.getElementById('responsePasswordRepeat'));
            ok = false;
        } else {
            ocultarMensaje(document.getElementById('responsePasswordRepeat'));
        }
    }
    if (!document.getElementById('agree').checked) {
        mostrarMensaje('Para poder crear una cuenta debes estar de acuerdo con nuestro términos de privacidad y de servicio', document.getElementById('responseAgree'))
        ok = false;
    }
    //Retorna si todos los campos son válidos
    return ok;
}
const createUser = async (userData) => {
    try {
        const userResponse = await axiosInstance
            .post("/register", userData);
        return userResponse.data;
    }
    catch (error) {
        mostrarMensaje(error.response.data.message, document.getElementById('responseGeneral'))
    }
    finally {
        console.log("Request completed");
    };
}
function mostrarMensaje(texto, elemento) {
    elemento.textContent = texto;
    elemento.style.display = "block"
}
function ocultarMensaje(elemento) {
    elemento.textContent = '';
    elemento.style.display = "none";
}
function seePassword(data) {
    const password = document.getElementById('password');
    if (password.type === "password") {
        password.type = "text";
    } else if (password.type === "text") {
        password.type = "password";
    }
}
function seePasswordRepeat() {
    const password = document.getElementById('passwordRepeat');
    if (password.type === "password") {
        password.type = "text";
    } else if (password.type === "text") {
        password.type = "password";
    }
}