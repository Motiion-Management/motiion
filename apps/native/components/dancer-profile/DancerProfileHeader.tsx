import React from 'react';
import { View } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import type { ViewStyle } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';
import { Button } from '~/components/ui/button';
import { Icon } from '~/lib/icons/Icon';
import { type DancerViewConfig } from '~/hooks/useDancerView';

export interface ProfileHeaderAnimations {
  arrowIcon: AnimatedStyle<ViewStyle>;
  personIcon: AnimatedStyle<ViewStyle>;
}

export interface DancerProfileHeaderProps {
  config: DancerViewConfig;
  toggle: () => void;
  animations: ProfileHeaderAnimations;
  onShareProfile: () => void;
  onShareHeadshot: () => void;
  onShareProfileLink: () => void;
}

/**
 * Domain component that handles profile header buttons (left toggle, right share menu)
 * Adapts share menu options based on view permissions
 */
export function DancerProfileHeader(props: DancerProfileHeaderProps) {
  const { config, toggle, animations, onShareProfile, onShareHeadshot, onShareProfileLink } = props;

  return {
    leftButton: (
      <Button variant="secondary" size="icon" onPress={toggle}>
        <View style={{ position: 'relative', width: 24, height: 24 }}>
          <Animated.View style={[animations.arrowIcon, { position: 'absolute' }]}>
            <Icon name="arrow.up.to.line" size={24} className="text-icon-default" />
          </Animated.View>
          <Animated.View style={[animations.personIcon, { position: 'absolute' }]}>
            <Icon
              name="person.crop.square.on.square.angled.fill"
              size={24}
              className="text-icon-default"
            />
          </Animated.View>
        </View>
      </Button>
    ),
    rightButton: config.canShare ? (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button variant="secondary" size="icon">
            <Icon name="arrowshape.turn.up.right.fill" size={24} className="text-icon-default" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item key="profile-card" onSelect={onShareProfile}>
            <DropdownMenu.ItemTitle>Send Profile Card</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
          <DropdownMenu.Item key="headshot" onSelect={onShareHeadshot}>
            <DropdownMenu.ItemTitle>Send this Headshot</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
          <DropdownMenu.Item key="profile-link" onSelect={onShareProfileLink}>
            <DropdownMenu.ItemTitle>Share Profile Link</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    ) : null,
  };
}
