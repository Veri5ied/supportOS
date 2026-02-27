namespace :tickets do
  task send_daily_reminders: :environment do
    OpenTicketsReminderJob.perform_now
  end
end
