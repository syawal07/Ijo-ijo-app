import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

export const jwtConstants = {
  secret: 'rahasiaNegaraIjo2',
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  // Fungsi ini otomatis jalan saat ada request masuk membawa Token
  async validate(payload: any) {
    // Kita kembalikan userId agar bisa dipanggil dengan req.user.userId
    return { userId: payload.sub, email: payload.email };
  }
}
