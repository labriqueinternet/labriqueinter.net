#!/usr/bin/env ruby

require 'yaml'
require 'erb'

locales = {}
Dir.glob('locales/*.yml').each do |file|
  locales.merge!(YAML.load(File.read(file)))
end
b = binding()

filename = './conf/nginx.erb'
erb = ERB.new(File.read(filename))
erb.filename= filename
res = erb.result(b)
puts res
