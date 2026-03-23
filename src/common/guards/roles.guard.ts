import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // pega as roles definidas no @Roles()
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    // se não tiver role definida, libera acesso
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // verifica se o usuário tem a role necessária
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Acesso negado');
    }

    return true;
  }
}