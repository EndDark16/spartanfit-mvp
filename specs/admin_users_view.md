# Spec: Vista de Administración de Usuarios

## 1. Contexto y Objetivos
Proporcionar a los usuarios con rol `ADMIN` una interfaz completa para la gestión de usuarios registrados en el sistema. Esta vista permite visualizar el listado de usuarios de forma paginada, buscar mediante filtros avanzados, y modificar información de perfiles (excepto datos críticos de identidad), así como gestionar roles y estados de cuenta.

## 2. Historias de Usuario
Como Administrador, quiero ver una lista de todos los usuarios registrados con paginación, buscar por nombre, rol, y rangos de edad/peso, y poder editar los perfiles de otros usuarios (cambiar rol, suspender cuenta, actualizar métricas) sin poder alterar su nombre ni correo, para mantener la integridad de los datos de identidad mientras gestiono la plataforma.

## 3. Reglas de Negocio
1. **Autorización:** La ruta de administración (`/admin/users`) y todas las acciones de servidor (Server Actions / APIs) asociadas deben verificar que el usuario autenticado tiene `role === 'ADMIN'`. Si no lo es, redirigir a `/` o mostrar error 403.
2. **Campos Protegidos:** En la edición de usuarios, los campos `name` y `email` son de solo lectura (Read-Only). No se enviarán actualizaciones de estos campos a la base de datos.
3. **Paginación:** La tabla mostrará un máximo de 10 usuarios por página.
4. **Filtros:**
   - Búsqueda por texto parcial en el Nombre.
   - Búsqueda exacta por Rol (Select/Dropdown).
   - Rango de Edad: Slider de 0 a 150 años.
   - Rango de Peso: Slider de 0 a 200 kg.
   - **Usuarios Incompletos:** Cuando se utilicen los sliders de rango de edad o peso, debe haber un Checkbox opcional que diga "Incluir usuarios sin edad/peso especificado". Si está desmarcado, los usuarios con `null` en esos campos no se mostrarán si el filtro está activo.

## 4. Diseño de la Interfaz (UI/UX)
La página se dividirá en tres secciones principales:
- **Header/Filtros (`UserFilters`):** Una barra superior que contiene el buscador de nombre, selector de rol, y los controles para los rangos de edad y peso (Sliders + Checkbox de nulls).
- **Tabla de Datos (`UsersDataGrid`):** Una tabla estructurada que muestre columnas clave: Nombre, Correo, Rol, Edad, Peso, Estado. Incluirá controles de paginación en la parte inferior.
- **Modal de Edición (`AdminEditUserModal`):** Al hacer clic en "Editar" sobre una fila, se abrirá un modal o *slide-over* con el formulario. Los campos de nombre y correo estarán visualmente deshabilitados (`disabled`). Incluirá un botón rojo para "Suspender Cuenta".

## 5. Arquitectura Técnica (Monolito Next.js)

### 5.1. Rutas
- `src/app/admin/users/page.tsx`: Página principal.

### 5.2. Componentes (en `src/components/features/admin/`)
- `AdminUsersView.tsx`: Client Component principal que maneja el estado de los filtros y la paginación.
- `UserFilters.tsx`: Componente para la UI de búsqueda (inputs, sliders).
- `UsersDataGrid.tsx`: Tabla renderizadora de la lista paginada.
- `AdminEditUserModal.tsx`: Formulario de edición con React Hook Form / Zod.

### 5.3. Lógica de Negocio (`src/actions/admin.actions.ts`)
- `getFilteredUsers(filters, page)`: Retorna `users` y `totalCount` aplicando la lógica de búsqueda en Prisma.
  - *Lógica Prisma:* Usará `contains` para nombre, `equals` para rol. Para rangos usará `gte` y `lte`, con lógica condicional de `OR` si el checkbox de "incluir nulls" está activo.
- `updateUserAsAdmin(userId, data)`: Actualiza el perfil en Prisma omitiendo explícitamente el nombre y correo del `data` recibido por seguridad.

## 6. Manejo de Errores y Seguridad
- Las validaciones en `updateUserAsAdmin` usarán Zod y verificarán la sesión del servidor para confirmar privilegios `ADMIN`.
- Se mostrarán Toasts (notificaciones) en caso de éxito o fallo al guardar cambios.
