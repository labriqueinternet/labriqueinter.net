# labriqueinter.net

Website

## Usage

~~~sh
bundle install --path vendor/bundle --binstubs
export I18N=fr
middleman server
middleman build && middleman deploy
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

### Add a blog post

Create a file in `source/${lang}/YYYY-MM-DD-title.html.md`.
