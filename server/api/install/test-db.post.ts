export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const driver = body?.driver === 'mysql' ? 'mysql' : 'json'

  if (driver !== 'mysql') {
    return { ok: true, message: 'JSON store ready' }
  }

  const result = await testMysqlConnection({
    host: String(body?.host || '127.0.0.1'),
    port: Number(body?.port) || 3306,
    user: String(body?.user || ''),
    password: String(body?.password || ''),
    database: String(body?.database || 'opwatch')
  })
  return result
})
