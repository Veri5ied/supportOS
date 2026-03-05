export type GraphQLVariables = Record<string, unknown>

const AUTH_STORAGE_KEY = 'supportos_auth_token'
let authToken: string | null = null

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:3001'
export const GRAPHQL_ENDPOINT = `${API_BASE_URL}/graphql`

function readStoredToken() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(AUTH_STORAGE_KEY)
}

export function setAuthToken(token: string | null) {
  authToken = token
  if (typeof window !== 'undefined') {
    if (token) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, token)
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }
}

export function getAuthToken() {
  if (!authToken) {
    authToken = readStoredToken()
  }
  return authToken
}

export async function gqlClient<T>(
  query: string,
  variables: GraphQLVariables = {},
) {
  const token = getAuthToken()
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  const body = (await res.json()) as {
    data?: T
    errors?: Array<{ message?: string }>
  }

  if (body.errors?.length) {
    throw new Error(body.errors[0]?.message || 'GraphQL request failed')
  }

  if (!body.data) {
    throw new Error('No data returned from GraphQL server')
  }

  return body.data
}
