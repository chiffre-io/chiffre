import styled from '@emotion/styled'
import { space } from 'styled-system'

export default function withStyledSystem(Component: any) {
  return styled(Component)`
    ${space}
  `
}
