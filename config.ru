#!/usr/bin/env rackup

# This rackup file is used to test the static website.
# Usage:
#   I18N=fr rackup
#   I18N ./config.ru

require 'rack'
require 'rack/contrib/try_static'

lang = if ENV['I18N'] then ENV['I18N'].to_sym else :fr end

# A rack module to disable caching
class NoCache
  def initialize(app, options)
    @app = app
  end
  def call(env)
    res = @app.call(env)
    res[1]['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    res[1]['Expires'] = '0'
    res
  end
end

use NoCache, {}

# Try a localized file (in /$lang/):
use Rack::TryStatic,
    :root => "build/#{lang}",
    :urls => %w[/],
    :try => [ " index.html" ]

# Try a shared file (in /):
use Rack::TryStatic,
    :root => "build/",
    :urls => %w[/],
    :try => [ "index.html" ]

# Otherwise 404:
run Proc.new { |env|
  ['404', {'Content-Type' => 'text/html'}, ['Not found.\n']]
}
