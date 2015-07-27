require 'middleman-blog/blog_article'

# Meonkey pacthing the article to add extra features:
module Middleman::Blog::BlogArticle

  # Date of the latest update of the article.
  # It is taken from the update YAML field.
  def updated
    updated = data['updated']
    if updated.nil?
      date
    elsif updated.is_a? Time
      updated.in_time_zone
    else
      Time.zone.parse(updated.to_s)
    end
  end

end
