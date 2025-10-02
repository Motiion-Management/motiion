import Svg, { Path } from 'react-native-svg'
import { iconWithClassName } from './iconWithClassName'

function Icon(props: React.ComponentPropsWithoutRef<typeof Svg>) {
  return (
    <Svg viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        d="M2.66667 4H13.3333M4.66667 8H11.3333M6.66667 12H9.33333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default iconWithClassName(Icon)
