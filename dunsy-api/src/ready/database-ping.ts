import postgres from 'postgres'

export type DatabaseReadiness = 'ok' | 'unconfigured' | 'error'

export const pingDatabase = async (): Promise<DatabaseReadiness> => {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL
  if (!url) return 'unconfigured'

  const sql = postgres(url, { max: 1, prepare: false, connect_timeout: 5 })
  try {
    await sql`select 1`
    return 'ok'
  } catch {
    return 'error'
  } finally {
    await sql.end({ timeout: 2 })
  }
}
