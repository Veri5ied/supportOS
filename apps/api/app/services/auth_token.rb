class AuthToken
  ALGORITHM = "HS256"

  def self.encode(payload, expires_at: 7.days.from_now)
    JWT.encode(payload.merge(exp: expires_at.to_i), secret, ALGORITHM)
  end

  def self.decode(token)
    JWT.decode(token, secret, true, algorithm: ALGORITHM).first
  end

  def self.secret
    Rails.application.secret_key_base
  end
end
