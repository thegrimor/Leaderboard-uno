# CLAUDE.md — UNO Office Edition

Reglas y convenciones para el agente en este proyecto.

## Contexto del proyecto

App para un grupo de amigos que registra partidas de UNO: jugadores, historial de partidas y un
ranking ordenado por victorias / % de victorias. **Sin autenticación** — es un tablero
compartido, cualquiera que entre a la app puede cargar jugadores y partidas. Si en el futuro se
necesita separar por grupos/cuentas, eso implica añadir auth (ver `cogitador-consulta` como
referencia de ese patrón) — no está planificado por ahora.

Sigue la misma línea de stack y estructura que `cogitador-react`/`cogitador-consulta`: DDD-lite
por módulos en el frontend, Express + Postgres sin ORM en el backend.

## Stack

- **React 19** + **Vite** + **TypeScript** (strict mode)
- **Tailwind CSS v4** (config vía `@theme` en `src/index.css`, plugin `@tailwindcss/vite`)
- **Redux Toolkit** + `react-redux` — cada módulo tiene su slice con `createAsyncThunk` que
  pega directo al backend (no hay redux-persist: no hay datos locales que persistir, todo vive
  en Postgres y se refresca con cada fetch)
- **Sin React Router** — navegación con tab state en `App.tsx` (3 tabs: Ranking/Partidas/Jugadores)
- **Backend**: Node/Express + `pg` directo (sin ORM), mismo patrón que `cogitador-consulta/server`

## Estructura de proyecto

```
src/
  core/
    api/
      client.ts        # apiFetch<T> genérico + ApiError — base URL vía VITE_API_BASE_URL
    store/
      store.ts          # combina los 3 reducers de módulo
      hooks.ts           # useAppDispatch, useAppSelector (tipados)
  modules/
    jugadores/
      components/        # JugadoresView, AddPlayerForm, PlayerCard
      services/           # jugadoresApi.ts (fetch al backend), jugadoresSlice.ts (thunks)
      types/               # Player, JugadoresState
      index.ts             # barrel export
    partidas/
      components/         # PartidasView (con filtro de fechas Desde/Hasta, client-side sobre
                            # los datos ya cargados), AddMatchModal (alta con N jugadores +
                            # cartas comidas + ganador), MatchCard
      services/            # partidasApi.ts, partidasSlice.ts
      types/                 # Match, MatchPlayerEntry, NewMatchInput
      index.ts
    leaderboard/
      components/           # LeaderboardView, LeaderboardTable
      services/              # leaderboardApi.ts, leaderboardSlice.ts (solo lectura)
      types/                  # LeaderboardEntry
      index.ts
  shared/
    components/
      TabBar/               # navegación inferior, 3 tabs fijos
      Modal/                 # portal a document.body
      ConfirmModal/           # confirmación de borrado
  App.tsx                    # tab state + header, renderiza la vista activa + TabBar
  main.tsx
  index.css                  # tema Tailwind v4 (paleta UNO: red/yellow/green/blue)
server/
  src/
    db.js               # Pool de pg, CREATE TABLE IF NOT EXISTS, objeto `store` con las queries
    index.js             # Express app, monta las 3 rutas, sirve dist/ si existe
    asyncHandler.js       # envuelve handlers async para que los rechazos lleguen al error middleware
    routes/
      players.js          # GET/POST /api/players, PATCH/DELETE /api/players/:id
      matches.js            # GET/POST /api/matches, DELETE /api/matches/:id
      leaderboard.js         # GET /api/leaderboard (agregación SQL, solo lectura)
```

Los módulos son independientes entre sí. Solo se importa desde el `index.ts` de cada módulo,
nunca directamente desde sus carpetas internas (p. ej. `PartidasView` importa `fetchPlayers`
desde `@/modules/jugadores`, no desde `@/modules/jugadores/services/jugadoresSlice`).

## Modelo de datos

- **`players`**: `{id, name, createdAt}`. Nombre único (case-insensitive), validado en
  `server/src/routes/players.js`.
- **`matches`**: `{id, playedAt, notes, createdAt}` + **`match_players`** (tabla puente):
  `{matchId, playerId, cardsEaten, isWinner}`. Una partida tiene N jugadores (mínimo 2); cada
  uno con unas cartas comidas opcionales (nullable — no todas las partidas lo registran) y
  exactamente uno marcado `isWinner`. El ganador se marca explícitamente en el formulario de
  alta, nunca derivado de otro dato. `cards_eaten` se añadió con
  `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` en `migrate()` (no se recreó la tabla), porque ya
  había bases desplegadas con el esquema anterior.
- La tabla `match_players` todavía tiene una columna `score` en Postgres (de una versión
  anterior de la app que sí guardaba puntaje) — **deliberadamente sin `DROP`**, para no perder
  los puntajes de partidas reales ya guardadas en producción. La app ya no la lee ni la escribe
  (no está en `MATCH_SELECT`, ni en el `INSERT` de `createMatch`, ni en `leaderboard()`); es un
  campo muerto a nivel de aplicación, solo persiste como dato histórico en la base.
