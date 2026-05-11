# Especificación Técnica: CRUD de Gimnasios y Ciudades

## 1. Objetivo
Implementar un sistema de gestión (CRUD) para Gimnasios y Ciudades, permitiendo a los administradores gestionar estas entidades y a los usuarios seleccionarlas en sus perfiles (relación muchos a muchos).

## 2. Cambios en la Base de Datos (Prisma)

Se deben realizar las siguientes modificaciones en `prisma/schema.prisma`:

### 2.1 Modelo `City` (Nuevo)
```prisma
model City {
  id        String        @id @default(uuid())
  name      String        @unique
  isActive  Boolean       @default(true)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  gyms      GymLocation[]
}
```

### 2.2 Modelo `GymLocation` (Modificación)
```prisma
model GymLocation {
  id        String   @id @default(uuid())
  name      String
  address   String?
  isActive  Boolean  @default(true)
  cityId    String
  city      City     @relation(fields: [cityId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relación a la tabla de rompimiento
  userGyms  UserGym[]
}
```

### 2.3 Modelo `UserGym` (Tabla de rompimiento)
```prisma
model UserGym {
  id            String      @id @default(uuid())
  userId        String
  gymLocationId String
  assignedAt    DateTime    @default(now())

  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  gymLocation   GymLocation @relation(fields: [gymLocationId], references: [id], onDelete: Cascade)

  @@unique([userId, gymLocationId])
}
```

### 2.4 Modelo `User` (Modificación)
Añadir la relación inversa hacia `UserGym`.
```prisma
  // En el modelo User:
  userGyms UserGym[]
```

## 3. Lógica de Negocio (Backend)

*   **Ciudades (`src/actions/city.actions.ts` o `src/services/`):**
    *   `getCities(includeInactive?: boolean)`: Retorna lista de ciudades.
    *   `createCity(data)`: Crea una nueva ciudad.
    *   `updateCity(id, data)`: Modifica nombre.
    *   `toggleCityStatus(id)`: Alterna el `isActive` (Soft Delete).
*   **Gimnasios (`src/actions/gym.actions.ts` o `src/services/`):**
    *   `getGyms(includeInactive?: boolean)`: Retorna gimnasios (incluyendo datos de la ciudad).
    *   `createGym(data)`: Crea un gimnasio.
    *   `updateGym(id, data)`: Actualiza gimnasio.
    *   `toggleGymStatus(id)`: Alterna el `isActive` (Soft Delete).
*   **Usuarios (`src/actions/user.actions.ts`):**
    *   `updateUserGyms(userId, gymIds[])`: Elimina las relaciones actuales en `UserGym` y crea las nuevas según el array recibido.

## 4. Interfaz de Usuario (Frontend)

### 4.1 Panel de Administración
Ambas vistas deben seguir el mismo estilo visual (Data Tables) que `/admin/users`.

*   **`/admin/cities`:**
    *   Tabla de ciudades (Nombre, Estado, Fecha Creación, Acciones).
    *   Botón para crear/editar (abriendo Modal o Drawer).
    *   Botón/Switch para Activar/Desactivar.
*   **`/admin/gyms`:**
    *   Tabla de gimnasios (Nombre, Dirección, Ciudad, Estado, Acciones).
    *   Formulario de creación/edición con un select para elegir la ciudad.

### 4.2 Interfaz de Usuario (Cliente)
*   **Perfil de Usuario:**
    *   Agregar un componente *Multi-Select* o *Checkbox Group* que liste los Gimnasios Activos.
    *   Permitir seleccionar múltiples opciones y guardar.
*   **Flujo de Onboarding (Registro Inicial):**
    *   Añadir este mismo componente de selección de gimnasios en la interfaz inicial como un paso opcional.
