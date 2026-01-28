import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config'; // 1. Import ConfigModule
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User, UserSchema } from './schemas/user.schema';
import { Item, ItemSchema } from './schemas/item.schema';
import { AuthModule } from './auth/auth.module';
import { ItemsModule } from './items/items.module';
import { GarbageModule } from './garbage/garbage.module';
import { GamesModule } from './games/games.module';
import { ContentModule } from './content/content.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // 2. Load ConfigModule agar bisa baca file .env
    ConfigModule.forRoot({
      isGlobal: true, // Agar bisa dipakai di module lain tanpa import ulang
    }),

    // 3. Ubah koneksi DB jadi dinamis
    // Jika ada di ENV (saat deploy), pakai ENV. Jika tidak (lokal), pakai localhost.
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/ijo2_db',
    ),

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Item.name, schema: ItemSchema },
    ]),
    AuthModule,
    ItemsModule,
    GarbageModule,
    GamesModule,
    ContentModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
