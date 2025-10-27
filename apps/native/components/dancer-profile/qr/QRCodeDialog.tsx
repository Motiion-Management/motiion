import React from 'react';
import { Dialog, DialogContent, DialogTrigger } from '~/components/ui/dialog';
import { PagerTabView, type TabRoute } from '~/components/ui/tabs/PagerTabView';
import { MyCodeTab } from './MyCodeTab';
import { ScanCodeTab } from './ScanCodeTab';
import { View } from 'react-native';
import { Icon } from '~/lib/icons/Icon';
import { Button } from '~/components/ui/button';

interface QRCodeDialogProps {
  profileUrl: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function QRCodeDialog({ profileUrl, open, onOpenChange }: QRCodeDialogProps) {
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

  const isControlled = open !== undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Only render trigger button if dialog is not controlled externally */}
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="tertiary">
            <Icon name="qrcode" size={28} className="text-icon-default" />
          </Button>
        </DialogTrigger>
      )}

      <DialogContent>
        <View className="h-[36vh] w-[75vw]">
          <PagerTabView
            routes={tabs}
            renderScene={renderScene}
            initialKey="mycode"
            tabStyle="pill"
          />
        </View>
      </DialogContent>
    </Dialog>
  );
}