- Borrar un jugador (`ON DELETE CASCADE` en `match_players.player_id`) le borra su fila de las
  partidas donde jugó, pero **no borra la partida en sí** si quedan otros jugadores — el
  historial de los demás participantes se conserva.
- El ranking (`GET /api/leaderboard`) se calcula con una sola query de agregación SQL en
  `server/src/db.js` (`store.leaderboard()`) — no hay una tabla de ranking cacheada, se recalcula
  en cada fetch. Ordenado por `wins DESC, matchesPlayed DESC, name ASC` (ver decisión de
  ranking abajo). La misma respuesta incluye `cardsRecord` (`store.cardsRecord()`): el jugador
  que más cartas se comió en una única partida, en todo el historial — no es parte del ranking
  (no ordena jugadores), es un dato suelto tipo "salón de la fama" que se muestra como banner en
  `LeaderboardView`.

### Decisión de ranking

Se eligió ordenar por **victorias absolutas** (con % de victorias como columna secundaria), no
por Elo ni por puntaje acumulado — más simple de calcular y de entender para un grupo chico de
amigos. La app deliberadamente no guarda puntaje por partida (ver nota sobre la columna `score`
muerta arriba): solo victoria/derrota y cartas comidas. Si en el futuro se quiere cambiar la
métrica de ranking, el único lugar que toca tocar es `store.leaderboard()` en `server/src/db.js`
(la query SQL) — el frontend simplemente renderiza lo que venga en `LeaderboardEntry[]`.

## Diseño — Mobile First

Pensada principalmente para móvil: layout de una sola columna (`max-w-lg` centrado), `TabBar`
inferior fija, formularios con inputs grandes. Paleta con los 4 colores de las cartas UNO
(`--color-uno-red/yellow/green/blue`) sobre fondo oscuro. Fuentes: Poppins (`font-display`,
títulos) + Inter (body). Sin PWA por ahora (no configurada, a diferencia de `cogitador-consulta`).

## Redux Store

```typescript
// src/core/store/store.ts — sin persistencia local, todo se refresca desde el backend
configureStore({
  reducer: {
    jugadores: jugadoresReducer,
    partidas: partidasReducer,
    leaderboard: leaderboardReducer,
  },
})
```

Cada slice sigue el mismo patrón: `status: 'idle'|'loading'|'succeeded'|'error'`, thunks con
`createAsyncThunk` que llaman a su `xxxApi.ts`, y un `error` de tipo string legible para mostrar
en la UI. Usar siempre `useAppDispatch`/`useAppSelector` de `src/core/store/hooks.ts`.

## Backend (`server/`)

Mismo patrón que `cogitador-consulta/server`: Express + `pg` directo (sin ORM), esquema creado
con `CREATE TABLE IF NOT EXISTS` al boot (`ready` exportado desde `db.js`, esperado antes de
`app.listen`), `pool.on('error', ...)` para que una conexión inactiva que se cae no tumbe el
proceso entero, `asyncHandler` envolviendo cada ruta async. **Sin auth** — todas las rutas son
públicas, no hay `requireAuth` ni tabla `users`.

- `GET /api/health` → `{status: 'ok'}`, con un `SELECT 1` real contra Postgres.
- `GET/POST /api/players`, `PATCH/DELETE /api/players/:id`
- `GET/POST /api/matches`, `DELETE /api/matches/:id`
- `GET /api/leaderboard`

`DATABASE_URL` es obligatoria (el proceso no arranca sin ella). `CORS_ORIGIN` solo importa
cuando el frontend se despliega en un dominio distinto al backend — ver `server/.env.example`.

## Convenciones de código

- **Componentes**: PascalCase (`MyComponent.tsx`)
- **Hooks, utils, services, types**: camelCase
- **Imports**: siempre con path alias `@/` (ej: `@/modules/partidas`)
- **Estilos**: Tailwind utility classes — sin CSS modules, sin CSS-in-JS
- **Exports desde módulos**: solo a través del `index.ts` del módulo

## Comportamiento del agente

### Cambio de contexto entre módulos
Antes de tocar archivos de un módulo diferente al que se está trabajando, pausar y consultar al
usuario.

### Errores de build o TypeScript
Si aparece un error de build, TypeScript o lint, notificar al usuario con el error y los
posibles pasos antes de actuar. No corregir de forma autónoma.

### Git — esperar confirmación explícita
El agente nunca hace `git add`, `git commit`, `git push` ni ninguna operación git sin que el
usuario lo pida explícitamente.

### No asumir aprobación por silencio
Prohibido el "si no me corriges, sigo adelante". Esperar confirmación explícita antes de
ejecutar cambios planteados como opciones.

## Output Rules
- Respuestas concisas, sin preámbulos.
- Solo el bloque de código modificado, no el archivo completo.
- TypeScript estricto, sin `any`.
