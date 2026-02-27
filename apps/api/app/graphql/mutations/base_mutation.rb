
module Mutations
  class BaseMutation < GraphQL::Schema::RelayClassicMutation
    argument_class Types::BaseArgument
    field_class Types::BaseField
    input_object_class Types::BaseInputObject
    object_class Types::BaseObject

    private

    def current_user
      context[:current_user]
    end

    def authenticate_user!
      raise GraphQL::ExecutionError, "Authentication required" unless current_user
    end

    def require_agent!
      authenticate_user!
      raise GraphQL::ExecutionError, "Agent access required" unless current_user.agent?
    end

    def require_customer!
      authenticate_user!
      raise GraphQL::ExecutionError, "Customer access required" unless current_user.customer?
    end
  end
end
