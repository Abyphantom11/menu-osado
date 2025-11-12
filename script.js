// Configuración
const TOTAL_PAGES = 5; // Número total de páginas
const SWIPE_THRESHOLD = 100; // Píxeles mínimos para cambiar de página
const SWIPE_VELOCITY_THRESHOLD = 0.6; // Velocidad mínima para cambio rápido

let currentPage = 0;
let startX = 0;
let startY = 0;
let currentX = 0;
let isDragging = false;
let startTime = 0;
let isHorizontalSwipe = false;

const slider = document.getElementById('slider');

// Cargar las páginas del menú
function loadPages() {
    for (let i = 1; i <= TOTAL_PAGES; i++) {
        const page = document.createElement('div');
        page.className = 'page';
        
        const img = document.createElement('img');
        img.src = `paginas/pagina ${i}.jpg`;
        img.alt = `Página ${i}`;
        img.draggable = false;
        
        // Debug: Verificar si la imagen carga correctamente
        img.onload = function() {
            console.log(`✅ Imagen ${i} cargada correctamente`);
        };
        
        img.onerror = function() {
            console.error(`❌ Error al cargar: paginas/pagina ${i}.jpg`);
            // Mostrar un mensaje de error visible
            const errorMsg = document.createElement('div');
            errorMsg.style.color = 'white';
            errorMsg.style.fontSize = '20px';
            errorMsg.style.textAlign = 'center';
            errorMsg.textContent = `⚠️ No se pudo cargar: paginas/pagina ${i}.jpg`;
            page.appendChild(errorMsg);
        };
        
        page.appendChild(img);
        slider.appendChild(page);
    }
}

// Función de indicadores eliminada - Solo gestos

// Ir a una página específica
function goToPage(pageIndex) {
    if (pageIndex < 0 || pageIndex >= TOTAL_PAGES) return;
    
    currentPage = pageIndex;
    const offset = -currentPage * 100;
    slider.style.transform = `translateX(${offset}vw)`;
}

// === SISTEMA DE SWIPE CON BAJA SENSIBILIDAD ===

// Detectar inicio del arrastre
function handleStart(e) {
    // Prevenir si es zoom (dos dedos)
    if (e.touches && e.touches.length > 1) return;
    
    isDragging = true;
    isHorizontalSwipe = false;
    startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
    startY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
    currentX = startX;
    startTime = Date.now();
    
    slider.style.transition = 'none';
}

// Detectar movimiento
function handleMove(e) {
    if (!isDragging) return;
    
    // Prevenir si hay zoom activo
    if (e.touches && e.touches.length > 1) {
        isDragging = false;
        return;
    }
    
    currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
    const currentY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
    const diffX = currentX - startX;
    const diffY = currentY - startY;
    
    // Determinar si es swipe horizontal o vertical
    if (!isHorizontalSwipe && Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
        // Si el movimiento horizontal es mayor que el vertical, es un swipe de página
        isHorizontalSwipe = Math.abs(diffX) > Math.abs(diffY);
        
        // Si no es horizontal, cancelar y permitir scroll/zoom nativo
        if (!isHorizontalSwipe) {
            isDragging = false;
            return;
        }
    }
    
    // Si ya determinamos que es horizontal, procesar el swipe
    if (isHorizontalSwipe && Math.abs(diffX) > 10) {
        e.preventDefault();
        
        const currentOffset = -currentPage * 100;
        const dragPercent = (diffX / window.innerWidth) * 100;
        
        // Limitar el arrastre en los extremos
        let newOffset = currentOffset + dragPercent;
        
        if (currentPage === 0 && diffX > 0) {
            // Efecto de rebote al inicio
            newOffset = dragPercent * 0.3;
        } else if (currentPage === TOTAL_PAGES - 1 && diffX < 0) {
            // Efecto de rebote al final
            newOffset = currentOffset + (dragPercent * 0.3);
        }
        
        slider.style.transform = `translateX(${newOffset}vw)`;
    }
}

// Detectar fin del arrastre
function handleEnd(e) {
    if (!isDragging) return;
    
    // Solo procesar si fue un swipe horizontal
    if (!isHorizontalSwipe) {
        isDragging = false;
        return;
    }
    
    isDragging = false;
    slider.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    
    const diff = currentX - startX;
    const diffTime = Date.now() - startTime;
    const velocity = Math.abs(diff) / diffTime;
    
    // LÓGICA DE CAMBIO DE PÁGINA (BAJA SENSIBILIDAD)
    let shouldChangePage = false;
    
    // Requiere MUCHO desplazamiento O velocidad moderada
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
        shouldChangePage = true;
    } else if (Math.abs(diff) > 50 && velocity > SWIPE_VELOCITY_THRESHOLD) {
        shouldChangePage = true;
    }
    
    if (shouldChangePage) {
        if (diff > 0 && currentPage > 0) {
            // Deslizar a la derecha (página anterior)
            goToPage(currentPage - 1);
        } else if (diff < 0 && currentPage < TOTAL_PAGES - 1) {
            // Deslizar a la izquierda (página siguiente)
            goToPage(currentPage + 1);
        } else {
            // Regresar a la página actual
            goToPage(currentPage);
        }
    } else {
        // No cambiar de página, volver a la actual
        goToPage(currentPage);
    }
}

// Event Listeners para touch y mouse
slider.addEventListener('touchstart', handleStart, { passive: true });
slider.addEventListener('touchmove', handleMove, { passive: false });
slider.addEventListener('touchend', handleEnd, { passive: true });

slider.addEventListener('mousedown', handleStart);
document.addEventListener('mousemove', handleMove);
document.addEventListener('mouseup', handleEnd);

// Prevenir el arrastre de imágenes
slider.addEventListener('dragstart', (e) => e.preventDefault());

// Inicializar
loadPages();

console.log('✅ Menú cargado - Usa las flechas o desliza para navegar');
console.log(`📱 Sensibilidad: ${SWIPE_THRESHOLD}px mínimo para cambiar de página`);
