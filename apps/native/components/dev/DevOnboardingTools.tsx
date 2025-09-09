import React, { useMemo, useState, useCallback } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow';
import {
  ONBOARDING_GROUPS,
  ONBOARDING_GROUP_FLOWS,
  STEP_ROUTES,
  type ProfileType,
} from '@packages/backend/convex/onboardingConfig';
import { useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { useUser } from '~/hooks/useUser';
import { Sheet, useSheetState } from '~/components/ui/sheet';
import { Tabs } from '~/components/ui/tabs/tabs';
import { Input } from '~/components/ui/input';
import { useRouter, Href } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAction } from 'convex/react';

type ParsedResumeData = {
  experiences: any[];
  training: any[];
  skills: string[];
  genres: string[];
  sagAftraId?: string;
} | null;

export function DevOnboardingTools() {
  const { user } = useUser();
  const onboarding = useOnboardingGroupFlow();
  const completeOnboarding = useMutation(api.onboarding.completeOnboarding);
  const resetOnboarding = useMutation(api.onboarding.resetOnboarding);
  const sheetState = useSheetState();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'onboarding' | 'home' | 'resume'>('onboarding');
  const [routeInput, setRouteInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResumeData>(null);
  const generateUploadUrlDev = useMutation(api.dev.resumeTest.generateUploadUrlDev);
  const parseResumeDocumentDev = useAction(api.dev.resumeTest.parseResumeDocumentDev);
  const activeProfileType: ProfileType = (user?.profileType as ProfileType) || 'dancer';
  const activeGroups = useMemo(
    () => ONBOARDING_GROUP_FLOWS[activeProfileType],
    [activeProfileType]
  );

  const allSteps = useMemo(() => {
    // Get all unique steps from the groups, maintaining order
    const steps = activeGroups.flatMap((groupKey) => ONBOARDING_GROUPS[groupKey].steps);
    // Return unique steps while preserving order
    return [...new Set(steps)];
  }, [activeGroups]);
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
              { key: 'resume', label: 'Resume' },
            ]}
            activeTab={activeTab}
            onTabChange={(k) => setActiveTab(k as 'onboarding' | 'home' | 'resume')}
            className="mb-3"
          />

          {activeTab === 'onboarding' && (
            <View className="mt-1">
              <View className="mb-2">
                <Text variant="bodySm" className="mb-1">
                  Quick Actions
                </Text>
              </View>
              <View className="mb-2 flex-row gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onPress={async () => {
                    await resetOnboarding({});
                    onboarding.navigateToGroup('profile');
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
                Groups ({activeProfileType})
              </Text>
              <View className="mb-2 flex-row flex-wrap gap-2">
                {activeGroups.map((groupKey) => (
                  <Button
                    key={groupKey}
                    size="sm"
                    variant={onboarding.currentGroup === groupKey ? 'primary' : 'outline'}
                    onPress={() => onboarding.navigateToGroup(groupKey)}>
                    <Text variant="bodySm">{ONBOARDING_GROUPS[groupKey].label}</Text>
                  </Button>
                ))}
              </View>

              <Text className="mb-1" variant="bodySm">
                All Steps
              </Text>
              <View style={{ maxHeight: 180 }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 4, paddingVertical: 6 }}>
                  {allSteps.map((step) => (
                    <Button
                      size="sm"
                      variant={onboarding.currentStepId === step ? 'primary' : 'outline'}
                      key={step}
                      onPress={() => onboarding.navigateToStep(step)}>
                      <Text variant="bodySm">{step}</Text>
                    </Button>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}

          {activeTab === 'home' && (
            <View className="mt-1 gap-3">
              {/* <Button */}
              {/*   onPress={() => router.push('/auth/(create-account)/enable-notifications' as Href)}> */}
              {/*   <Text>Open Enable Notifications</Text> */}
              {/* </Button> */}
              <Button onPress={() => router.push('/app/home' as Href)}>
                <Text>Go to Home</Text>
              </Button>

              {/* <Button onPress={() => setActiveTab('resume')} variant="outline"> */}
              {/*   <Text>Open Resume Tester</Text> */}
              {/* </Button> */}

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

          {activeTab === 'resume' && (
            <View className="mt-1 gap-3">
              <Text variant="bodySm">
                Dev-only resume parser: supports images, PDFs, and Word docs. Uploads to Convex and
                parses via unified AI processor. No user data is modified.
              </Text>

              <View className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={isProcessing}
                  onPress={async () => {
                    try {
                      setIsProcessing(true);
                      setParsedData(null);
                      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                      if (status !== 'granted') {
                        Alert.alert('Permission Required', 'Allow photo access to upload.');
                        return;
                      }
                      const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsMultipleSelection: false,
                        quality: 0.9,
                        allowsEditing: false,
                      });
                      if (result.canceled || !result.assets[0]) return;

                      const asset = result.assets[0];
                      const uploadUrl = await generateUploadUrlDev();
                      const resp = await fetch(uploadUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': asset.mimeType || 'image/jpeg' },
                        body: await (await fetch(asset.uri)).blob(),
                      });
                      if (!resp.ok) throw new Error('Upload failed');
                      const { storageId } = await resp.json();
                      const parsed = await parseResumeDocumentDev({ storageId });
                      setParsedData(parsed);
                    } catch (e) {
                      console.error('Dev resume parse error:', e);
                      Alert.alert('Error', 'Failed to parse resume. See console for details.');
                    } finally {
                      setIsProcessing(false);
                    }
                  }}>
                  <Text variant="bodySm">Pick From Photos</Text>
                </Button>

                <Button
                  variant="outline"
                  disabled={isProcessing}
                  onPress={async () => {
                    try {
                      setIsProcessing(true);
                      setParsedData(null);
                      const { status } = await ImagePicker.requestCameraPermissionsAsync();
                      if (status !== 'granted') {
                        Alert.alert('Permission Required', 'Allow camera access to take photo.');
                        return;
                      }
                      const result = await ImagePicker.launchCameraAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        quality: 0.9,
                        allowsEditing: false,
                      });
                      if (result.canceled || !result.assets[0]) return;

                      const asset = result.assets[0];
                      const uploadUrl = await generateUploadUrlDev();
                      const resp = await fetch(uploadUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': asset.mimeType || 'image/jpeg' },
                        body: await (await fetch(asset.uri)).blob(),
                      });
                      if (!resp.ok) throw new Error('Upload failed');
                      const { storageId } = await resp.json();
                      const parsed = await parseResumeDocumentDev({ storageId });
                      setParsedData(parsed);
                    } catch (e) {
                      console.error('Dev resume parse error:', e);
                      Alert.alert('Error', 'Failed to parse resume. See console for details.');
                    } finally {
                      setIsProcessing(false);
                    }
                  }}>
                  <Text variant="bodySm">Take Photo</Text>
                </Button>

                <Button
                  variant="outline"
                  disabled={isProcessing}
                  onPress={async () => {
                    try {
                      setIsProcessing(true);
                      setParsedData(null);
                      const result = await DocumentPicker.getDocumentAsync({
                        multiple: false,
                        type: [
                          'image/*',
                          'application/pdf',
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                          'application/msword',
                        ],
                        copyToCacheDirectory: true,
                      });
                      if (result.canceled || !result.assets[0]) return;

                      const asset = result.assets[0];
                      const uploadUrl = await generateUploadUrlDev();
                      const resp = await fetch(uploadUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': asset.mimeType || 'application/octet-stream' },
                        body: await (await fetch(asset.uri)).blob(),
                      });
                      if (!resp.ok) throw new Error('Upload failed');
                      const { storageId } = await resp.json();
                      const parsed = await parseResumeDocumentDev({ storageId });
                      setParsedData(parsed);
                    } catch (e) {
                      console.error('Dev resume parse error:', e);
                      Alert.alert('Error', 'Failed to parse document. See console for details.');
                    } finally {
                      setIsProcessing(false);
                    }
                  }}>
                  <Text variant="bodySm">Pick Document</Text>
                </Button>
              </View>

              {isProcessing && (
                <Text variant="bodySm" className="text-text-secondary">
                  Processing…
                </Text>
              )}

              {parsedData && (
                <View style={{ maxHeight: 220 }} className="rounded-md border border-border p-2">
                  <ScrollView>
                    <Text variant="bodySm">{JSON.stringify(parsedData, null, 2)}</Text>
                  </ScrollView>
                </View>
              )}
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
