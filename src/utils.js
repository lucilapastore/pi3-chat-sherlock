// Funciones puras del frontend (transformación de datos), fáciles de testear.

export const ROUTES = ['/home', '/chat', '/about'];
export const DEFAULT_ROUTE = '/home';

// Normaliza un pathname a una ruta conocida ('/' y desconocidas -> /home).
export function resolveRoute(pathname) {
  const clean = (pathname || '/').replace(/\/+$/, '') || '/';
  return ROUTES.includes(clean) ? clean : DEFAULT_ROUTE;
}
