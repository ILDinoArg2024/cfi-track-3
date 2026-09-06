document.addEventListener('DOMContentLoaded', () => {

    // Carga la animacion Lottie
    const contenedorLottie = document.getElementById('lottie404');
    if (contenedorLottie) {
        lottie.loadAnimation({
            container: contenedorLottie,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: '../assets/lottie_404.json'
        });
    }

    // Si no hay token redirige al inicio de sesión
    const token = localStorage.getItem('token');
    const btnIrInicio = document.getElementById('btnIrInicio');
    if (!token && btnIrInicio) {
        btnIrInicio.href = '../index.html';
    }

});
