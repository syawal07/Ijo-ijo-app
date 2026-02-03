import {
  Injectable,
  BadRequestException,
  NotFoundException,
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

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.gameTickets < 1) {
      throw new BadRequestException('Tiket habis! Silakan pilah sampah dulu.');
    }

    user.gameTickets -= 1;
    await user.save();

    return { message: 'Game Start!', remainingTickets: user.gameTickets };
  }

  // 2. SELESAI GAME (Simpan Skor ke Dompet Spesifik)
  async saveScore(userId: string, newScore: number, gameType: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Pastikan object gameScores ada (jaga-jaga user lama)
    if (!user.gameScores) {
      user.gameScores = { catcher: 0, snake: 0, quiz: 0 };
    }

    // Ambil skor lama dari dompet yang sesuai (misal: user.gameScores.snake)
    const currentScore = user.gameScores[gameType] || 0;

    let message = 'Score saved (No new record)';

    // Cek apakah skor baru lebih tinggi?
    if (newScore > currentScore) {
      // Update dompet spesifik
      user.gameScores[gameType] = newScore;

      // Hitung ulang Total Score (Kalkulator Global Rank)
      user.totalScore =
        user.gameScores.catcher + user.gameScores.snake + user.gameScores.quiz;

      // Penting: Beri tahu Mongoose bahwa field object ini berubah
      user.markModified('gameScores');

      await user.save();
      message = `New High Score for ${gameType}!`;
    }

    return {
      message: message,
      gameType: gameType,
      yourScore: newScore,
      totalGlobalScore: user.totalScore, // Balikin total skor buat update UI
    };
  }

  // 3. LEADERBOARD (Top 10 Global atau Per Game)
  async getLeaderboard(gameType: string = 'all') {
    // Default sort: Total Score
    let sortCriteria: any = { totalScore: -1 };

    // Jika user pilih game spesifik (misal: 'snake'), sort berdasarkan skorr game itu
    if (gameType && gameType !== 'all') {
      sortCriteria = { [`gameScores.${gameType}`]: -1 }; // Syntax dinamis mongodb
    }

    return this.userModel
      .find()
      .sort(sortCriteria)
      .limit(10)
      .select('fullName schoolClass totalScore gameScores activeItem')
      .populate('activeItem');
  }
}
