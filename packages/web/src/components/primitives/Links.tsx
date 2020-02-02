import NextLink, { LinkProps as NextLinkProps } from 'next/link'
import {
  Button,
  ButtonProps,
  Icon,
  Link as ChakraLink,
  LinkProps as ChakraLinkProps
} from '@chakra-ui/core'

export interface RouteLinkProps
  extends Omit<NextLinkProps, 'as' | 'href'>,
    Omit<ChakraLinkProps, 'as' | 'href'> {
  as?: string
  to: string
}

export const RouteLink: React.FC<RouteLinkProps> = ({
  to,
  as = to,
  children,
  ...props
}) => {
  return (
    <NextLink href={to} passHref as={as}>
      <ChakraLink {...props}>{children}</ChakraLink>
    </NextLink>
  )
}

// --

export interface OutgoingLinkProps extends ChakraLinkProps {}

export const OutgoingLink: React.FC<OutgoingLinkProps> = ({
  children,
  ...props
}) => {
  // You have to specify isExternal={false} to disable default behaviour
  const external = props.isExternal ?? true
  return (
    <ChakraLink isExternal={external} {...props}>
      {children}
      {external && (
        <Icon name="external-link" mx="2px" aria-label="(external link)" />
      )}
    </ChakraLink>
  )
}

// --

export interface ButtonRouteLinkProps
  extends Omit<NextLinkProps, 'as' | 'href'>,
    ButtonProps {
  to: string
}

export const ButtonRouteLink: React.FC<ButtonRouteLinkProps> = ({
  to,
  children,
  ...props
}) => (
  <NextLink href={to} passHref>
    <Button as="a" {...props}>
      {children}
    </Button>
  </NextLink>
)
