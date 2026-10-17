// 自分自身はフォローできない。訪問者（userId が null）も false。DB の CHECK でも守っている
export function canFollow(userId: string | null, followeeId: string): boolean {
  return userId !== null && userId !== followeeId;
}
