module Mutations
  class CreateTicket < BaseMutation
    argument :subject, String, required: true
    argument :description, String, required: true
    argument :attachment_token, String, required: false

    type Types::TicketType

    def resolve(subject:, description:, attachment_token: nil)
      require_customer!

      attachment_attributes = resolve_attachment_attributes(attachment_token)

      Ticket.create!(
        customer: current_user,
        subject: subject,
        description: description,
        status: :open,
        **attachment_attributes
      )
    end

    private

    def resolve_attachment_attributes(attachment_token)
      return {} if attachment_token.blank?

      payload = AttachmentToken.verify(attachment_token)
      {
        attachment_url: payload["url"] || payload[:url],
        attachment_public_id: payload["public_id"] || payload[:public_id],
        attachment_resource_type: payload["resource_type"] || payload[:resource_type],
        attachment_format: payload["format"] || payload[:format],
        attachment_bytes: payload["bytes"] || payload[:bytes],
        attachment_original_filename: payload["original_filename"] || payload[:original_filename],
        attachment_content_type: payload["content_type"] || payload[:content_type]
      }
    rescue ActiveSupport::MessageVerifier::InvalidSignature
      raise GraphQL::ExecutionError, "Invalid attachment token"
    end
  end
end
