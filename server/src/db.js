import pg from 'pg'

const { Pool } = pg

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error(
    'DATABASE_URL no está definida. Apunta a tu base de datos Postgres (en Railway: la ' +
      'variable que expone el plugin Postgres, referenciada en el servicio del backend).',
  )
}

// Railway's managed Postgres sits behind a self-signed cert chain — require SSL but don't
// verify it. Only relevant for actual remote hosts; a local Postgres in dev has no TLS at all.
const isLocal = /localhost|127\.0\.0\.1/.test(connectionString)
const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
})

// pg's Pool emits 'error' on an *idle* client going bad (the DB restarting, a network
// blip, Railway recycling the connection, ...) — with no listener, Node treats that as an
// unhandled 'error' event and crashes the whole process. A query actively in flight when
// this happens still rejects normally and is handled by asyncHandler; this only stops a
// background idle-connection hiccup from taking the entire backend down with it.
pool.on('error', err => {
  console.error('Error inesperado en una conexión inactiva de Postgres:', err)
})

async function migrate() {
  // `id` columns are TEXT, not UUID — ids are generated with crypto.randomUUID() on the
  // frontend, but nothing enforces that shape, and a strict UUID column would 500 on an id
  // that doesn't happen to parse as one.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      played_at TIMESTAMPTZ NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS match_players (
      match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
      player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      score INTEGER,
      -- La app ya no usa esta columna (ver "Decisión de ranking" en CLAUDE.md) — se deja sin
      -- DROP para no perder los puntajes ya guardados en partidas reales de producción.
      is_winner BOOLEAN NOT NULL DEFAULT false,
      PRIMARY KEY (match_id, player_id)
    );
  `)
  // Añadida después de la primera versión del esquema — ADD COLUMN IF NOT EXISTS para no
  // romper una base ya desplegada donde match_players ya existía sin esta columna.
  await pool.query('ALTER TABLE match_players ADD COLUMN IF NOT EXISTS cards_eaten INTEGER;')
  await pool.query(
    'CREATE INDEX IF NOT EXISTS match_players_player_id_idx ON match_players (player_id);',
  )
  await pool.query(
    'CREATE INDEX IF NOT EXISTS match_players_match_id_idx ON match_players (match_id);',
  )
}

// Awaited once from index.js before the server starts accepting requests, so the very
// first request can never race table creation.
export const ready = migrate()

// Used by the /api/health route — a real round-trip to Postgres, not just "the process is
// running," since that's the failure mode a health check actually needs to catch.
export async function ping() {
  await pool.query('SELECT 1')
}

function mapPlayer(row) {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }
}

function mapMatch(row) {
  return {
    id: row.id,
    playedAt: row.played_at instanceof Date ? row.played_at.toISOString() : row.played_at,
    notes: row.notes,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    players: row.players,
  }
}

const MATCH_SELECT = `
  SELECT m.id, m.played_at, m.notes, m.created_at,
    COALESCE(
      json_agg(
        json_build_object(
          'playerId', mp.player_id,
          'playerName', p.name,
          'cardsEaten', mp.cards_eaten,
          'isWinner', mp.is_winner
        ) ORDER BY mp.is_winner DESC, p.name ASC
      ) FILTER (WHERE mp.player_id IS NOT NULL),
      '[]'
    ) AS players
  FROM matches m
  LEFT JOIN match_players mp ON mp.match_id = m.id
  LEFT JOIN players p ON p.id = mp.player_id
