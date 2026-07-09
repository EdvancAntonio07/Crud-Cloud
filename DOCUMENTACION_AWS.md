# 📚 Documentación del Proyecto: Aplicación Web Multi-Nube

¡Bienvenido a la documentación de nuestro sistema! Hemos construido una aplicación súper robusta, similar a cómo se diseñan las plataformas de las grandes empresas tecnológicas (como Netflix o Amazon), pero explicada de forma sencilla y fácil de entender.

---

## 🎯 ¿De qué trata el proyecto?
Es un sistema para gestionar clientes (crear, leer, actualizar y borrar). Lo especial de este proyecto **no es la aplicación en sí, sino dónde vive y cómo sobrevive a los problemas**. 

En lugar de tener una sola computadora (servidor) guardando todo, usamos dos gigantes de internet: **Amazon Web Services (AWS)** y **Supabase** (Multi-Nube) para asegurar que el sistema sea invencible y nunca se apague.

---

## 🗺️ Diagrama de la Arquitectura (Cómo funciona)

```mermaid
graph TD
    %% Estilos
    classDef usuario fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef aws fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff;
    classDef balancer fill:#8C4FFF,stroke:#232F3E,stroke-width:2px,color:#fff;
    classDef frontend fill:#10B981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef backend fill:#3B82F6,stroke:#1D4ED8,stroke-width:2px,color:#fff;
    classDef db fill:#10B981,stroke:#047857,stroke-width:2px,color:#fff;

    Usuario((👤 Tú y los <br>Usuarios)):::usuario
    
    subgraph Nube de Amazon AWS
        ALB{🔀 Balanceador <br>de Carga}:::balancer
        
        subgraph Capa Visual - Frontend
            F1[🖥️ Computadora <br>Frontend 1]:::frontend
            F2[🖥️ Computadora <br>Frontend 2 <br> Auto-Clonada]:::frontend
        end
        
        subgraph Capa Lógica - Backend
            B1[⚙️ Computadora <br>Backend 1]:::backend
            B2[⚙️ Computadora <br>Backend 2 <br> Auto-Clonada]:::backend
        end
    end
    
    subgraph Nube de Supabase
        DB[(🗄️ Base de Datos)]:::db
    end

    %% Conexiones
    Usuario ==>|Entra a la página web| ALB
    ALB ==>|Reparte a los visitantes| F1
    ALB -.->|Si hay mucha gente| F2
    
    F1 ==>|Pide buscar información| ALB
    F2 -.->|Pide buscar información| ALB
    
    ALB ==>|Le pasa el trabajo a| B1
    ALB -.->|Le pasa el trabajo a| B2
    
    B1 ==>|Guarda los clientes en| DB
    B2 -.->|Guarda los clientes en| DB
```

---

## 🧩 Las Piezas del Rompecabezas

### 1. El Director de Orquesta: El Balanceador de Carga
Imagínalo como el recepcionista de un restaurante muy concurrido. Cuando un cliente llega, el recepcionista mira qué camarero está más desocupado y se lo asigna. Si llega mucha gente de golpe, se encarga de repartir a los clientes en partes iguales (50% y 50%) para que ningún camarero colapse de estrés.

### 2. Los Camareros: El Frontend (React)
Son las "caras bonitas" del sistema. Son las pequeñas computadoras encargadas de dibujar los botones, colores y tablas en la pantalla de tu celular o PC. No hacen cálculos pesados, solo te muestran la información de manera elegante y toman tus órdenes.

### 3. Los Cocineros: El Backend (Django/Python)
Estos no se ven, pero hacen el trabajo pesado. Cuando tú guardas un nuevo cliente en la pantalla, el camarero (Frontend) le pasa el pedido al cocinero (Backend). El Backend revisa que los datos estén correctos, hace los cálculos de seguridad, y se va corriendo a guardarlos en la bodega.

### 4. La Bóveda Blindada: Supabase (Base de Datos)
Es la caja fuerte donde viven todos los datos reales (los nombres, teléfonos y estados de los clientes). No está en Amazon, sino en otra nube especializada, lo que llamamos una arquitectura **Multi-Nube**.

---

## 🚀 El Súper Poder: Auto-Clonación (Auto Scaling)

¿Qué pasa si tu página se hace famosa y entran miles de personas al mismo tiempo? En el pasado, la computadora se hubiese incendiado y la página web se habría caído mostrando la clásica pantalla blanca de error.

Con nuestro sistema, implementamos **magia de auto-preservación**:
1. Hay un "vigilante de seguridad" virtual mirando constantemente el corazón de las computadoras.
2. Si el vigilante nota que una computadora está sudando mucho (alcanza su límite de esfuerzo o "CPU"), hace sonar una alarma.
3. Automáticamente, la nube **clona (crea una copia exacta)** de tu computadora en menos de 3 minutos.
4. El Balanceador de Carga ve al nuevo clon e inmediatamente le empieza a enviar la mitad de los visitantes.
5. ¡Ambos clones respiran tranquilos y tu página nunca se cae!
6. Cuando los visitantes se van y ya no hay tráfico, AWS borra al clon automáticamente para **ahorrarte dinero**.

## 🛡️ Inmune a Desastres (Zonas de Disponibilidad)
En el mundo real, los edificios de servidores pueden quedarse sin electricidad o incendiarse. Nosotros configuramos la aplicación para que funcione en dos "Zonas" separadas (`us-east-1a` y `us-east-1b`). Esto significa que la computadora original y su clon están físicamente en **ciudades o edificios distintos**. Si cae un rayo en un edificio, el otro asume todo el trabajo en un milisegundo y el usuario nunca se entera del accidente.

## 📊 El Monitor de Estrés Visual
Hemos integrado un monitor interactivo al final de nuestra página web. Al presionar "Iniciar Test", enviamos un ataque simulado de cientos de clicks por minuto. Esto te permite observar visualmente, mediante barras de progreso azules y verdes, cómo nace una nueva computadora clonada y cómo el Balanceador de Carga empieza a repartir mágicamente el peso entre las dos.
