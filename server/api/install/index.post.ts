export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = await runInstall(body)
  if (!result.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: 'install.installFailed',
      data: { errors: result.errors, warnings: result.warnings }
    })
  }
  return {
    ok: true,
    warnings: result.warnings,
    site: result.config?.site,
    installedAt: result.config?.installedAt
  }
})
