
module Types
  class BaseObject < GraphQL::Schema::Object
    edge_type_class(Types::BaseEdge)
    connection_type_class(Types::BaseConnection)
    field_class Types::BaseField

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
