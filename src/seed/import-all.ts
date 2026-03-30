import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { seedBaseData } from './seed-base-data'
import { importAdmiralCaviar } from './import-admiral-caviar'
import { importVelsoro } from './import-velsoro'
import { importCasinettoCarputo } from './import-casinetto-caputo'

async function main() {
  const payload = await getPayload({ config })

  console.log('\n╔═══════════════════════════════════╗')
  console.log('║  Delicious Planet – Seed Import   ║')
  console.log('╚═══════════════════════════════════╝')

  await seedBaseData(payload)
  await importAdmiralCaviar(payload)
  await importVelsoro(payload)
  await importCasinettoCarputo(payload)

  console.log('\n🎉 All imports complete.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
