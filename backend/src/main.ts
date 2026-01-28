import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👇 PERBAIKAN DI SINI
  app.enableCors({
    origin: [
      'https://ijo-ijo-app-587f.vercel.app', // Link Frontend kamu yang error tadi
      'https://ijo-ijo-app.vercel.app', // Link Frontend (kalau ada domain lain)
      'http://localhost:3000', // Buat test di laptop
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Ini wajib true karena frontend kirim credential
  });
  // 👆 SELESAI PERBAIKAN

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
