import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  // API 1: Pakai Tiket (POST /games/start)
  @UseGuards(AuthGuard('jwt'))
  @Post('/start')
  startGame(@Request() req) {
    return this.gamesService.startGame(req.user.userId);
  }

  // API 2: Lapor Skor Akhir (POST /games/score)
  @UseGuards(AuthGuard('jwt'))
  @Post('/score')
  saveScore(@Request() req, @Body('score') score: number) {
    return this.gamesService.saveScore(req.user.userId, score);
  }

  // API 3: Lihat Klasemen (GET /games/leaderboard)
  // Tidak perlu login ketat, biar bisa dilihat siapa saja (opsional)
  @Get('/leaderboard')
  getLeaderboard() {
    return this.gamesService.getLeaderboard();
  }
}
