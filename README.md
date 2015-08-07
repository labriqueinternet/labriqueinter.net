# labriqueinter.net

Website

## Usage

Install the dependencies:

~~~sh
bundle install --path vendor/bundle --binstubs
~~~

Live server (the pages reload themselves when the files are modified):

~~~sh
I18N=fr middleman server
~~~

Generate the static website:

~~~sh
middleman build
~~~

Test the static website:

~~~sh
I18N=fr rackup
~~~

Deploy the static website:

~~~
middleman deploy
~~~

## Howto

### Adding an localizable page

Create pages in `sources/localizable/foo.$en.html.md`.

### Localizing the layout

In the layout:

~~~erb
<%n I18.t(:foobar) %>
~~~

Define the translations in `locales/$locale.yml`:

~~~
en:
  foo: FooBar
~~~

Geneate the nginx configuration:

~~~sh
./conf/nginx.rb
~~~

### Add a blog post

Create a file in `source/${lang}/YYYY-MM-DD-title.html.md`.
