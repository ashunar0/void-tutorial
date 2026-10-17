// 記事を編集・削除できるのは書いた本人だけ。訪問者（userId が null）は常に false
export function canEdit(article: { authorId: string }, userId: string | null): boolean {
  return userId !== null && article.authorId === userId;
}
