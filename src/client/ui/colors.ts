export interface ThemeableColor {
  dark: string
  light: string
}

export type ThemeableColors = {
  [color: string]: ThemeableColor
}
