import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  Query, // <-- Jangan lupa import Query
} from '@nestjs/common';
import { GamesService } from './games.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('/start')
  startGame(@Request() req) {
    return this.gamesService.startGame(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/score')
  saveScore(
    @Request() req,
    @Body('score') score: number,
    @Body('gameType') gameType: string,
  ) {
    const allowedGames = ['catcher', 'snake', 'quiz'];
    if (!allowedGames.includes(gameType)) {
      throw new BadRequestException(
        'Game Type salah! Pilih: catcher, snake, atau quiz.',
      );
    }
    return this.gamesService.saveScore(req.user.userId, score, gameType);
  }

  // Update di sini: Menerima Query Param ?game=...
  @Get('/leaderboard')
  getLeaderboard(@Query('game') gameType: string) {
    return this.gamesService.getLeaderboard(gameType);
  }
}
