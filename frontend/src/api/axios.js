/**
 * axios.js — Cliente HTTP configurado
 *
 * Aquí configuramos la URL base de la API de Django.
 * Todos los componentes importan este cliente en vez de usar
 * fetch() directo, para no repetir la URL en cada archivo.
 */

import axios from 'axios';

const api = axios.create({
  // Ruta relativa: el ALB intercepta /api/* y lo enruta
  // al Backend Target Group (contenedores Django en ECS Fargate).
  // Funciona igual en local (Nginx proxy) y en la Nube con ALB.
  baseURL: '/api',
  // Cabecera por defecto para todas las peticiones
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos máximo de espera
});

export default api;
