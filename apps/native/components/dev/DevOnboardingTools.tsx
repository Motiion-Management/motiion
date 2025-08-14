import React, { useMemo, useState, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { useSimpleOnboardingFlow, ONBOARDING_FLOWS } from '~/hooks/useSimpleOnboardingFlow';
import { useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { useUser } from '~/hooks/useUser';
import { Sheet, useSheetState } from '~/components/ui/sheet';
import { Tabs } from '~/components/ui/tabs/tabs';
import { Input } from '~/components/ui/input';
import { useRouter, Href } from 'expo-router';

type ProfileType = keyof typeof ONBOARDING_FLOWS;

export function DevOnboardingTools() {
  if (!__DEV__) return null;

  const { user } = useUser();
  const onboarding = useSimpleOnboardingFlow();
  const completeOnboarding = useMutation(api.onboarding.completeOnboarding);
  const resetOnboarding = useMutation(api.onboarding.resetOnboarding);
  const updateMyUser = useMutation(api.users.updateMyUser);
  const sheetState = useSheetState();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'onboarding' | 'home'>('onboarding');
  const [routeInput, setRouteInput] = useState<string>('');
  const activeProfileType: ProfileType = (user?.profileType as ProfileType) || 'dancer';
  const activeSteps = useMemo(() => ONBOARDING_FLOWS[activeProfileType], [activeProfileType]);
  const handleGoToRoute = useCallback(() => {
    if (!routeInput) return;
    router.push(routeInput as Href);
  }, [routeInput, router]);

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', bottom: 20, right: 16, left: 16, zIndex: 1000 }}>
      <Sheet
        isOpened={sheetState.isOpen}
        label="Motiion Dev Tools"
        onIsOpenedChange={(isOpen) => {
          if (!isOpen) sheetState.close();
        }}
        stackBehavior="push">
        <View className="min-h-[260px] px-4 pb-4 pt-1">
          <Tabs
            tabs={[
              { key: 'onboarding', label: 'Onboarding' },
              { key: 'home', label: 'Home' },
            ]}
            activeTab={activeTab}
            onTabChange={(k) => setActiveTab(k as 'onboarding' | 'home')}
            className="mb-3"
          />

          {activeTab === 'onboarding' && (
            <View className="mt-1">
              <View className="mb-2 flex-row gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onPress={async () => {
                    await resetOnboarding({});
                    onboarding.navigateToStep('profile-type');
                  }}>
                  <Text variant="bodySm">Reset</Text>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={async () => {
                    await completeOnboarding({});
                  }}>
                  <Text variant="bodySm">Complete</Text>
                </Button>
              </View>

              <Text className="mb-1" variant="bodySm">
                Profile Type
              </Text>
              <View className="mb-2 flex-row gap-2">
                {(['dancer', 'choreographer', 'guest'] as ProfileType[]).map((pt) => (
                  <Button
                    key={pt}
                    size="sm"
                    variant={activeProfileType === pt ? 'primary' : 'outline'}
                    onPress={async () => {
                      await updateMyUser({ profileType: pt });
                      const flow = ONBOARDING_FLOWS[pt];
                      const next = flow[1] || 'profile-type';
                      onboarding.navigateToStep(next);
                    }}>
                    <Text>{pt}</Text>
                  </Button>
                ))}
              </View>

              <Text className="mb-1" variant="bodySm">
                Representation Status
              </Text>
              <View className="mb-2 flex-row gap-2">
                {(['represented', 'seeking', 'independent'] as const).map((rs) => (
                  <Button
                    key={rs}
                    size="sm"
                    variant={user?.representationStatus === rs ? 'primary' : 'outline'}
                    onPress={async () => {
                      await updateMyUser({ representationStatus: rs });
                    }}>
                    <Text>{rs}</Text>
                  </Button>
                ))}
              </View>

              <Text className="mb-1" variant="bodySm">
                Steps ({activeProfileType})
              </Text>
              <View style={{ maxHeight: 220 }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 4, paddingVertical: 6 }}>
                  {activeSteps.map((step) => (
                    <Button
                      size="sm"
                      variant="outline"
                      key={step}
                      onPress={() => onboarding.navigateToStep(step)}>
                      <Text>{step}</Text>
                    </Button>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}

          {activeTab === 'home' && (
            <View className="mt-1 gap-3">
              <Button onPress={() => router.push('/app/home' as Href)}>
                <Text>Go to Home</Text>
              </Button>

              <View className="gap-2">
                <Input
                  label="Route"
                  placeholder="/app/..."
                  value={routeInput}
                  onChangeText={setRouteInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Button onPress={handleGoToRoute} disabled={!routeInput}>
                  <Text>Go</Text>
                </Button>
              </View>
            </View>
          )}
        </View>
      </Sheet>

      <View className="items-end">
        <Button size="sm" variant={'secondary'} onPress={sheetState.open}>
          <Text variant="bodySm">Dev</Text>
        </Button>
      </View>
    </View>
  );
}

export default DevOnboardingTools;
