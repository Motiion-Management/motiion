import { defineApp } from 'convex/server'
import migrations from '@convex-dev/migrations/convex.config'

const app = defineApp() as any
app.use(migrations)

export default app
