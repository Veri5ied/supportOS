module Types
  class TicketType < Types::BaseObject
    field :id, ID, null: false
    field :subject, String, null: false
    field :description, String, null: false
    field :status, Types::TicketStatusEnum, null: false
    field :closed_at, GraphQL::Types::ISO8601DateTime, null: true
    field :customer, Types::UserType, null: false
    field :comments, [Types::CommentType], null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
