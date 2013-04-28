# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'fnord_metric/web/version'

Gem::Specification.new do |spec|
  spec.name          = "fnord_metric-web"
  spec.version       = FnordMetric::Web::VERSION
  spec.authors       = ["Vlad Bokov"]
  spec.email         = ["razum2um@mail.ru"]
  spec.description   = %q{Mountable Rails-3 engine for embedding FnordMetric}
  spec.summary       = %q{Mountable Rails-3 engine for embedding FnordMetric}
  spec.homepage      = ""
  spec.license       = "MIT"

  spec.files         = `git ls-files`.split($/)
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 1.3"
  spec.add_development_dependency "sinatra-reloader"
  spec.add_development_dependency "rake"

  spec.add_dependency "fnordmetric"
  spec.add_dependency "sinatra"
  spec.add_dependency "sprockets"
end
