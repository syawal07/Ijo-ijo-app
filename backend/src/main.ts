import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'https://ijo-ijo-app-587f.vercel.app', // Frontend Vercel 1
      'https://ijo-ijo-app.vercel.app', // Frontend Vercel 2
      'http://localhost:3000', // Backend/Frontend Local (Port 3000)
      'http://localhost:3001', // 👇 INI YANG PENTING (Frontend Local kamu sekarang)
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
