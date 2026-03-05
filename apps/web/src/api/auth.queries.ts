export const SIGN_IN_MUTATION = `
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
`

export const SIGN_UP_MUTATION = `
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
`

export const ME_QUERY = `
  query Me {
    me {
      id
      email
      role
    }
  }
`
