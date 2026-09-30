import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { PostView } from '../types/models';

export type TabParamList = {
  Feed: undefined;
  Shelf: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Welcome: undefined;
  Auth: { mode?: 'signin' | 'signup' } | undefined;
  ForgotPassword: { email?: string } | undefined;
  CheckEmail: { email: string };
  ResetPassword: { email: string };
  ProfileSetup: undefined;
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  /** `tag` is the sharedTransitionTag of the cover that was tapped. */
  PostDetail: { postId: string; tag?: string; post?: PostView };
  UserProfile: { userId: string };
  Compose: { postId?: string } | undefined;
  EditProfile: undefined;
  DeleteAccount: undefined;
};

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
