# Especificación Técnica: CRUD de Perfil de Usuario

## 1. Objetivo General
Implementar el flujo completo para que un usuario pueda gestionar su propio perfil dentro de la aplicación. Esto incluye el registro de información física y de ubicación, la edición de dichos datos y la capacidad de realizar una eliminación lógica (soft delete) de su cuenta, cambiándola a un estado de "suspendida".

## 2. Modelo de Datos (Base de Datos)
Se requiere actualizar el esquema de Prisma (`schema.prisma`) para soportar los nuevos campos del usuario y el catálogo de roles.

### 2.1. Nuevo Modelo: `Role`
- `id`: Identificador único (String/UUID o Int).
- `name`: Nombre del rol (ej. "ENTRENADOR", "ATLETA").
- `createdAt` / `updatedAt`: Fechas de auditoría.

### 2.2. Actualización del Modelo: `User` (o equivalente)
Se deben añadir los siguientes campos:
- `age` (Int?): Edad del usuario.
- `weight` (Float?): Peso del usuario.
- `height` (Float?): Altura del usuario.
- `activityIndex` (Int?): Índice de actividad en una escala del 1 al 10.
- `goal` (String?): Meta principal del usuario.
- `gymLocationId` (Relación): Llave foránea hacia la entidad de la sucursal/gimnasio.
- `roleId` (Relación): Llave foránea hacia el modelo `Role`.
- `status` (Enum o String): Estado de la cuenta, por defecto "ACTIVE". Cuando el usuario elimina su cuenta, pasará a "SUSPENDED".

## 3. Flujos de Interfaz (Frontend / UX)

### 3.1. Flujo de Registro (Onboarding)
- Durante el registro o el primer inicio de sesión, el sistema debe solicitar al usuario que seleccione su **Rol** (Entrenador o Atleta).
- También se le deben solicitar los datos obligatorios de perfil: Edad, peso, altura, índice de actividad, meta (goal) y ubicación del gimnasio (GymLocation).

### 3.2. Flujo de Edición de Perfil (Mi Perfil)
- El usuario podrá acceder a la vista de "Mi Perfil".
- **Campos Editables:** Nombre (y/o apellidos), `age`, `weight`, `height`, `activityIndex`, `goal` y `gymLocationId`.
- **Campos de Solo Lectura:** El `role` del usuario se mostrará en pantalla únicamente a modo informativo; no podrá ser modificado por el usuario desde esta vista.

### 3.3. Flujo de Eliminación de Cuenta (Soft Delete)
- En la sección de configuración del perfil, existirá un botón claramente visible etiquetado como "Eliminar cuenta".
- **Confirmación:** Al hacer clic, se mostrará un prompt o alerta nativa del navegador (ej. `window.confirm("¿Estás seguro de que deseas eliminar tu cuenta?")`).
- **Acción:** Si el usuario confirma, se enviará la petición al backend para cambiar el `status` del usuario a "SUSPENDED". 
- Inmediatamente después, el sistema cerrará la sesión actual del usuario (logout) y lo redirigirá a la pantalla de inicio o login.

### 3.4. Bloqueo de Acceso (Cuenta Suspendida)
- Si un usuario cuyo `status` es "SUSPENDED" intenta iniciar sesión, la verificación en el servidor o middleware detectará el estado.
- El frontend no le permitirá el acceso a rutas protegidas y mostrará un modal o mensaje de error indicando: **"Cuenta suspendida"**.

## 4. Consideraciones Técnicas
- **Next.js (App Router):** Se crearán o actualizarán Server Actions / API Routes para manejar la actualización segura de los datos y el cambio de estado (soft delete).
- **Validaciones:** Se debe validar que `activityIndex` esté siempre en el rango de 1 a 10.
- **Seguridad (RLS / Middleware):** Asegurarse de que un usuario solo pueda actualizar sus propios datos mediante la verificación de la sesión actual de Supabase.
