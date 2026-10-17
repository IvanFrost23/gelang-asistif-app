import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'id.ac.unesa.gelangasistif',
  appName: 'Gelang Asistif',
  webDir: 'dist',
  zoomEnabled: false,
  android: { allowMixedContent: false },
  server: { androidScheme: 'https' },
}

export default config
