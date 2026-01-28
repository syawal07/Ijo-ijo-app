import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, fullName, schoolClass } = registerDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // --- PERBAIKAN KEAMANAN ---
    // HAPUS logika "email.includes('admin')".
    // Sekarang SEMUA pendaftar baru otomatis jadi STUDENT dan PENDING.
    // Admin hanya bisa dibuat manual lewat Database atau oleh Admin lain (nanti).

    const newUser = await this.userModel.create({
      email,
      passwordHash: hashedPassword,
      fullName,
      schoolClass,
      role: 'student', // SELALU Student
      status: 'pending', // SELALU Pending
    });

    return {
      message: 'Registrasi berhasil. Menunggu persetujuan Admin.',
      userId: newUser._id,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // --- CEK STATUS ---
    if (user.status === 'pending') {
      throw new ForbiddenException(
        'Akun Anda sedang menunggu persetujuan Admin.',
      );
    }
    if (user.status === 'rejected') {
      throw new ForbiddenException(
        'Maaf, pendaftaran Anda ditolak oleh Admin.',
      );
    }
    // ------------------

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    return {
      message: 'Login berhasil',
      accessToken: this.jwtService.sign(payload),
      role: user.role,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).populate('activeItem');

    if (!user) {
      throw new BadRequestException('User tidak ditemukan');
    }

    return {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      schoolClass: user.schoolClass,
      role: user.role,
      status: user.status,
      ijoCoins: user.ijoCoins,
      gameTickets: user.gameTickets,
      activeItem: user.activeItem,
    };
  }
}
