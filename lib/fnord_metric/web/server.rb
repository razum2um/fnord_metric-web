require 'sinatra/base'
require 'sprockets'
require 'fnordmetric'

module FnordMetric
  module Web
    class Server < Sinatra::Base

      if RUBY_VERSION =~ /1.9.\d/
        Encoding.default_external = Encoding::UTF_8
      end

      if ENV['RACK_ENV'] == "test"
        set :raise_errors, true
      end

      enable :session
      set :haml, :format => :html5
      set :views, ::File.expand_path('../../../../app/views', __FILE__)
      set :public_folder, ::File.expand_path('../../../../app/', __FILE__)

      helpers do
        include Rack::Utils
        include FnordMetric::Web::Helpers
      end

      def initialize(opts = {})
        @opts = FnordMetric.options(opts)

        binding.pry
        @namespaces = FnordMetric.namespaces
        @redis = Redis.connect(:url => @opts[:redis_url])

        super(nil)
      end

      get '/' do
        redirect "#{path_prefix}/#{@namespaces.keys.first}"
      end

      get '/stream' do
        if WebSocket.websocket?(env)
          ws = WebSocket.new(env)

          ws.onclose = lambda do |event|
            p [:close, event.code, event.reason]
            ws = nil
          end

          # Return async Rack response
          ws.rack_response
        else
          # standart Rack
          reactor = Reactor.new
          binding.pry
          reactor.execute(self, message).each do |m|
            self.send m.to_json
          end
        end
      end

      get '/:namespace' do
        pass unless current_namespace
        current_namespace.ready!(@redis)
        haml :app
      end

      post '/events' do
        params = JSON.parse(request.body.read) unless params
        halt 400, 'please specify the event_type (_type)' unless params["_type"]
        track_event((8**32).to_s(36), parse_params(params))
      end

      # FIXPAUL move to websockets
      get '/:namespace/dashboard/:dashboard' do
        dashboard = current_namespace.dashboards.fetch(params[:dashboard])

        dashboard.to_json
      end
    end
  end
end
