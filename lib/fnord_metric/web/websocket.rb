require 'faye/websocket'

module FnordMetric
  module Web
    class Websocket < Faye::WebSocket

      def initialize(env)
        @uuid = get_uuid
        @reactor = Reactor.new
        super
      end

      def onopen(event)
        @reactor.ready!
      end

      def onmessage(event)
        begin
          message = JSON.parse(event.data)
        rescue
          puts "websocket: invalid json"
        else
          message["_eid"] ||= get_uuid
          message["_sender"] = @uuid

          @reactor.execute(self, message).each do |m|
            self.send m.to_json
          end
        end
      rescue Exception => e
        FnordMetric.error("[WebSocket] #{e.to_s}")
        puts e.backtrace.join("\n")
      end

    private

      def get_uuid
        rand(8**64).to_s(36)
      end
    end
  end
end

