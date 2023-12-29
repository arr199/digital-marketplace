import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  render
} from '@react-email/components'
import * as React from 'react'

interface RaycastMagicLinkEmailProps {
  token: string
  url: string
}

export const RaycastMagicLinkEmail = ({
  token, url
}: RaycastMagicLinkEmailProps): JSX.Element => (
    <Html>
      <Head />
      <Preview>Log in with this magic link.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`${process.env.NEXT_PUBLIC_SERVER_URL}/hippo-email-sent.png`}
            width={48}
            height={48}
            alt="Hippo image"
          />
          <Heading style={heading}>🪄 Your magic link</Heading>
          <Section style={body}>
            <Text style={paragraph}>
              <Link style={link} href={`${url}/verify-email?token=${token}`}>
                👉 Click here to verify your account 👈
              </Link>
            </Text>
            <Text style={paragraph}>
              If you didn&apos;t request this, please ignore this email.
            </Text>
          </Section>
          <Text style={paragraph}>
            Best,
            <br />- Digital Hippo team
          </Text>
          <Hr style={hr} />
          <Img
            src={`${process.env.NEXT_PUBLIC_SERVER_URL}/hippo-email-sent.png`}
            width={32}
            height={32}
            style={{
              WebkitFilter: 'grayscale(100%)',
              filter: 'grayscale(100%)',
              margin: '20px 0'
            }}
          />
          <Text style={footer}>Digital Hippo Inc.</Text>

        </Container>
      </Body>
    </Html>
)

export default RaycastMagicLinkEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif'
}

const container = {
  margin: '0 auto',
  padding: '20px 25px 48px',
  backgroundImage: 'url("/assets/raycast-bg.png")',
  backgroundPosition: 'bottom',
  backgroundRepeat: 'no-repeat, no-repeat'
}

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  marginTop: '48px'
}

const body = {
  margin: '24px 0'
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px'
}

const link = {
  color: '#FF6363'
}

const hr = {
  borderColor: '#dddddd',
  marginTop: '48px'
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  marginLeft: '4px'
}

export function VerifyEmail (props: RaycastMagicLinkEmailProps): string {
  return render(<RaycastMagicLinkEmail {...props}></RaycastMagicLinkEmail>, { pretty: true })
}
