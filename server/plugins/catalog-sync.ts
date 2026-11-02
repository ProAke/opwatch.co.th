import { isInstalled } from '../utils/config'
import { useStore } from '../utils/store'
import { syncOfficialCatalog } from '../utils/seed'

export default defineNitroPlugin(async () => {
  if (!isInstalled()) return
  try {
    const store = useStore()
    const res = await syncOfficialCatalog(store)
    if (res.synced > 0 || res.removedLegacy > 0) {
      console.log(
        `[opwatch] Official catalog synchronized: +${res.synced} synced, -${res.removedLegacy} legacy purged (${res.total} active timepieces)`
      )
    }
  } catch (err) {
    console.error('[opwatch] Startup catalog sync warning:', err)
  }
})
