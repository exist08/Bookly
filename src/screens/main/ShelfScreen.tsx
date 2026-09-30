import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../components/ScreenLayout';
import { AppText } from '../../components/AppText';
import { IconButton } from '../../components/Button';
import { ProfileView } from '../../components/ProfileView';
import { TabScene } from '../../components/TabScene';
import { TAB_BAR_HEIGHT } from '../../components/TabBar';
import { useMe } from '../../hooks/queries';
import type { TabScreenProps } from '../../navigation/types';

export function ShelfScreen({ navigation }: TabScreenProps<'Shelf'>) {
  const { data: me } = useMe();
  const insets = useSafeAreaInsets();
  if (!me) {
    return null;
  }
  return (
    <TabScene>
      <ScreenLayout hideBottomPadding>
        <ProfileView
          userId={me.id}
          isMe
          scope="shelf"
          bottomInset={TAB_BAR_HEIGHT + insets.bottom + 40}
          onEditProfile={() => navigation.navigate('EditProfile')}
          onCompose={() => navigation.navigate('Compose')}
          header={
            <View style={styles.bar}>
              <AppText variant="bodyStrong">@{me.username}</AppText>
              <IconButton icon="sliders" label="Settings" onPress={() => navigation.navigate('EditProfile')} />
            </View>
          }
        />
      </ScreenLayout>
    </TabScene>
  );
}

const styles = StyleSheet.create({
  bar: { height: 56, paddingLeft: 24, paddingRight: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
