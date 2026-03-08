class AttachmentsController < ApplicationController
  MAX_FILE_SIZE = 10.megabytes
  ALLOWED_CONTENT_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp"
  ].freeze

  def preflight
    set_cors_headers
    head :no_content
  end

  def create
    set_cors_headers
    return unless authenticate_user!

    file = params[:file]
    unless file.present?
      render json: { error: "File is required" }, status: :unprocessable_content
      return
    end

    unless ALLOWED_CONTENT_TYPES.include?(file.content_type)
      render json: { error: "Only PDF, PNG, JPEG, and WEBP files are allowed" }, status: :unprocessable_content
      return
    end

    if file.size > MAX_FILE_SIZE
      render json: { error: "File must be 10MB or smaller" }, status: :unprocessable_content
      return
    end

    upload = CloudinaryUpload.call(file)

    attachment = {
      url: upload["secure_url"],
      public_id: upload["public_id"],
      resource_type: upload["resource_type"],
      format: upload["format"],
      bytes: upload["bytes"],
      original_filename: file.original_filename,
      content_type: file.content_type
    }

    render json: {
      attachment_token: AttachmentToken.generate(attachment),
      attachment: attachment
    }, status: :created
  rescue StandardError => e
    render json: { error: e.message }, status: :unprocessable_content
  end

  private

  def set_cors_headers
    origin = ENV.fetch("FRONTEND_ORIGIN", "http://localhost:3000")
    response.set_header("Access-Control-Allow-Origin", origin)
    response.set_header("Access-Control-Allow-Methods", "POST, OPTIONS")
    response.set_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
  end

  def authenticate_user!
    return true if current_user

    render json: { error: "Authentication required" }, status: :unauthorized
    false
  end

  def current_user
    token = bearer_token
    return nil if token.blank?

    payload = AuthToken.decode(token)
    User.find_by(id: payload["user_id"])
  rescue JWT::DecodeError, JWT::ExpiredSignature
    nil
  end

  def bearer_token
    header = request.headers["Authorization"].to_s
    return nil unless header.start_with?("Bearer ")

    header.split(" ", 2).last
  end
end
