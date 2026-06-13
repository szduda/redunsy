import { type ComponentProps, type FC } from 'react'

export type IconProps = ComponentProps<'svg'>

export type Icon = FC<IconProps>

export type FancyIconProps = IconProps & {
  innerClass?: string
  innerClass2?: string
}

export type FancyIcon = FC<FancyIconProps>
