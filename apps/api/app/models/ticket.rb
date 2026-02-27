class Ticket < ApplicationRecord
  enum status: { open: 0, in_progress: 1, closed: 2 }, _default: :open

  belongs_to :customer, class_name: "User"
  has_many :comments, dependent: :destroy

  validates :subject, presence: true
  validates :description, presence: true
end
