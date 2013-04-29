# encoding: utf-8
require 'fnord_metric/web/railtie' if defined? ::Rails::Railtie

module FnordMetric
  module Web
    autoload :Server,    'fnord_metric/web/server'
    autoload :Reactor,   'fnord_metric/web/reactor'
    autoload :Websocket, 'fnord_metric/web/websocket'
    autoload :Helpers,   'fnord_metric/web/helpers'
  end
end

