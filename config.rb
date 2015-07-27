require "lib/blog"

Time.zone = "Paris"

# We are building only one language at a time.
$locales = [:en, :fr]
$locale = (ENV['I18N'] || 'fr').to_sym

set :css_dir, 'css'
set :js_dir, 'js'
set :images_dir, 'img'
set :markdown_engine, :kramdown
set :build_dir, "build/#{$locale}"

## Extensions

activate :i18n, :mount_at_root => $locale, :langs => [$locale]

# Blog:
activate :blog do |blog|
  blog.name = "Blog"
  blog.paginate = true
  blog.per_page = 10
  # blog.tag_template = "tag.html"
  blog.calendar_template = "proxy/calendar.html"
  blog.sources = "posts/#{$locale.to_s}/{year}-{month}-{day}-{title}.html"
  blog.permalink = "{year}/{month}/{day}/{title}/index.html"
  # blog.taglink = "tags/{tag}/index.html"
  blog.year_link = "{year}/index.html"
  blog.month_link = "{year}/{month}/index.html"
  blog.day_link = "{year}/{month}/{day}/index.html"
end

# Ignore the other languages:
$locales.each do |lang|
  if lang != $locale then
    ignore "posts/#{lang.to_s}/*"
  end
end

# Atom feed:
ignore "proxy/*"
ready do
  proxy "/feed.xml",  "/proxy/feed.xml"
end

# This needs to be fixed in order to use "middleman deploy":
activate :deploy do |deploy|
  deploy.method = :rsync
  deploy.host  = "host.example.com"
  deploy.path  = "/srv/labriqueinter.net/#{$locale.to_s}/"
  deploy.user  = "mylogin"
  deploy.flags ="-avz --delete --chmod=u=rwX,go=rX"
end

configure :development do
  activate :livereload, :host=>"127.0.0.1"
end

configure :build do
  activate :minify_css
  activate :minify_javascript
  activate :minify_html
end
