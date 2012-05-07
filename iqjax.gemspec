require File.expand_path('../lib/iqjax/version', __FILE__)

Gem::Specification.new do |s|
  s.name        = "iqjax"
  s.version     = Iqjax::VERSION
  s.platform    = Gem::Platform::RUBY
  s.authors     = ["FND", "Till Schulte-Coerne"]
  s.email       = ["", "till.schulte-coerne@innoq.com"]
  s.homepage    = "http://github.com/innoq/iqjax"
  s.summary     = "iQjax - a JS library for real unobtrusive Ajax"
  s.description = s.summary
  s.extra_rdoc_files = ['README.md', 'LICENSE']

  s.add_dependency "bundler"
  s.add_dependency "railties", ">= 3.2.0", "< 5.0"

  s.files = %w(LICENSE README.md Rakefile iqjax.gemspec iqjax.js) + Dir.glob("{lib,vendor,test}/**/*")
  s.test_files = Dir.glob("{test}/**/*")
  
   s.require_path = 'lib'
end
