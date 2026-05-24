export interface UserJwtPayload {
  sub: number;
  uuid: string;
  storeId?: number;
  role: string;
  iat?: number;
  exp?: number;
}
