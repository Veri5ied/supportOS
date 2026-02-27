
module Types
  class QueryType < Types::BaseObject
    field :health_check, String, null: false
    field :me, Types::UserType, null: true
    field :agent_portal_access, String, null: false
    field :customer_portal_access, String, null: false

    def health_check
      "ok"
    end

    def me
      context[:current_user]
    end

    def agent_portal_access
      authenticate_user!
      raise GraphQL::ExecutionError, "Agent access required" unless context[:current_user].agent?
      "ok"
    end

    def customer_portal_access
      authenticate_user!
      raise GraphQL::ExecutionError, "Customer access required" unless context[:current_user].customer?
      "ok"
    end

    private

    def authenticate_user!
      raise GraphQL::ExecutionError, "Authentication required" unless context[:current_user]
    end
  end
end
