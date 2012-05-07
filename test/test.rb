# encoding: UTF-8

# Copyright 2012 innoQ Deutschland GmbH
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

require 'test/unit'

class ClientTest < Test::Unit::TestCase

  def test_PhantomJS_availability
    system("phantomjs --version")
    assert $?.success?
  end

  def test_client_side_test_suites
    assert _run("index.html")
  end

  def _run(suite)
    path = File.expand_path(File.dirname(__FILE__))
    system("cd #{path} && phantomjs lib/run-qunit.js #{suite}")
    return $?.success?
  end

end
