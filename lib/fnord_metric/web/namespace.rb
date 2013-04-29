module FnordMetric
  module Web
    module Namespace

      self.included do |base|
        base.send :attr_reader, :dashboards, :flags
        base.instance_eval do
          @@opts += [
              :widget, :dashboard, :hide_active_users,
              :hide_overview, :hide_gauge_explorer
          ]
        end
      end

      def initialize(key, opts)
        super
        @dashboards = Hash.new
        @flags = {
            :hide_active_users => (FnordMetric.options[:enable_active_users] == false),
            :hide_gauge_explorer => (FnordMetric.options[:enable_gauge_explorer] == false)
        }
      end

      def dashboards(name=nil, opts = {})
        return @dashboards unless name
        dash = FnordMetric::Web::Dashboard.new(opts.merge(:title => name))
        @dashboards[dash.token.to_s] ||= dash
      end

      def opt_widget(dashboard, widget)
        widget = build_widget(widget) if widget.is_a?(Hash)
        dashboards(dashboard).add_widget(widget)
      end

      def opt_dashboard(dashboard, opts)
        dashboards(dashboard, opts)
      end

      def build_widget(opts)
        _gauges = [opts[:gauges]].flatten.map do |g|
          @gauges[g] || FnordMetric::ZeroConfigGauge.new(g, self)
        end
        widget_klass = "FnordMetric::Web::#{opts.fetch(:type).to_s.capitalize}Widget"
        widget_klass.constantize.new(opts.merge(:gauges => _gauges))
      end

      def opt_hide_active_users
        @flags[:hide_active_users] = true
      end

      def opt_hide_gauge_explorer
        @flags[:hide_gauge_explorer] = true
      end

      def opt_hide_overview
        @flags[:hide_overview] = true
      end
    end
  end
end
