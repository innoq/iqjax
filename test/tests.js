/*jslint vars: true, unparam: true, browser: true, white: true */
/*global jQuery, QUnit, module, test, ok, strictEqual, raises */

/* Copyright 2012 innoQ Deutschland GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

(function($) {

"use strict";

module("iQjax", {

	setup: function() {
		var fixtures = $("#qunit-fixture");
		this.fixturesHtml = fixtures.html();
		fixtures.empty(); // prevents duplicate IDs
		this.ctx = $("<div><p /></div>").appendTo(document.body);

    $.mockjaxSettings['log'] = function(msg) { };

		// Mock /items/:id/edit
		$.mockjax(function(settings) {
			var match = settings.url.match(/^\/items\/([0-9]+)\/edit$/);
			if (match) {
				return {
					responseTime: 10,
					responseText: '<form action="/items/' + match[1] +
							'" method="POST"><input type="Submit" value="Save"></form>'
				};
			}
			return;
		});
		// Mock /items/new
		$.mockjax({
			url: "/items/new",
			responseText: '<form action="/items" method="POST"><input type="Submit" value="Save"></form>'
		});
		// Mock /items/:id and /items (the #create action)
		$.mockjax(function(settings) {
			var match = settings.url.match(/^\/items(\/([0-9]+))?(\?.*)?$/);
			if (match) {
				var itemName = match[2] || "new";
				return {
					responseTime: 10,
					headers: {
						"X-IQJAX": "item" + itemName
					},
					responseText: '<li id="item' + itemName +
							'">Item from Server</li>'
				};
			}
			return;
		});
	},

	teardown: function() {
		$("#qunit-fixture").html(this.fixturesHtml);
		this.ctx.remove();
		QUnit.reset();
	}

});

test("uses container for result of AJAX call", function() {
	this.ctx.html(this.fixturesHtml);
	var root = $("#basic", this.ctx),
		target = $("#my-container1");

	root.iqjax({ target: "#my-container1" }).bind({
		"iqjax:content": function() {
			QUnit.start();
			strictEqual($("form input[type=submit]", target).length, 1,
					"target container should contain a form on `iqjax:content`");
			$("form", target).submit();
			QUnit.stop();
		},
		"iqjax:update": function() {
			strictEqual(target.children().length, 0,
					"target container should be empty on `iqjax:update`");
			strictEqual($("#item1", root).text(), "Item from Server",
					"collection item should be replaced by the item from the server on `iqjax:update`");
			QUnit.start();
		}
	});

	root.find("#item1 a").click();
	QUnit.stop();
});

test("appends new items to the list", function() {
	this.ctx.html(this.fixturesHtml);
	var root = $("#basic", this.ctx),
		target = $("#my-container1");

	root.iqjax({ target: "#my-container1" }).bind({
		"iqjax:content": function() {
			QUnit.start();
			strictEqual($("form input[type=submit]", target).length, 1,
					"target container should contain the form");
			$("form", target).submit();
			QUnit.stop();
		},
		"iqjax:update": function() {
			strictEqual($("#itemnew", root).text(), "Item from Server");
			QUnit.start();
		}
	});

	root.find("#new").click();
	QUnit.stop();

});

test("replaces items outside the collection scope", function() {
	this.ctx.html(this.fixturesHtml);
	var root = $("#basic", this.ctx),
		target = $("#my-container1");

  var oldContent = $("#item-list", root).text();
	root.iqjax({ target: "#my-container1" }).bind({
		"iqjax:content": function() {
			QUnit.start();
			$("form", target).submit();
			QUnit.stop();
		},
		"iqjax:update": function() {
			strictEqual($("#other-item-list #item3", root).text(), "Item from Server");
			strictEqual($("#item-list", root).text(), oldContent);
			QUnit.start();
		}
	});

	root.find("#dummy-item-pointing-to-item3 a").click();
	QUnit.stop();

});

test("replaces element with result of iQjax call", function() {
	return; // FIXME: TEST DISABLED
	this.ctx.html(this.fixturesHtml);
	var root = $("#basic", this.ctx);

	root.iqjax({
		"iqjax:content": function() {
			QUnit.start();
			// #item1 should be replaced by the form
			strictEqual($("form input[type=submit]", root).length, 1);
			$("form", root).submit();
			QUnit.stop();
		},
		"iqjax:update": function() {
			QUnit.start();
			// form should be replaced by the "new" li element
			strictEqual($("#item1", root).text(), "Item from Server");
		}

	});

	root.find("#item1 a").click();
	QUnit.stop();
});

}(jQuery));
