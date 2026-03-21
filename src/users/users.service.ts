import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { HashingService } from 'src/common/hashing.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
  ) {}

  create = async (createUserDto: CreateUserDto) => {
    const hashedPassword = await this.hashingService.hash(
      createUserDto.password,
    );
    const newUser = await this.prismaService.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        password: hashedPassword,
      },
    });

    return newUser;
  };

  findAllUsers = async () => {
    const users = await this.prismaService.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        role: true,
      },
    });

    return users;
  };

  findUserById = async (userId: number) => {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        role: true,
      },
    });

    if (!user) {
      return new NotFoundException('Usuário não encontrado');
    }

    return user;
  };

  deleteUser = async (userId: number) => {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        role: true,
      },
    });

    if (!user) {
      return new NotFoundException('Usuário não encontrado');
    }

    await this.prismaService.user.delete({
      where: { id: user.id },
    });

    return { message: 'Usuário deletado' };
  };

  updateUser = async (userId: number, updateUserDto: UpdateUserDto) => {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NotFoundException('Usuário não encontrado');
    }

    let password = user.password;

    if (updateUserDto.password) {
      password = await this.hashingService.hash(updateUserDto.password);
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        email: updateUserDto.email ?? user.email,
        name: updateUserDto.name ?? user.name,
        password,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        role: true,
      },
    });

    return { message: 'Usuário atualizado', updatedUser };
  };
}
