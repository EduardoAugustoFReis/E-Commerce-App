import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HashingService } from 'src/common/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/types/JwtPayload/jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
  ) {}

  login = async (loginDto: LoginDto) => {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: loginDto.email,
      },
    });

    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    if (!user.password) {
      throw new UnauthorizedException('Use login com Google');
    }

    const passwordCheck = await this.hashingService.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordCheck)
      throw new UnauthorizedException('Credenciais inválidas');

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token,
    };
  };

  getMyProfile = async (userId: number) => {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return user;
  };

  loginWithGoogle = async (userData: { email: string; name: string }) => {
    let user = await this.prismaService.user.findFirst({
      where: { email: userData.email },
    });

    if (!user) {
      user = await this.prismaService.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password: null,
          provider: 'google',
        },
      });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      user,
      token,
    };
  };
}
