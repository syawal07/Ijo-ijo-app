import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content, ContentDocument } from '../schemas/content.schema';
import { UpdateContentDto } from './dto/update-content.dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(Content.name) private contentModel: Model<ContentDocument>,
  ) {}

  // DATA DEFAULT (Update: Tambah bagian Register)
  private readonly defaultData = {
    hero_section: {
      title: 'Ubah Sampah Jadi Berkah',
      subtitle:
        'Bergabunglah dengan gerakan IJO. Pilah sampahmu, dapatkan poin, dan tukarkan dengan hadiah menarik serta tiket game seru!',
      cta_text: 'Mulai Sekarang',
      hero_image:
        'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=2070&auto=format&fit=crop',
    },
    auth_section: {
      logo_emoji: '🌱',
      project_name: 'IJO PROJECT',

      // LOGIN TEXT
      login_title_start: 'Selamat Datang',
      login_title_end: 'Kembali.',
      login_desc:
        'Lanjutkan progressmu, cek klasemen, dan terus berkontribusi untuk lingkungan sekolah yang lebih baik.',

      // REGISTER TEXT (BARU)
      register_title_start: 'Mulai Perjalanan',
      register_title_end: 'Hijau Kamu.',
      register_desc:
        'Bergabung dengan komunitas siswa peduli lingkungan. Kumpulkan poin, berkompetisi, dan buat dampak nyata.',
      register_quote:
        'Langkah kecil untuk memilah sampah hari ini, adalah lompatan besar untuk bumi di masa depan.',

      // COMMON
      feature_card_title: 'Klasemen Mingguan',
      feature_card_desc: 'Kompetisi semakin sengit minggu ini!',
    },
    tips_section: [
      {
        title: 'Pisahkan Plastik',
        desc: 'Botol plastik harus bersih dan kering sebelum disetor.',
      },
      {
        title: 'Kertas & Kardus',
        desc: 'Lipat kardus untuk menghemat ruang penyimpanan.',
      },
      {
        title: 'Minyak Jelantah',
        desc: 'Jangan buang ke wastafel! Kumpulkan di botol tertutup.',
      },
    ],
    footer_info: {
      about:
        'IJO adalah platform edukasi dan gamifikasi lingkungan untuk sekolah.',
      contact: 'halo@ijo.sch.id',
      address: 'Yogyakarta, Indonesia',
      social_ig: '@ijo.project',
    },
  };

  async getPublicContent() {
    const dbContents = await this.contentModel.find().exec();
    const result = { ...this.defaultData };

    dbContents.forEach((item) => {
      if (result[item.key]) {
        result[item.key] = item.value;
      }
    });

    return result;
  }

  async updateContent(dto: UpdateContentDto) {
    return this.contentModel.findOneAndUpdate(
      { key: dto.key },
      { value: dto.value },
      { upsert: true, new: true },
    );
  }
}
