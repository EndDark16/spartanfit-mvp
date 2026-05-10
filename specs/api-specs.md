# Especificaciones de la API para el MVP

1. **Autenticación y Perfil:**
   - `POST /api/users`: Create a new user with their initial goals.
   - `GET /api/users/{id}`: Get user profile.

2. **Módulo de Tracking:**
   - `POST /api/metrics`: Save weight and height.
   - `POST /api/workouts`: Save weight and reps.
   - `GET /api/dashboard/{userId}`: Get metrics and weight history.

3. **Coach Proactivo:**
   - `POST /api/chat`: Send message and get response from LLM.
   - `CRON /api/coach/proactive-trigger`: Scheduled task that evaluates the last `WorkoutLog` of the user and decides if it should send a proactive message (ej. "How did you feel about the weight in yesterday's session?").