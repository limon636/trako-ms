import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Grants access if the request carries a valid user JWT.
 * All user types (SUPER_ADMIN, ADMIN, MANAGER, etc.) share a single JWT strategy.
 */
@Injectable()
export class StoreAccessGuard extends AuthGuard('user-jwt') {}
