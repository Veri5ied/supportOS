require "test_helper"

class AuthTokenTest < ActiveSupport::TestCase
  def test_encodes_and_decodes_payload
    token = AuthToken.encode({ user_id: 42 }, expires_at: 1.day.from_now)

    payload = AuthToken.decode(token)

    assert_equal 42, payload["user_id"]
    assert payload["exp"].present?
  end

  def test_raises_for_expired_token
    token = AuthToken.encode({ user_id: 42 }, expires_at: 1.minute.ago)

    assert_raises(JWT::ExpiredSignature) do
      AuthToken.decode(token)
    end
  end
end
