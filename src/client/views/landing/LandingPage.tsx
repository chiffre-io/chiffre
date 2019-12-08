import Hero from './Hero'
import Header from './Header'
import Section from './Section'
import { Heading, Text } from '@chakra-ui/core'

const H2 = ({ children, ...props }) => {
  return (
    <Heading
      as="h2"
      fontSize="2xl"
      fontWeight="semibold"
      color="gray.700"
      {...props}
    >
      {children}
    </Heading>
  )
}

const LandingPage = () => {
  return (
    <>
      <Header />
      <Hero />
      <Section>
        <H2>Don't give your business away</H2>
        <Text>
          Traditional analytics platforms know everything about your business
          before you do.
        </Text>
      </Section>
      <Section>
        <H2>Protect your customers privacy</H2>
        <Text>Is GDPR giving you nightmares ?</Text>
      </Section>
      <Section>No tricks up our sleeve</Section>
    </>
  )
}

export default LandingPage
