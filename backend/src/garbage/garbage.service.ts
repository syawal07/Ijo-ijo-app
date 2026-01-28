import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class GarbageService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // LOGIC: User scan sampah -> Dapat Koin & Tiket
  async scanTrash(userId: string, trashCategory: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // ATURAN GAME:
    // 1 Sampah = 10 Koin
    // 30 Koin = Otomatis jadi 1 Tiket Game (Opsional, nanti bisa diatur di Frontend)

    const rewardCoins = 10;

    user.ijoCoins += rewardCoins;

    // Logika Bonus: Jika koin sudah banyak, tukar jadi tiket game
    if (user.ijoCoins >= 30) {
      user.gameTickets += 1;
      user.ijoCoins -= 30; // Potong koin, ganti tiket
    }

    await user.save();

    return {
      message: 'Sampah berhasil dipilah!',
      category: trashCategory,
      newCoinBalance: user.ijoCoins,
      tickets: user.gameTickets,
      reward: `+${rewardCoins} Coins`,
    };
  }
}
