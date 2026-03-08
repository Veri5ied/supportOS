module AttachmentToken
  module_function

  def generate(payload)
    verifier.generate(payload)
  end

  def verify(token)
    verifier.verify(token)
  end

  def verifier
    Rails.application.message_verifier(:ticket_attachment)
  end
end
