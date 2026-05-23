export interface OwnerJwtPayload {
  sub: number;
  uuid: string;
  type: 'owner';
  iat?: number;
  exp?: number;
}

export interface UserJwtPayload {
  sub: number;
  uuid: string;
  storeId: number;
  role: string;
  type: 'user';
  iat?: number;
  exp?: number;
}
