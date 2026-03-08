require "test_helper"
require "tempfile"

class AttachmentsUploadTest < ActionDispatch::IntegrationTest
  def setup
    @customer = User.create!(
      email: "upload-customer-#{SecureRandom.hex(4)}@example.com",
      password: "password123",
      password_confirmation: "password123",
      role: :customer
    )
    @token = AuthToken.encode({ user_id: @customer.id })
  end

  def test_uploads_pdf_and_returns_attachment_token
    uploaded_file = rack_uploaded_file(filename: "invoice.pdf", content_type: "application/pdf", content: "%PDF-1.4")

    CloudinaryUpload.singleton_class.stub(:call, {
      "secure_url" => "https://res.cloudinary.com/demo/raw/upload/v1/supportos/invoice.pdf",
      "public_id" => "supportos/invoice",
      "resource_type" => "raw",
      "format" => "pdf",
      "bytes" => 2048
    }) do
      post "/attachments", params: { file: uploaded_file }, headers: auth_headers
    end

    assert_response :created
    body = JSON.parse(response.body)
    assert body["attachment_token"].present?
    assert_equal "invoice.pdf", body.dig("attachment", "original_filename")
    assert_equal "application/pdf", body.dig("attachment", "content_type")
  end

  def test_requires_authentication
    uploaded_file = rack_uploaded_file(filename: "proof.pdf", content_type: "application/pdf", content: "%PDF-1.4")
    post "/attachments", params: { file: uploaded_file }

    assert_response :unauthorized
    body = JSON.parse(response.body)
    assert_equal "Authentication required", body["error"]
  end

  def test_rejects_unsupported_file_type
    uploaded_file = rack_uploaded_file(filename: "notes.txt", content_type: "text/plain", content: "hello")
    post "/attachments", params: { file: uploaded_file }, headers: auth_headers

    assert_response :unprocessable_content
    body = JSON.parse(response.body)
    assert_equal "Only PDF, PNG, JPEG, and WEBP files are allowed", body["error"]
  end

  private

  def auth_headers
    {
      "Authorization" => "Bearer #{@token}"
    }
  end

  def rack_uploaded_file(filename:, content_type:, content:)
    tempfile = Tempfile.new(filename)
    tempfile.binmode
    tempfile.write(content)
    tempfile.rewind
    Rack::Test::UploadedFile.new(tempfile.path, content_type, true, original_filename: filename)
  end
end
