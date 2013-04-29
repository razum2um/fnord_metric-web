require "sinatra"
require "sprockets"
if development?
  require "sinatra/reloader"
  require "pry-debugger"
  require "pry-stack_explorer"
end
require "fnord_metric/web"

map '/assets' do
  environment = Sprockets::Environment.new
  environment.append_path 'app/assets/javascripts'
  environment.append_path 'app/assets/stylesheets'
  environment.append_path 'app/assets/images'
  run environment
end

map '/' do
  run FnordMetric::Web::Server
end
