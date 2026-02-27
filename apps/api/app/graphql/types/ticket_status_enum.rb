module Types
  class TicketStatusEnum < Types::BaseEnum
    value "OPEN", value: "open"
    value "IN_PROGRESS", value: "in_progress"
    value "CLOSED", value: "closed"
  end
end
