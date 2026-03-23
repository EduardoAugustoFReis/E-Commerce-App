import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: keyof any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Se passar algo tipo @CurrentUser('role')
    if (data) {
      return user?.[data];
    }

    // Se usar @CurrentUser()
    return user;
  },
);