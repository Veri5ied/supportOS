# GraphQL Endpoints

## Endpoint

- Method: `POST`
- URL: `http://localhost:3001/graphql`
- Header: `Content-Type: application/json`
- Auth header (for protected operations): `Authorization: Bearer <TOKEN>`

## Auth Mutations

### signUp

```graphql
mutation SignUp(
  $email: String!
  $password: String!
  $passwordConfirmation: String!
  $role: UserRoleEnum
) {
  signUp(
    input: {
      email: $email
      password: $password
      passwordConfirmation: $passwordConfirmation
      role: $role
    }
  ) {
    token
    user {
      id
      email
      role
    }
  }
}
```

Variables example:

```json
{
  "email": "customer1@example.com",
  "password": "password123",
  "passwordConfirmation": "password123",
  "role": "CUSTOMER"
}
```

### signIn

```graphql
mutation SignIn($email: String!, $password: String!) {
  signIn(input: { email: $email, password: $password }) {
    token
    user {
      id
      email
      role
    }
  }
}
```

Variables example:

```json
{
  "email": "customer1@example.com",
  "password": "password123"
}
```

## Query Endpoints

### healthCheck

```graphql
query {
  healthCheck
}
```

### me (authenticated)

```graphql
query {
  me {
    id
    email
    role
  }
}
```

### customerPortalAccess (customer-only)

```graphql
query {
  customerPortalAccess
}
```

### agentPortalAccess (agent-only)

```graphql
query {
  agentPortalAccess
}
```

## Curl Examples

### signUp

```bash
curl -s http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { signUp(input:{ email:\"customer1@example.com\", password:\"password123\", passwordConfirmation:\"password123\", role:CUSTOMER }) { token user { id email role } } }"}'
```

### signIn

```bash
curl -s http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { signIn(input:{ email:\"customer1@example.com\", password:\"password123\" }) { token user { id email role } } }"}'
```

### me + customerPortalAccess (authenticated)

```bash
curl -s http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"query":"query { me { id email role } customerPortalAccess }"}'
```

### agentPortalAccess (authenticated)

```bash
curl -s http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"query":"query { agentPortalAccess }"}'
```

## Response Notes

- `signUp` and `signIn` return a `token` and `user` object.
- Use `token` as `Bearer` token for authenticated queries.
- Role errors return GraphQL errors with messages:
  - `Agent access required`
  - `Customer access required`
