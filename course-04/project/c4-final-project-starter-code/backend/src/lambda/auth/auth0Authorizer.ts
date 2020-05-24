import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')
const testCert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJKh8ZJe3aSc3eMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi16MXIwcWE4by5hdXRoMC5jb20wHhcNMjAwNTEwMTIwNzAyWhcNMzQw
MTE3MTIwNzAyWjAhMR8wHQYDVQQDExZkZXYtejFyMHFhOG8uYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA8qQpHkgd9wKBKYhPW/kuJG/b
4Zv9IauhMmCYymx6BzkLLu/GvrUnguaGJPVE8qxF3OJs2ZbsVc83wJ2rObQF4gNr
kxVr7UY7hpjJhNfXTNOzeofq6C9YvaA9Pc8CiLh2YDfWgX/nkHmxQ9Wf0tyZ8//b
cKGkRdEghBI2TUPMo/toisBdyfXsUvoi2pW6rjnH3r70V51x47ddA0z+MVRZa85+
X66l51wh3z8IFVZ8RrAOHLIKS3j351zlImyfrCRieP02+Tihk9BN9pZiLunjodDE
9g470E/joMEaEzpbkZc2v/Y2TLA6epPb77qBnJFtt+LN7EtHynpKgKxKKZ9WKQID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQ91hWUY/NKIp/D9Pdx
xKHN01H87DAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAC7spo74
hI3VA5LdZ4+s76HVs1akpLml5/YNVa4w74lJaGYcqC8aA1mrB1iqyb6yPmEKEWNn
cfNPrI8uyNJPHLgZzYoW0Y5gV+dUHi6kSV3xHGTiianZev71bnM3sRPrh4tY4+Uj
8W6tVVQ7e+SZVujWoUDMgAOYqFd+/L1CJnKZXDAWL7kQVPrACJmhWify1RB90eHa
tFQdq9VmNngI0/mNBqbHDs706tAbn3Mxlch2OUf8rsq0zrhCTTH05AVUA9R6ZgC/
QcmE+lJaToWsupSi7OOOoO2nPHT1/mW+mgKSIykilU4ETXBoQ5IxF773ziNNz+mX
cVP76IHGbEMWbuo=
-----END CERTIFICATE-----`

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-z1r0qa8o.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  console.log('jwt', jwt)
  const response = await Axios.get(jwksUrl)

  console.log('response data keys', response.data.keys)

  const responseKeys = response.data.keys[0]
  console.log('response keys', responseKeys)
  const cert = responseKeys.x5c[0];

  console.log('response certxc5',cert)

  verify(token, testCert, { algorithms: ['RS256'] }) as JwtPayload
  console.log('verified')

  return jwt.payload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
