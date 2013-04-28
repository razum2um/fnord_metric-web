require 'rails'

module FnordMetric
  module Web
    class Railtie < ::Rails::Railtie
      def root
        ::File.expand_path('../../../../app', __FILE__)
      end

      def expand_path(dir)
        ::File.join(root, 'assets', dir)
      end

      initializer :append_assets_path, :group => :all do |app|
        app.config.assets.paths.unshift expand_path 'javascripts'
        app.config.assets.paths.unshift expand_path 'stylesheets'
        app.config.assets.paths.unshift expand_path 'images'
      end
    end
  end
end