`

export const store = {
  async listPlayers() {
    const { rows } = await pool.query('SELECT * FROM players ORDER BY lower(name) ASC')
    return rows.map(mapPlayer)
  },

  async findPlayerById(id) {
    const { rows } = await pool.query('SELECT * FROM players WHERE id = $1', [id])
    return rows[0] ? mapPlayer(rows[0]) : undefined
  },

  async findPlayerByName(name) {
    const { rows } = await pool.query('SELECT * FROM players WHERE lower(name) = lower($1)', [
      name.trim(),
    ])
    return rows[0] ? mapPlayer(rows[0]) : undefined
  },

  async createPlayer(player) {
    await pool.query('INSERT INTO players (id, name, created_at) VALUES ($1, $2, $3)', [
      player.id,
      player.name,
      player.createdAt,
    ])
    return player
  },

  async renamePlayer(id, name) {
    const { rows } = await pool.query(
      'UPDATE players SET name = $2 WHERE id = $1 RETURNING *',
      [id, name],
    )
    return rows[0] ? mapPlayer(rows[0]) : undefined
  },

  async deletePlayer(id) {
    const { rowCount } = await pool.query('DELETE FROM players WHERE id = $1', [id])
    return rowCount > 0
  },

  async listMatches() {
    const { rows } = await pool.query(`${MATCH_SELECT} GROUP BY m.id ORDER BY m.played_at DESC, m.created_at DESC`)
    return rows.map(mapMatch)
  },

  async findMatchById(id) {
    const { rows } = await pool.query(`${MATCH_SELECT} WHERE m.id = $1 GROUP BY m.id`, [id])
    return rows[0] ? mapMatch(rows[0]) : undefined
  },

  async createMatch(match) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(
        'INSERT INTO matches (id, played_at, notes, created_at) VALUES ($1, $2, $3, $4)',
        [match.id, match.playedAt, match.notes ?? null, match.createdAt],
      )
      for (const player of match.players) {
        await client.query(
          'INSERT INTO match_players (match_id, player_id, is_winner, cards_eaten) VALUES ($1, $2, $3, $4)',
          [match.id, player.playerId, player.isWinner, player.cardsEaten ?? null],
        )
      }
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
    return this.findMatchById(match.id)
  },

  async deleteMatch(id) {
    const { rowCount } = await pool.query('DELETE FROM matches WHERE id = $1', [id])
    return rowCount > 0
  },

  async leaderboard() {
    const { rows } = await pool.query(`
      SELECT p.id AS player_id, p.name,
        COUNT(mp.match_id) AS matches_played,
        COUNT(mp.match_id) FILTER (WHERE mp.is_winner) AS wins,
        COALESCE(SUM(mp.cards_eaten), 0) AS total_cards_eaten
      FROM players p
      LEFT JOIN match_players mp ON mp.player_id = p.id
      GROUP BY p.id, p.name
      ORDER BY wins DESC, matches_played DESC, lower(p.name) ASC
    `)
    return rows.map(row => {
      const matchesPlayed = Number(row.matches_played)
      const wins = Number(row.wins)
      return {
        playerId: row.player_id,
        playerName: row.name,
        matchesPlayed,
        wins,
        totalCardsEaten: Number(row.total_cards_eaten),
        winRate: matchesPlayed > 0 ? wins / matchesPlayed : 0,
      }
    })
  },

  // Récord absoluto: quién se comió más cartas en una única partida, y en cuál. No es una
  // métrica de ranking (no ordena a los jugadores), es un dato suelto tipo "salón de la fama".
  async cardsRecord() {
    const { rows } = await pool.query(`
      SELECT mp.player_id, p.name, mp.cards_eaten, mp.match_id, m.played_at
      FROM match_players mp
      JOIN players p ON p.id = mp.player_id
      JOIN matches m ON m.id = mp.match_id
      WHERE mp.cards_eaten IS NOT NULL
      ORDER BY mp.cards_eaten DESC, m.played_at DESC
      LIMIT 1
    `)
    const row = rows[0]
    if (!row) return null
    return {
      playerId: row.player_id,
      playerName: row.name,
      cardsEaten: Number(row.cards_eaten),
      matchId: row.match_id,
      playedAt: row.played_at instanceof Date ? row.played_at.toISOString() : row.played_at,
    }
  },
}
