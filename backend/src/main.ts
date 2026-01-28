import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // MARKER: Aktifkan Validasi Data (agar DTO bekerja)
  app.useGlobalPipes(new ValidationPipe());

  // MARKER: Konfigurasi CORS (Update untuk Deploy)
  app.enableCors({
    // Kita ubah ke '*' agar Frontend Vercel (yang linknya belum kita tahu) bisa akses.
    // Nanti jika sudah production, bisa diganti ke link spesifik Vercel kamu.
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // MARKER: Gunakan Port Dinamis
  // Render akan otomatis mengisi process.env.PORT.
  // Jika di laptop (lokal), dia akan pakai 3000.
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
