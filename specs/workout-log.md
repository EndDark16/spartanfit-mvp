# Spec: Registro de Historial de Entrenamiento

## 1. Descripción de la Funcionalidad
El sistema permitirá a los usuarios registrar su historial de entrenamientos, capturando la fecha/hora, el ejercicio, series, repeticiones y peso levantado. En el dashboard principal, los usuarios podrán visualizar múltiples gráficas de progreso (una por cada ejercicio), ordenadas descendentemente por el ejercicio donde levanten mayor peso. Además, se implementará un catálogo base de ejercicios gestionable por un administrador.

## 2. Modelado de Datos (Prisma)
### Nuevas Entidades y Modificaciones
- **`Exercise` (Nuevo)**: Catálogo de ejercicios.
  - `id` (String, UUID)
  - `name` (String, Unique)
  - `isActive` (Boolean, Default: true)
  - `createdAt`, `updatedAt`

- **`WorkoutLog` (Modificación)**: Reemplazar el campo String por la relación con `Exercise` y añadir `sets`.
  - `exerciseId` (String, Foreign Key a `Exercise`)
  - `sets` (Int) - Nuevo campo.
  - *Mantiene:* `weightLoad`, `reps`, `recordedAt`, `userId`.

### Datos Semilla (Seed)
Inicializar la tabla `Exercise` con:
- Bench press (bar), Squat, Deadlift (bar), Militar press (dumbell), Triceps extension, Leg Press, Leg extension, Lateral raises (dumbell), bulgarian squat, Inclined bench press (bar), Seated row, Bent over row.

## 3. Arquitectura Backend (Server Actions)
- `exercise.actions.ts`: 
  - `getExercises()`: Obtener todos los ejercicios activos.
  - `createExercise(name)`, `updateExercise(id, data)`, `deleteExercise(id)` (Soft delete).
- `workout.actions.ts`:
  - `addWorkoutLog(data)`: Insertar un nuevo log.
  - `getUserWorkoutProgress(userId)`: Agrupar `WorkoutLog` por usuario, ejercicio y fecha (extrayendo el `weightLoad` máximo por día), ordenado por el peso máximo absoluto del ejercicio.

## 4. Arquitectura Frontend (React / Tailwind)
- **Dashboard UI (`app/dashboard/page.tsx` y subcomponentes)**:
  - Botón "Agregar Entrenamiento" que despliega un Modal / Sheet.
  - Formulario con campos: Date/Time Picker (defecto: actual), Select de Ejercicios, Sets, Reps, Peso.
  - Visualización de múltiples gráficas de línea (Recharts). Cada gráfica iterará sobre el progreso de un ejercicio.
- **Admin UI (`app/admin/exercises/page.tsx`)**:
  - Tabla CRUD para gestión de ejercicios con borrado lógico.
