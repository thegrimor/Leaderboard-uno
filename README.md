# Leaderboard UNO

App para llevar el registro de partidas de UNO de un grupo: jugadores, historial de partidas y
un ranking por victorias.

## Stack

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS v4 + Redux Toolkit
- **Backend**: Node/Express + Postgres (`pg` directo, sin ORM) — carpeta `server/`
- Sin autenticación: tablero compartido, cualquiera puede cargar jugadores y partidas.

## Desarrollo

```bash
npm install
npm run server:install   # una vez, instala deps de server/

npm run dev       # frontend (Vite), http://localhost:5173
npm run server    # backend (Express), http://localhost:8787
```

El backend necesita `server/.env` (copiar de `server/.env.example`) con un `DATABASE_URL`
apuntando a una instancia de Postgres — no arranca sin uno. El esquema (`players`, `matches`,
`match_players`) se crea solo al iniciar (`CREATE TABLE IF NOT EXISTS`, ver `server/src/db.js`).

Vite proxea `/api` hacia `http://localhost:8787` en desarrollo (ver `vite.config.ts`). En
producción el backend puede servir el `dist/` compilado, o el frontend puede desplegarse
aparte apuntando al backend vía `VITE_API_BASE_URL`.

## Comandos

```bash
npm run build     # tsc -b && vite build
npm run lint       # ESLint
npm run preview    # preview del build de producción
```

Ver `CLAUDE.md` para la arquitectura y convenciones del proyecto.
