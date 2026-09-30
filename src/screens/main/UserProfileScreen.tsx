import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../components/ScreenLayout';
import { BackHeader } from '../../components/Header';
import { IconButton } from '../../components/Button';
import { ProfileView } from '../../components/ProfileView';
import { useProfile } from '../../hooks/queries';
import { useSession } from '../../store/session';
import { shareProfile } from '../../utils/share';
import type { RootScreenProps } from '../../navigation/types';

export function UserProfileScreen({ navigation, route }: RootScreenProps<'UserProfile'>) {
  const { userId } = route.params;
  const { userId: meId } = useSession();
  const insets = useSafeAreaInsets();
  const { data } = useProfile(userId);
  const isMe = userId === meId;
  return (
    <ScreenLayout hideBottomPadding>
      <ProfileView
        userId={userId}
        isMe={isMe}
        scope={`profile-${route.key}`}
        bottomInset={insets.bottom + 40}
        onEditProfile={() => navigation.navigate('EditProfile')}
        onCompose={() => navigation.navigate('Compose')}
        header={
          <BackHeader
            title={data ? `@${data.user.username}` : ''}
            right={data ? <IconButton icon="share" label="Share profile" onPress={() => shareProfile(data.user)} /> : null}
          />
        }
      />
    </ScreenLayout>
  );
}
