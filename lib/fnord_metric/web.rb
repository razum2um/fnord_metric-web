# encoding: utf-8
require 'fnord_metric/web/railtie' if defined? ::Rails::Railtie

module FnordMetric
  module Web
    autoload :Server, 'fnord_metric/web/server'
    autoload :Helpers, 'fnord_metric/web/helpers'
  end
end

