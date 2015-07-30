# Middleman configuration file.
# Usage:
#   I18N=fr middleman server
#   middleman build
#   rackup
#   middleman deploy

require "lib/try"
require "lib/resource"
require "lib/blog"

require "i18n"

Time.zone = "Paris"

set :css_dir, 'css'
set :js_dir, 'js'
set :images_dir, 'img'
set :markdown_engine, :kramdown
set :build_dir, "build/"

$locales = [:fr, :en]
$lang = if ENV["IN18N"] then ENV["IN18N"].to_sym else :fr end

activate :i18n, :mount_at_root => false, :langs => $locales

$locales.each do |locale|
  activate :blog do |blog|
    blog.name = locale.to_s
    blog.paginate = true
    blog.per_page = 10
    # blog.tag_template = "tag.html"
    blog.calendar_template = "proxy/calendar.html"
    blog.sources = "posts/#{locale.to_s}/{year}-{month}-{day}-{title}.html"
    blog.permalink = "#{locale}/{year}/{month}/{day}/{title}/index.html"
    # blog.taglink = "tags/{tag}/index.html"
    blog.year_link = "#{locale}/{year}/index.html"
    blog.month_link = "#{locale}/{year}/{month}/index.html"
    blog.day_link = "#{locale}/{year}/{month}/{day}/index.html"
  end
end

# Atom feed:
ignore "proxy/*"
ready do
  $locales.each do |locale|
      proxy "/#{locale}/feed.xml",  "/proxy/feed.xml", :locals => {
        :blog => blog(locale.to_s), :l => locale
      }
  end
end

# This needs to be fixed in order to use "middleman deploy":
activate :deploy do |deploy|
  deploy.method = :rsync
  deploy.host  = "host.example.com"
  deploy.path  = "/srv/labriqueinter.net/"
  deploy.user  = "mylogin"
  deploy.flags ="-avz --delete --chmod=u=rwX,go=rX"
end

configure :development do
  activate :livereload, :host=>"127.0.0.1"
  use Try
end

configure :build do
  activate :minify_css
  activate :minify_javascript
  activate :minify_html
end
