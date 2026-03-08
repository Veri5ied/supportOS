module Types
  class TicketType < Types::BaseObject
    field :id, ID, null: false
    field :subject, String, null: false
    field :description, String, null: false
    field :status, Types::TicketStatusEnum, null: false
    field :closed_at, GraphQL::Types::ISO8601DateTime, null: true
    field :attachment_url, String, null: true
    field :attachment_public_id, String, null: true
    field :attachment_resource_type, String, null: true
    field :attachment_format, String, null: true
    field :attachment_bytes, Integer, null: true
    field :attachment_original_filename, String, null: true
    field :attachment_content_type, String, null: true
    field :customer, Types::UserType, null: false
    field :comments, [Types::CommentType], null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
