import {
  Injectable,
  BadRequestException,
  NotFoundException, // Tambahan Import penting
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class GamesService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // 1. MULAI GAME (Bayar Tiket)
  async startGame(userId: string) {
    const user = await this.userModel.findById(userId);

    // SOLUSI ERROR: Cek dulu usernya ada atau tidak
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.gameTickets < 1) {
      throw new BadRequestException('Tiket habis! Silakan pilah sampah dulu.');
    }

    user.gameTickets -= 1; // Kurangi 1 tiket
    await user.save();

    return { message: 'Game Start!', remainingTickets: user.gameTickets };
  }

  // 2. SELESAI GAME (Simpan Skor)
  async saveScore(userId: string, score: number) {
    const user = await this.userModel.findById(userId);

    // SOLUSI ERROR: Cek juga di sini
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Cuma update kalau skor baru lebih tinggi (High Score)
    if (score > user.highScore) {
      user.highScore = score;
      await user.save();
      return { message: 'New High Score!', highScore: score };
    }

    return { message: 'Score saved', highScore: user.highScore };
  }

  // 3. LEADERBOARD (Top 10)
  async getLeaderboard() {
    return this.userModel
      .find()
      .sort({ highScore: -1 })
      .limit(10)
      .select('fullName schoolClass highScore activeItem')
      .populate('activeItem');
  }
}
