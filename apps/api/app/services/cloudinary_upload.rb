require "base64"
require "json"
require "net/http"

class CloudinaryUpload
  def self.call(file)
    cloud_name = ENV["CLOUDINARY_CLOUD_NAME"].to_s
    upload_preset = ENV["CLOUDINARY_UPLOAD_PRESET"].to_s
    raise "Cloudinary is not configured" if cloud_name.blank? || upload_preset.blank?

    file.tempfile.rewind
    encoded = Base64.strict_encode64(file.tempfile.read)
    data_uri = "data:#{file.content_type};base64,#{encoded}"

    uri = URI("https://api.cloudinary.com/v1_1/#{cloud_name}/auto/upload")
    request = Net::HTTP::Post.new(uri)
    request.set_form_data(
      {
        "file" => data_uri,
        "upload_preset" => upload_preset,
        "folder" => ENV.fetch("CLOUDINARY_FOLDER", "supportos")
      }
    )

    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
      http.request(request)
    end
    payload = JSON.parse(response.body)
    raise(payload["error"]["message"]) if payload["error"].present?
    raise("Attachment upload failed") unless response.code.to_i.between?(200, 299)

    payload
  end
end
