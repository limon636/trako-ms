import { AuthGuard } from '@nestjs/passport';

export class OwnerJwtGuard extends AuthGuard('owner-jwt') {}
