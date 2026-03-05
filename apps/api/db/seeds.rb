User.find_or_create_by!(email: 'agent1@example.com') do |user|
  user.password = 'password123'
  user.password_confirmation = 'password123'
  user.role = :agent
end

User.find_or_create_by!(email: 'customer1@example.com') do |user|
  user.password = 'password123'
  user.password_confirmation = 'password123'
  user.role = :customer
end
