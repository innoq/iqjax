Gem::Specification.new do |s|
  s.name        = "iqjax"
  s.version     = "0.1.0"
  s.platform    = Gem::Platform::RUBY
  s.authors     = ["FND", "Till Schulte-Coerne"]
  s.email       = ["", "till.schulte-coerne@innoq.com"]
  s.homepage    = "http://github.com/innoq/iqjax"
  s.summary     = "iQjax - a JS library for real unobtrusive Ajax"
  s.description = s.summary
  s.extra_rdoc_files = ['README.md', 'LICENSE']

  s.add_dependency "bundler"

  s.files = %w(LICENSE README.md Rakefile iqjax.gemspec iqjax.js) + Dir.glob("{vendor,assets,test}/**/*")
  s.test_files = Dir.glob("{test}/**/*")
end
