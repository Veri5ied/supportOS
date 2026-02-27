class CreateTickets < ActiveRecord::Migration[7.1]
  def change
    create_table :tickets do |t|
      t.references :customer, null: false, foreign_key: { to_table: :users }
      t.string :subject, null: false
      t.text :description, null: false
      t.integer :status, null: false, default: 0
      t.datetime :closed_at

      t.timestamps
    end

    add_index :tickets, :status
    add_index :tickets, :closed_at
  end
end
