class User < ApplicationRecord
  enum role: { customer: 0, agent: 1 }, _default: :customer
  has_secure_password

  has_many :tickets, foreign_key: :customer_id, dependent: :destroy
  has_many :comments, dependent: :destroy

  before_validation :normalize_email

  validates :email, presence: true, uniqueness: { case_sensitive: false }

  private

  def normalize_email
    self.email = email.to_s.strip.downcase
  end
end
