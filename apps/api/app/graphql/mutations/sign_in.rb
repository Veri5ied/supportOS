module Mutations
  class SignIn < BaseMutation
    argument :email, String, required: true
    argument :password, String, required: true

    type Types::AuthPayloadType

    def resolve(email:, password:)
      user = User.find_by(email: email.to_s.strip.downcase)

      unless user&.authenticate(password)
        raise GraphQL::ExecutionError, "Invalid credentials"
      end

      token = AuthToken.encode({ user_id: user.id })
      { token: token, user: user }
    end
  end
end
