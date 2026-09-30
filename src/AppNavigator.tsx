import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer, type LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useThemeColors } from './theme/ThemeProvider';
import { useSession, session } from './store/session';
import { useMe } from './hooks/queries';
import { navigationRef } from './navigation/ref';
import type { RootStackParamList, TabParamList } from './navigation/types';
import { PostActionsProvider } from './components/PostActions';
import { TabBar } from './components/TabBar';
import { SplashScreen } from './screens/onboarding/SplashScreen';
import { OnboardingScreen } from './screens/onboarding/OnboardingScreen';
import { WelcomeScreen } from './screens/auth/WelcomeScreen';
import { AuthScreen } from './screens/auth/AuthScreen';
import { ForgotPasswordScreen } from './screens/auth/ForgotPasswordScreen';
import { CheckEmailScreen } from './screens/auth/CheckEmailScreen';
import { ResetPasswordScreen } from './screens/auth/ResetPasswordScreen';
import { ProfileSetupScreen } from './screens/auth/ProfileSetupScreen';
import { FeedScreen } from './screens/main/FeedScreen';
import { ShelfScreen } from './screens/main/ShelfScreen';
import { PostDetailScreen } from './screens/main/PostDetailScreen';
import { UserProfileScreen } from './screens/main/UserProfileScreen';
import { ComposeScreen } from './screens/main/ComposeScreen';
import { EditProfileScreen } from './screens/main/EditProfileScreen';
import { DeleteAccountScreen } from './screens/main/DeleteAccountScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['bookly://', 'https://bookly.app'],
  config: {
    screens: {
      PostDetail: 'p/:postId',
      UserProfile: 'u/:userId',
      ResetPassword: 'reset/:email',
      Tabs: { screens: { Feed: 'feed', Shelf: 'shelf' } },
    },
  },
};

function Tabs() {
  const { theme } = useThemeColors();
  return (
    <Tab.Navigator
      tabBar={props => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: theme.background } }}>
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Shelf" component={ShelfScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { navigationTheme, theme } = useThemeColors();
  const { userId, hasOnboarded } = useSession();
  const me = useMe();
  const [booted, setBooted] = useState(false);
  const onSplashDone = useCallback(() => setBooted(true), []);

  // A stored session whose user no longer exists (e.g. deleted elsewhere) signs out.
  useEffect(() => {
    if (userId && me.isError) {
      session.setUser(null);
    }
  }, [userId, me.isError]);

  if (!booted) {
    return <SplashScreen onDone={onSplashDone} />;
  }
  if (userId && !me.data) {
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  }

  const user = me.data;

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} linking={linking}>
      <PostActionsProvider>
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}>
          {!userId || !user ? (
            <Stack.Group>
              {!hasOnboarded ? <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ animation: 'fade' }} /> : null}
              <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ animation: 'fade' }} />
              <Stack.Screen name="Auth" component={AuthScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
              <Stack.Screen name="CheckEmail" component={CheckEmailScreen} />
              <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            </Stack.Group>
          ) : !user.profileComplete ? (
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} options={{ animation: 'fade' }} />
          ) : (
            <Stack.Group>
              <Stack.Screen name="Tabs" component={Tabs} options={{ animation: 'fade' }} />
              <Stack.Screen name="PostDetail" component={PostDetailScreen} />
              <Stack.Screen name="UserProfile" component={UserProfileScreen} />
              <Stack.Group screenOptions={{ presentation: 'modal', gestureEnabled: true }}>
                <Stack.Screen name="Compose" component={ComposeScreen} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              </Stack.Group>
              <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
            </Stack.Group>
          )}
        </Stack.Navigator>
      </PostActionsProvider>
    </NavigationContainer>
  );
}
