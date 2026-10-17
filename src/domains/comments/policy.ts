// コメントを消せるのは書いた本人だけ。記事の書き手でも、他人のコメントは消せない
export function canDeleteComment(comment: { authorId: string }, userId: string | null): boolean {
  return userId !== null && comment.authorId === userId;
}
