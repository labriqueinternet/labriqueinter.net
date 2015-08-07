require 'middleman-core/sitemap/resource.rb'

module Middleman
  module Sitemap
    class Resource
      alias_method :old_url, :url
      # When building the links we ignore the i18n path:
      def url
        # TODO, this is currently harcoded for 'fr' and 'en'
        old_url.sub(/^\/[fe][rn]\//, '/')
      end
    end
  end
end
