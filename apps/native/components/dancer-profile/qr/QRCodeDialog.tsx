import React from 'react';
import { Dialog, DialogContent, DialogTrigger } from '~/components/ui/dialog';
import { TabView, type TabRoute } from '~/components/ui/tabs/TabView';
import { MyCodeTab } from './MyCodeTab';
import { ScanCodeTab } from './ScanCodeTab';
import { View } from 'react-native';
import { Icon } from '~/lib/icons/Icon';
import { Button } from '~/components/ui/button';

interface QRCodeDialogProps {
  profileUrl: string;
}

export function QRCodeDialog({ profileUrl }: QRCodeDialogProps) {
  const tabs: Array<TabRoute> = [
    { key: 'scan', title: 'Scan Code' },
    { key: 'mycode', title: 'My Code' },
  ];

  const renderScene = (route: TabRoute) => {
    switch (route.key) {
      case 'scan':
        return <ScanCodeTab />;
      case 'mycode':
        return <MyCodeTab profileUrl={profileUrl} />;
      default:
        return null;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="tertiary">
          <Icon name="qrcode" size={28} className="text-icon-default" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <View className="h-[36vh] w-[75vw]">
          <TabView routes={tabs} renderScene={renderScene} initialKey="mycode" tabStyle="pill" />
        </View>
      </DialogContent>
    </Dialog>
  );
}
