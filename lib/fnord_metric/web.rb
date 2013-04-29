# encoding: utf-8
module FnordMetric
  module Web
    autoload :Server,            'fnord_metric/web/server'
    autoload :Reactor,           'fnord_metric/web/reactor'
    autoload :Websocket,         'fnord_metric/web/websocket'
    autoload :Helpers,           'fnord_metric/web/helpers'
    autoload :Namespace,         'fnord_metric/web/namespace'
    autoload :Dashboard,         'fnord_metric/web/dashboard'
    autoload :Widget,            'fnord_metric/web/widget'
    autoload :BarsWidget,        'fnord_metric/web/widgets/bars_widget'
    autoload :HtmlWidget,        'fnord_metric/web/widgets/html_widget'
    autoload :NumbersWidget,     'fnord_metric/web/widgets/numbers_widget'
    autoload :PieWidget,          'fnord_metric/web/widgets/pie_widget'
    autoload :TimeseriesWidget, 'fnord_metric/web/widgets/timeseries_widget'
    autoload :ToplistWidget,     'fnord_metric/web/widgets/toplist_widget'
  end
end

require 'fnord_metric/web/railtie' if defined? ::Rails::Railtie
FnordMetric::Namespace.send :include, FnordMetric::Web::Namespace
