
document.addEventListener('DOMContentLoaded', async () => {
  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;
  try {
    const res = await fetch('footer.html', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    placeholder.outerHTML = html; // Reemplaza el placeholder por el footer real
  } catch (err) {
    console.error('No se pudo cargar el footer:', err);
  }
});