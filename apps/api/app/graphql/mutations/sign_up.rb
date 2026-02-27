module Mutations
  class SignUp < BaseMutation
    argument :email, String, required: true
    argument :password, String, required: true
    argument :password_confirmation, String, required: true
    argument :role, Types::UserRoleEnum, required: false

    type Types::AuthPayloadType

    def resolve(email:, password:, password_confirmation:, role: nil)
      user = User.new(
        email: email,
        password: password,
        password_confirmation: password_confirmation,
        role: role || "customer"
      )

      if user.save
        token = AuthToken.encode({ user_id: user.id })
        { token: token, user: user }
      else
        raise GraphQL::ExecutionError, user.errors.full_messages.join(", ")
      end
    end
  end
end
