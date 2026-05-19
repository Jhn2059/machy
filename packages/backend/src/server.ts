import app from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`[machy-api] Servidor corriendo en http://localhost:${env.PORT}`);
  console.log(`[machy-api] Entorno: ${env.NODE_ENV}`);
});
