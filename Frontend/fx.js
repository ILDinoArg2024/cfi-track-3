// URL base de la API según el entorno (si corre en local usa localhost, sino Render)
window.API_BASE_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:")
    ? "http://localhost:8080/api"
    : "https://alkywall-api-u58g.onrender.com/api";

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    body.classList.add('transition-opacity', 'duration-100', 'ease-in-out');
    setTimeout(() => {
        body.classList.remove('opacity-0');
    }, 50);
    const transitionLinks = document.querySelectorAll('.page-transition');
    transitionLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
                const targetUrl = link.getAttribute('href');
               body.classList.add('opacity-0');
                 setTimeout(() => {
                window.location.href = targetUrl;
            }, 100);
        });
    });
});

// Solución para el problema de la "pantalla en blanco" al usar el botón Volver
// Los navegadores guardan el estado exacto de la página al salir (que era opacity-0).
// Este evento se dispara siempre, incluso cuando volvemos usando la caché del navegador.
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        document.body.classList.remove('opacity-0');
    }
});
