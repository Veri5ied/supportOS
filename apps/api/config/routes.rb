Rails.application.routes.draw do
  match "/graphql", to: "graphql#preflight", via: :options
  post "/graphql", to: "graphql#execute"

  get "up" => "rails/health#show", as: :rails_health_check

end
