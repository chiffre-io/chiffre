import React from 'react'
import { NextPage } from 'next'
import {
  Flex,
  Heading,
  Text,
  Button,
  Stack,
  Alert,
  AlertIcon
} from '@chakra-ui/core'
import { Formik, Form, FormikHelpers } from 'formik'
import Body from '../components/primitives/Body'
import Logo from '../components/Logo'
import SvgBox from '../components/primitives/SvgBox'
import { OutgoingLink } from '../components/primitives/Links'
import EmailField from '../components/form/EmailField'

const DecorativeSide = ({ ...props }) => {
  return (
    <SvgBox
      position="absolute"
      bottom="0"
      height="75%"
      viewBox="0 0 523 480"
      fill="none"
      {...props}
    >
      <path
        d="M523 524.5C523 486 216.5 0 -80.5 0C-377.5 0 -80.5 549.5 -80.5 549.5C-80.5 549.5 523 563 523 524.5Z"
        fill="rgba(255, 255, 255, 0.05)"
      />
    </SvgBox>
  )
}

interface FormValues {
  email: string
}

const NewsletterForm = ({ ...props }) => {
  const [subscribed, setSubscribed] = React.useState(false)

  const subscribeToNewsletter = React.useCallback(
    async (values: FormValues, helpers: FormikHelpers<FormValues>) => {
      if (typeof window === 'undefined') {
        return
      }
      if (process.env.NODE_ENV === 'production') {
        window.chiffre.sendString({
          name: 'landing:newsletter:email',
          value: values.email
        })
      } else {
        console.debug('Subscribing', values.email)
      }
      await new Promise(r => setTimeout(r, 700))
      helpers.setSubmitting(false)
      setSubscribed(true)
    },
    []
  )

  const initialValues: FormValues = {
    email: ''
  }

  if (subscribed) {
    return (
      <Flex justifyContent="center" {...props}>
        <Alert
          status="success"
          variant="subtle"
          flexDirection="column"
          justifyContent="center"
          textAlign="center"
          bg="green.200"
          color="green.800"
          borderColor="green.300"
          px={12}
          py={6}
          borderWidth={1}
          borderRadius={4}
          {...props}
        >
          <AlertIcon size="36px" name="check" mb={3} />
          We will keep you in the loop, thanks !
        </Alert>
      </Flex>
    )
  }

  return (
    <Formik initialValues={initialValues} onSubmit={subscribeToNewsletter}>
      {({ isSubmitting }) => (
        <Form>
          <Flex justifyContent="center" wrap={['wrap', 'nowrap']} {...props}>
            <EmailField
              placeholder="enter your email address"
              w={['100%', 'xs']}
              mr={[0, 4]}
            />
            <Button
              isLoading={isSubmitting}
              loadingText="Send me updates"
              type="submit"
              variantColor="green"
              leftIcon="chat"
              mt={[2, 0]}
              w={['100%', 'auto']}
              flexShrink={0}
            >
              Send me updates
            </Button>
          </Flex>
        </Form>
      )}
    </Formik>
  )
}

