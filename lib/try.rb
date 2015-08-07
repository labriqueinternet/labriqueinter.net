# A rack module wich forst tries to find a localized version of the file
# (in /$lang/) and then a shared version (in /).
class Try
  def initialize(app)
    @app = app
  end
  def call(env)
    path = env['PATH_INFO']
    if $lang
      env['PATH_INFO'] = '/' + $lang.to_s + env['PATH_INFO']
      res = @app.call(env)
      if res[0] != 404
        return res
      end
    end
    env['PATH_INFO'] = path
    @app.call(env)
  end
end
