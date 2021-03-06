module FnordMetric
  module Web
    class Dashboard

      attr_accessor :widgets

      def initialize(options={})
        raise "please provide a :title" unless options[:title]
        @widgets = Array.new
        @options = options
      end

      def add_widget(w)
        @widgets << w
      end

      def title
        @options[:title]
      end

      def group
        @options[:group] || "Dashboards"
      end

      def token
        token = title.to_s.gsub(/[\W]/, '')
        token = Digest::SHA1.hexdigest(title.to_s) if token.empty?
        token
      end

      def to_json
        {
          :title => title,
          :widgets => {}.tap { |wids|
            @widgets.each do |w|
              wids[w.token] = w.render
            end
          }
        }.to_json
      end
    end
  end
end