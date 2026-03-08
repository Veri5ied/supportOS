class AddAttachmentFieldsToTickets < ActiveRecord::Migration[7.1]
  def change
    add_column :tickets, :attachment_url, :string
    add_column :tickets, :attachment_public_id, :string
    add_column :tickets, :attachment_resource_type, :string
    add_column :tickets, :attachment_format, :string
    add_column :tickets, :attachment_bytes, :integer
    add_column :tickets, :attachment_original_filename, :string
    add_column :tickets, :attachment_content_type, :string
  end
end
