import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Owner } from '../../entities/owner.entity';

export const CurrentOwner = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Owner => {
    const request = ctx.switchToHttp().getRequest<{ user: Owner }>();
    return request.user;
  },
);
