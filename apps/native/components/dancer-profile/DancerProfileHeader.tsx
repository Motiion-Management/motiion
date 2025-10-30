import React from 'react';
import * as DropdownMenu from 'zeego/dropdown-menu';
import { Button } from '~/components/ui/button';
import { Icon } from '~/lib/icons/Icon';
import { type DancerViewConfig } from '~/hooks/useDancerView';

export interface DancerProfileHeaderProps {
  config: DancerViewConfig;
  onShareProfile: () => void;
  onShareHeadshot: () => void;
  onShareProfileLink: () => void;
}

/**
 * Domain component that handles profile header share button
 * Adapts share menu options based on view permissions
 */
export function DancerProfileHeader(props: DancerProfileHeaderProps) {
  const { config, onShareProfile, onShareHeadshot, onShareProfileLink } = props;

  return {
    rightButton: config.canShare ? (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button variant="tertiary" size="icon">
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
