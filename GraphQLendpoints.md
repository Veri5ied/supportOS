# GraphQL Endpoints

## Endpoint

- Method: `POST`
- URL: `http://localhost:3001/graphql`
- Header: `Content-Type: application/json`
- Auth header (for protected operations): `Authorization: Bearer <TOKEN>`

## Attachment Upload Endpoint

- Method: `POST`
- URL: `http://localhost:3001/attachments`
- Header: `Authorization: Bearer <TOKEN>`
- Body: `multipart/form-data` with `file`
- Allowed types: `application/pdf`, `image/png`, `image/jpeg`, `image/webp`
- Max size: `10MB`

Response fields:

- `attachment_token`
- `attachment.url`
- `attachment.original_filename`
- `attachment.content_type`

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

## Ticket Mutations

### createTicket (customer-only)

```graphql
mutation CreateTicket($subject: String!, $description: String!, $attachmentToken: String) {
  createTicket(input: { subject: $subject, description: $description, attachmentToken: $attachmentToken }) {
    id
    subject
    description
    status
    attachmentUrl
    attachmentOriginalFilename
    attachmentContentType
    attachmentBytes
    customer {
      id
      email
    }
    createdAt
  }
}
```

Variables example:

```json
{
  "subject": "Unable to login",
  "description": "I keep getting invalid credentials",
  "attachmentToken": "<ATTACHMENT_TOKEN_FROM_UPLOAD_ENDPOINT>"
}
```

### addComment (authenticated)

```graphql
mutation AddComment($ticketId: ID!, $body: String!) {
  addComment(input: { ticketId: $ticketId, body: $body }) {
    id
    body
    ticketId
    user {
      id
      email
      role
    }
    createdAt
  }
}
```

Variables example:

```json
{
  "ticketId": "1",
  "body": "We are investigating this now."
}
```

### updateTicketStatus (agent-only)

```graphql
mutation UpdateTicketStatus($ticketId: ID!, $status: TicketStatusEnum!) {
  updateTicketStatus(input: { ticketId: $ticketId, status: $status }) {
    id
    status
    closedAt
    updatedAt
  }
}
```

Variables example:

```json
{
  "ticketId": "1",
  "status": "IN_PROGRESS"
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

### myTickets (customer-only)

```graphql
query {
  myTickets {
    id
    subject
    description
    status
    closedAt
    attachmentUrl
    attachmentOriginalFilename
    attachmentContentType
    attachmentBytes
    createdAt
  }
}
```

### allTickets (agent-only)

```graphql
query {
  allTickets {
    id
    subject
    description
    status
    closedAt
    attachmentUrl
    attachmentOriginalFilename
    attachmentContentType
    attachmentBytes
    customer {
      id
      email
    }
    createdAt
  }
}
```

### ticket (authenticated)

```graphql
query Ticket($id: ID!) {
  ticket(id: $id) {
    id
    subject
    description
    status
    closedAt
    attachmentUrl
    attachmentOriginalFilename
    attachmentContentType
    attachmentBytes
    comments {
      id
      body
      user {
        id
        email
        role
      }
      createdAt
    }
  }
}
```

Variables example:

```json
{
  "id": "1"
}
```

### closedTicketsCsv (agent-only)

```graphql
query {
  closedTicketsCsv
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

### createTicket (authenticated customer)

```bash
curl -s http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"query":"mutation { createTicket(input:{ subject:\"Unable to login\", description:\"I keep getting invalid credentials\", attachmentToken:\"<ATTACHMENT_TOKEN>\" }) { id subject status attachmentUrl } }"}'
```

### upload attachment (authenticated)

```bash
curl -s http://localhost:3001/attachments \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@/absolute/path/to/file.pdf"
```

### addComment (authenticated)

```bash
curl -s http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"query":"mutation { addComment(input:{ ticketId:1, body:\"We are investigating this now.\" }) { id body user { email role } } }"}'
```

### closedTicketsCsv (authenticated agent)

```bash
curl -s http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"query":"query { closedTicketsCsv }"}'
```

## Response Notes

- `signUp` and `signIn` return a `token` and `user` object.
- Use `token` as `Bearer` token for authenticated queries.
- Ticket status enum values: `OPEN`, `IN_PROGRESS`, `CLOSED`.
- Attachment upload is ticket-level and not used in comment chat.
- Role errors return GraphQL errors with messages:
  - `Agent access required`
  - `Customer access required`
- Ticket authorization/comment rule errors include:
  - `Not authorized for this ticket`
  - `Customer can comment only after an agent comment`
