import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item, ItemDocument } from '../schemas/item.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateItemDto } from './dto/create-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // MARKER: Fungsi Memilih Karakter Awal
  async create(userId: string, createItemDto: CreateItemDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.activeItem) {
      throw new BadRequestException('User already has an active item!');
    }

    const newItem = new this.itemModel({
      ...createItemDto,
      level: 1,
      currentXp: 0,
      nextLevelXp: 100,
      lastCheckIn: null,
    });
    const savedItem = await newItem.save();

    await this.userModel.findByIdAndUpdate(userId, {
      activeItem: (savedItem as any)._id,
    });

    return savedItem;
  }

  // MARKER: Fungsi Check-in Harian (Anti-Spam 1 Hari 1 Kali)
  async checkIn(userId: string) {
    // 1. Cari User dan Item aktifnya
    const user = await this.userModel.findById(userId).populate('activeItem');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.activeItem) {
      throw new NotFoundException('Belum punya item aktif');
    }

    // Ambil dokumen item asli dari DB
    const item = await this.itemModel.findById((user.activeItem as any)._id);
    if (!item) {
      throw new NotFoundException('Data item tidak ditemukan');
    }

    const today = new Date();

    // 2. LOGIKA VALIDASI: Cek apakah sudah absen hari ini?
    if (item.lastCheckIn) {
      const lastDate = new Date(item.lastCheckIn);

      // Cek apakah Tanggal, Bulan, dan Tahun sama persis
      const isSameDay =
        lastDate.getDate() === today.getDate() &&
        lastDate.getMonth() === today.getMonth() &&
        lastDate.getFullYear() === today.getFullYear();

      if (isSameDay) {
        throw new BadRequestException(
          'Kamu sudah merawat item ini hari ini. Kembali lagi besok ya!',
        );
      }
    }

    // 3. Logika Tambah XP
    const xpGain = 15;
    let currentXp = (item.currentXp || 0) + xpGain;
    let level = item.level;
    let nextLevelXp = item.nextLevelXp || 100;
    let levelUp = false;

    // Cek Level Up
    if (currentXp >= nextLevelXp) {
      level++;
      currentXp = currentXp - nextLevelXp; // Sisa XP dibawa ke level baru
      nextLevelXp = Math.floor(nextLevelXp * 1.5); // Target makin susah
      levelUp = true;
    }

    // 4. Simpan Perubahan
    item.level = level;
    item.currentXp = currentXp;
    item.nextLevelXp = nextLevelXp;
    item.lastCheckIn = today;

    await item.save();

    return {
      message: 'Check-in berhasil',
      gainedXp: xpGain,
      levelUp,
      level: item.level,
      currentXp: item.currentXp,
    };
  }
}