const Home: NextPage = () => {
  return (
    <>
      <Body shade={200} />
      <Flex
        as="main"
        bg="gray.800"
        color="gray.200"
        minH={['500px', '600px']}
        direction="column"
        position="relative"
        overflow="hidden"
      >
        <Flex as="nav" p={4}>
          <Logo dark />
        </Flex>
        <Flex
          as="section"
          maxW="4xl"
          px={2}
          mx="auto"
          flex={1}
          textAlign="center"
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <DecorativeSide left="0" />
          <DecorativeSide right="0" transform="scaleX(-1)" />

          <Heading as="h1" fontSize="5xl" fontWeight="normal" mb={8} mt={-8}>
            <Text as="span" fontWeight="semibold">
              Insight
            </Text>
            , for your eyes only.
          </Heading>
          <Text fontSize="xl" maxW="sm" color="gray.400">
            Meet the first analytics platform that doesn’t give away your
            business advantage
          </Text>
        </Flex>
      </Flex>
      <Stack
        as="section"
        maxW="4xl"
        px={2}
        mx="auto"
        textAlign="center"
        py={12}
        spacing={8}
      >
        <Heading as="h2" fontSize="2xl" fontWeight="normal">
          Be notified when it's available
        </Heading>
        <NewsletterForm />
        <Text color="gray.600" fontSize="sm" lineHeight="1.8">
          We won't send you spam, you can unsubscribe at any time.
          <br />
          Your email will not be shared with a third party, you can also{' '}
          <OutgoingLink
            hideExternalIcon
            href="mailto:contact+landing@chiffre.io"
            textDecoration="underline"
          >
            contact us directly
          </OutgoingLink>
          .
        </Text>
      </Stack>
      <Flex
        justifyContent="center"
        alignItems="center"
        py={4}
        mt={12}
        color="gray.600"
        direction={['column', 'row']}
      >
        <Text fontSize="sm">Privacy first, by design</Text>
        <SvgBox
          aria-label="47ng logo"
          role="img"
          viewBox="0 0 148 144"
          width={8}
          height={8}
          overflow="visible"
          fill="currentColor"
          my={2}
          mx={4}
        >
          <path d="M99.4622 61.7822C99.6547 64.3862 97.4912 66.0106 96.2381 67.6166C92.354 72.5825 88.3737 77.5347 83.9525 82.205C74.3494 82.705 62.9984 82.7484 53.5484 83.1259C51.744 83.1972 49.2684 83.8309 48.6347 82.0513C48.3722 79.4031 50.6115 77.81 51.8587 76.2166C55.7303 71.2644 59.6778 66.3819 63.9903 61.6284C73.8815 61.0584 85.4056 61.1609 95.1631 60.7072C96.769 60.63 98.925 60.0991 99.4622 61.7822ZM109.291 19.5531C110.909 18.3309 112.694 17.3069 113.744 16.0213C114.556 15.0294 116.073 12.6878 116.047 10.9538C116.003 8.06813 111.959 2.36688 110.058 1.27938C106.219 -0.921559 103.014 3.44188 100.384 5.88594C86.9544 18.3628 75.13 31.6013 62.1475 44.5831C61.124 45.6069 60.1006 47.1678 59.0772 47.5006C57.285 48.0831 54.1687 47.8653 51.859 47.9616C43.9512 48.2944 36.4394 48.1344 28.979 47.8078C18.8184 47.36 10.584 45.1975 0.5703 45.3509C-0.30595 50.4375 2.48967 55.825 5.17717 58.5569C9.06092 62.5047 16.6044 63.0103 24.6794 63.0103C31.66 63.0103 39.1525 62.5878 45.1028 62.3959C42.4922 65.5178 39.114 69.0181 35.7359 72.8369C32.9715 75.9663 28.2497 80.0675 26.8294 84.0478C25.249 88.4753 27.8725 93.5491 29.5937 96.9469C30.9181 99.5634 32.9784 104.183 36.3506 104.778C37.4765 104.976 39.044 104.414 40.4965 104.164C44.9628 103.403 48.7694 102.302 52.1672 101.399C57.7081 99.9287 62.8906 99.5888 68.444 98.4816C60.4528 107.248 49.46 115.949 39.5753 123.512C38.0715 124.665 36.3375 125.707 35.1215 126.89C33.9125 128.068 32.089 130.641 32.0506 132.727C32.0122 134.966 33.7972 137.417 34.9684 139.176C36.184 141.006 38.0844 143.354 40.3428 143.322C42.5119 143.29 45.5125 140.04 47.2531 138.408C53.594 132.464 59.2625 126.398 65.2197 120.441C71.1831 114.478 77.2612 108.573 83.0322 102.321C84.4656 100.766 87.2362 96.89 89.0209 96.3325C90.9278 95.7378 93.8909 95.9678 96.239 95.8725C104.019 95.545 111.953 95.6928 119.273 96.025C129.395 96.4863 137.808 98.8091 147.528 98.3294C148.02 92.7109 145.724 88.1431 142.921 85.2763C135.94 78.1231 115.153 81.6284 102.996 81.4375C105.548 78.3022 108.888 74.8728 112.208 71.1491C115.235 67.7575 119.509 64.085 121.115 60.0925C122.964 55.505 120.13 50.3288 118.352 46.7331C117.001 44.0009 115.017 39.49 111.441 39.055C109.036 38.7606 105.849 39.8997 103.302 40.4369C95.439 42.0944 88.0997 44.4869 79.6544 45.3509C87.8362 36.5534 99.0975 27.2247 109.291 19.5531Z" />
        </SvgBox>
        <Text fontSize="sm">
          A project by{' '}
          <OutgoingLink
            href="https://francoisbest.com"
            hideExternalIcon
            textDecoration="underline"
          >
            François Best
          </OutgoingLink>
        </Text>
      </Flex>
    </>
  )
}

export default Home
