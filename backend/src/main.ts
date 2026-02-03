import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      // 👇 TAMBAHKAN LINK FRONTEND BARU DI SINI (Tanpa garis miring '/' di belakang)
      'https://ijo-ijo-app-4hkg.vercel.app',

      // Link Production/Utama (Tetap simpan)
      'https://ijo-ijo-app.vercel.app',

      // Link Localhost (Biar coding di laptop tetap jalan)
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
