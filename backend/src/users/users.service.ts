import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // 1. Ambil Semua User (Kecuali Admin)
  async findAllUsers() {
    return this.userModel
      .find({ role: 'student' }) // Hanya ambil siswa
      .select('-passwordHash') // Jangan tampilkan password
      .sort({ createdAt: -1 }) // Yang baru daftar paling atas
      .exec();
  }

  // 2. Approve / Reject User
  async updateUserStatus(userId: string, status: 'active' | 'rejected') {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { status: status },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return {
      message: `User berhasil diubah statusnya menjadi ${status}`,
      user,
    };
  }

  // 3. Delete User (Opsional)
  async deleteUser(userId: string) {
    return this.userModel.findByIdAndDelete(userId);
  }
}
