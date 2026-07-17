import { getPayload } from 'payload'
import config from '@payload-config'

interface Args {
  initOptions?: Record<string, unknown>
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function getPayloadClient ({ initOptions = {} }: Args = {}) {
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error('PAYLOAD_SECRET is missing')
  }

  return await getPayload({
    config,
    ...initOptions
  })
}
