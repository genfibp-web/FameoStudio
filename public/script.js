// ============================================
// FÁMEO STUDIO - SCRIPT DEFINITIVO v4
// Los números vienen del HTML (data-target)
// ============================================
console.log('🚀 Fameo Studio iniciando...');

// ============================================
// 1. INYECTAR ESTILOS DE ANIMACIÓN
// ============================================
function inyectarEstilos() {
    if (document.getElementById('fameo-reveal-styles')) return;
    const estilos = document.createElement('style');
    estilos.id = 'fameo-reveal-styles';
    estilos.textContent = `
        .reveal {
            opacity: 0;
            transform: translateY(40px);
            transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                        transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.reveal-visible {
            opacity: 1;
            transform: translateY(0);
        }
        .reveal-delay-1 { transition-delay: 0.08s; }
        .reveal-delay-2 { transition-delay: 0.16s; }
        .reveal-delay-3 { transition-delay: 0.24s; }
        .reveal-delay-4 { transition-delay: 0.32s; }
        .reveal-delay-5 { transition-delay: 0.40s; }
        .reveal-delay-6 { transition-delay: 0.48s; }
    `;
    document.head.appendChild(estilos);
}
inyectarEstilos();

// ============================================
// 2. INTERSECTION OBSERVER PARA ANIMACIONES
// ============================================
function inicializarAnimaciones() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px'
    });

    const elementosAnimar = [
        '.sobre-text .tag', '.sobre-title', '.sobre-p', '.pillar', '.sobre-card',
        '.estadisticas .section-title', '.estadisticas-sub', '.stat-card',
        '.audiencia .section-title', '.audiencia p',
        '.servicios-header .tag', '.servicios .section-title', '.servicios-sub', '.servicio-card',
        '.compromiso-header .tag', '.compromiso .section-title', '.compromiso-sub', '.compromiso-card', '.trust-bar',
        '.faq-header .tag', '.faq .section-title', '.faq-sub', '.faq-item',
        '.portafolio-header .tag', '.portafolio .section-title', '.portafolio-sub', '.carrusel-wrapper',
        '.contacto .section-title', '.contacto-sub', '.formulario',
        '.footer-brand', '.footer-col', '.footer-bottom'
    ];

    elementosAnimar.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el, index) => {
            if (el.classList.contains('reveal')) return;
            el.classList.add('reveal');
            const delay = Math.min(index, 6);
            if (delay > 0) el.classList.add(`reveal-delay-${delay}`);
            observer.observe(el);
        });
    });
}

// ============================================
// 3. HERO: Efecto zoom out al scrollear
// ============================================
function inicializarHeroScroll() {
    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) return;
    
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        const heroHeight = window.innerHeight;
        if (scrollY < heroHeight) {
            const progreso = scrollY / heroHeight;
            heroContent.style.transform = `scale(${1 - progreso * 0.15})`;
            heroContent.style.opacity = `${1 - progreso * 1.2}`;
        }
    }, { passive: true });
}

// ============================================
// 4. CONTADORES (leen directo del HTML)
// ============================================
function iniciarContadores() {
    const statsSection = document.querySelector('.estadisticas');
    if (!statsSection) return;
    
    let yaIniciados = false;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !yaIniciados) {
                yaIniciados = true;
                
                document.querySelectorAll('.numero').forEach((contador) => {
                    const target = +contador.getAttribute('data-target');
                    if (!target || target === 0) return;
                    
                    const duracion = 1800;
                    const pasos = 50;
                    const incremento = target / pasos;
                    let paso = 0;
                    
                    const intervalo = setInterval(() => {
                        paso++;
                        const actual = Math.min(incremento * paso, target);
                        contador.innerText = Math.ceil(actual).toLocaleString('en-US');
                        if (paso >= pasos) {
                            clearInterval(intervalo);
                            contador.innerText = target.toLocaleString('en-US');
                        }
                    }, duracion / pasos);
                });
                
                observer.disconnect();
            }
        });
    }, { threshold: 0.2 });
    
    observer.observe(statsSection);
}

// ============================================
// 5. FORMULARIO CON FORMSPREE + MODAL PROPIO
// ============================================
const formulario = document.getElementById('formularioContacto');
const modalExito = document.getElementById('modalExito');
const modalExitoCerrar = document.getElementById('modalExitoCerrar');
const modalExitoOverlay = modalExito?.querySelector('.modal-exito-overlay');

function abrirModalExito() {
    if (!modalExito) return;
    modalExito.classList.add('activo');
    document.body.classList.add('modal-abierto');
}

function cerrarModalExito() {
    if (!modalExito) return;
    modalExito.classList.remove('activo');
    document.body.classList.remove('modal-abierto');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

if (formulario) {
    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = formulario.querySelector('button[type="submit"]');
        const textoOriginal = btn.textContent;
        btn.textContent = 'Enviando...';
        btn.disabled = true;

        const formData = new FormData(formulario);
        
        try {
            const respuesta = await fetch(formulario.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (respuesta.ok) {
                formulario.reset();
                btn.textContent = textoOriginal;
                btn.disabled = false;
                abrirModalExito();
            } else {
                throw new Error('Error en el envío');
            }
        } catch (error) {
            console.error('Error formulario:', error);
            btn.textContent = '❌ Error. Intenta de nuevo';
            btn.style.background = '#ff3b3b';
            setTimeout(() => {
                btn.textContent = textoOriginal;
                btn.style.background = '';
                btn.disabled = false;
            }, 4000);
        }
    });
}

if (modalExitoCerrar) modalExitoCerrar.addEventListener('click', cerrarModalExito);
if (modalExitoOverlay) modalExitoOverlay.addEventListener('click', cerrarModalExito);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalExito?.classList.contains('activo')) {
        cerrarModalExito();
    }
});

// ============================================
// 6. FAQ
// ============================================
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
        if (item.open) {
            faqItems.forEach((otro) => {
                if (otro !== item && otro.open) otro.open = false;
            });
        }
    });
});

// ============================================
// 7. NAVEGACIÓN
// ============================================
document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        
        const navMenu = document.getElementById('navMenu');
        const navToggle = document.getElementById('navToggle');
        if (navMenu) navMenu.classList.remove('abierto');
        if (navToggle) navToggle.classList.remove('activo');
        
        if (href === '#inicio') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const target = document.querySelector(href);
            if (target) {
                const y = target.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }
    });
});

// ============================================
// 8. MENÚ HAMBURGUESA
// ============================================
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('abierto');
        navToggle.classList.toggle('activo');
    });
}

// ============================================
// 9. CARRUSEL
// ============================================
const carrusel = document.getElementById('carrusel');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

if (prevBtn && nextBtn && carrusel) {
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        carrusel.scrollBy({ left: -280, behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        carrusel.scrollBy({ left: 280, behavior: 'smooth' });
    });
}

document.querySelectorAll('.carta-video').forEach((carta) => {
    carta.addEventListener('click', (e) => {
        if (e.target.closest('.carrusel-btn')) return;
        if (e.target.closest('.btn-carta')) return;
        carta.classList.toggle('volteada');
    });
});

// ============================================
// 10. INICIAR
// ============================================
window.addEventListener('load', () => {
    console.log('📄 Página cargada');
    inicializarAnimaciones();
    inicializarHeroScroll();
    iniciarContadores();
    console.log('✅ Listo — Números leídos del HTML');
});