import { Share } from 'react-native';
import type { PostView, User } from '../types/models';

export const WEB_ORIGIN = 'https://bookly.app';

export async function sharePost(post: PostView) {
  const url = `${WEB_ORIGIN}/p/${post.id}`;
  const by = post.bookAuthor ? ` by ${post.bookAuthor}` : '';
  try {
    await Share.share(
      {
        title: post.bookTitle,
        message: `${post.author.displayName} on ${post.bookTitle}${by} — ${url}`,
        url,
      },
      { subject: `${post.bookTitle} on Bookly` },
    );
  } catch {
    // user dismissed or share unavailable
  }
}

export async function shareProfile(user: User) {
  const url = `${WEB_ORIGIN}/u/${user.username}`;
  try {
    await Share.share({ title: user.displayName, message: `${user.displayName}'s shelf on Bookly — ${url}`, url });
  } catch {
    // ignore
  }
}
