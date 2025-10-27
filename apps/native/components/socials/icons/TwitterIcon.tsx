import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface TwitterIconProps {
  size?: number;
  color?: string;
}

export function TwitterIcon({ size = 24, color = 'white' }: TwitterIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 20" fill="none">
      <Path
        d="M17.3263 0H20.6998L13.3297 8.42349L22 19.886H15.2112L9.89403 12.934L3.80995 19.886H0.434432L8.31743 10.8761L0 0H6.96111L11.7674 6.35433L17.3263 0ZM16.1423 17.8668H18.0116L5.94539 1.91313H3.93946L16.1423 17.8668Z"
        fill={color}
      />
    </Svg>
  );
}
