class ApplicationController < ActionController::API
  private

  def authenticate_user!
    return if current_user

    render json: { error: "Authentication required" }, status: :unauthorized
  end

  def current_user
    return @current_user if defined?(@current_user)

    token = bearer_token
    @current_user =
      if token.present?
        payload = AuthToken.decode(token)
        User.find_by(id: payload["user_id"])
      end
  rescue JWT::DecodeError, JWT::ExpiredSignature
    @current_user = nil
  end

  def bearer_token
    header = request.headers["Authorization"].to_s
    return nil unless header.start_with?("Bearer ")

    header.split(" ", 2).last
  end
end
