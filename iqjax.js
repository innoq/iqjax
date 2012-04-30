/*jslint vars: true, unparam: true, browser: true, white: true */
/*global jQuery */

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

// dynamic loading of content
// inspired by https://github.com/defunkt/jquery-iqjax - though minus the
// History API and based on Rails's data-remote functionality and error handling
(function($) {

"use strict";

var iqjax_uri, requestMethod;

var IQjax = function(context, target) {
	// NB: context and target must not be descendants of each other
	this.context = context;
	this.target = target;
	this.indicator = $(".indicator", target);
	if(!this.indicator.length) {
		this.indicator = $('<div class="indicator hidden"></div>');
	}

	// NB: redefining `this` in event handlers (via `proxy`) is dangerously
	// misleading, but avoids non-standard function signatures for event
	// handlers - plus for instance methods, it's actually more intuitive

	// cancel buttons
	var uri = document.location.toString().split("#")[0]; // XXX: use as selector makes for brittle heuristic?
	this.target.on("click", 'a[href="' + uri + '"]', $.proxy(this.onCancel, this));

	var selector = "a[data-remote], form[data-remote]";
	var handlers = {
		"ajax:beforeSend": $.proxy(this.beforeSend, this),
		"ajax:success": $.proxy(this.onSuccess, this),
		"ajax:error": $.proxy(this.onError, this)
	};
	this.context.add(this.target).on(handlers, selector);

	// dirty state: protect against accidental dismissal
	var self = this;
	this.target.on("change", "input, textarea, select", function(ev) {
		self.dirty = true;
	});
};
$.extend(IQjax.prototype, {
	onCancel: function(ev) {
		if(!this.checkDirty(ev)) {
			this.reset();
		}
		ev.preventDefault();
	},
	beforeSend: function(ev, xhr, settings) {
		if(this.checkDirty(ev)) {
			return false;
		}

		var contextAction = $.contains(this.context[0], ev.currentTarget); // TODO: rename -- XXX: hacky?
		if(contextAction) {
			this.reset();
		}
		$(ev.currentTarget).addClass("active");
		this.target.prepend(this.indicator);
		this.indicator.show();
		settings.url = iqjax_uri(settings.url);
		this.target.children().not(this.indicator).css("opacity", 0.5);
	},
	onSuccess: function(ev, data, status, xhr) {
		if(!ev.currentTarget.parentNode) {
			// FIXME: it's not clear under what circumstances this occurs;
			// apparently, for reasons yet unknown, this event is erroneously
			// triggered twice (and not all such duplicate events are
			// intercepted by this hack, e.g. DELETE operations)
			return;
		}

		var targetAction = $.contains(this.target[0], ev.currentTarget), // TODO: rename -- XXX: hacky?
			el = $(ev.currentTarget),
			reqMethod = "GET",
			origin;

		if(el.is("form")) {
			if(targetAction) {
				this.onUpdate.call(this, data, status, xhr); // TODO: should trigger event
				return;
			} else {
				reqMethod = requestMethod(el);
				origin = el.closest(".iqjax-entity"); // TODO: document
			}
		}

		if(origin && reqMethod === "DELETE") {
			this.indicator.hide();
			origin.slideUp($.proxy(origin.remove, origin));
		} else {
			this.display(data);
		}
	},
	onError: function(ev, xhr, error, exc) {
		var cType = xhr.getResponseHeader("Content-Type"),
			isHTML = cType ? cType.match(/\btext\/html\b/) : false;
		this.display(xhr.responseText || error, !isHTML);
	},
	onUpdate: function(data, status, xhr) {
		var src = xhr.getResponseHeader("X-IQJAX"), // TODO: document
			item = $("<div />").html(data).find("#" + src),
			origin = $(".active", this.context),
			container = origin.closest("[data-iqjax-collection]"), // TODO: document
			form = $("form.active", this.target),
			reqMethod = requestMethod(form);

		this.target.empty();

		container = container.jquery ? container : $(container);
		// account for nested update targets -- XXX: hacky!?
		if(reqMethod === "PUT" && origin.closest(".iqjax-entity")[0] === container[0]) {
			container = container.parent().closest("[data-iqjax-collection]");
		}
		container = $(container.data("iqjax-collection"));

		if(reqMethod === "GET") { // multi-step forms
			this.display(data);
		} else {
			this.reset();
		}

		var el = $("#" + src, self.context);
		if(el.length) {
			el.replaceWith(item);
		} else { // new
			container.append(item);
		}

		item.addClass("success").removeClass("success", "glacial");
		this.context.trigger("iqjax:update", { item: item, doc: data });
	},
	reset: function() {
		this.target.empty();
		this.dirty = false;
		$(".active", this.context).removeClass("active");
	},
	display: function(txt, plain) {
		this.indicator.hide();
		this.target[plain ? "text" : "html"](txt).prepend(this.indicator);
		// intercept interactions to prevent full page reload
		$("form", this.target).attr("data-remote", true);
		this.context.trigger("iqjax:content", { iqjax: this });
	},
	// dirty state: protect against accidental dismissal
	dirtyMsg: "Es gibt ungespeicherte Änderungen - fortfahren (Änderungen werden verworfen)?", // TODO: rephrase
	checkDirty: function(ev) {
		var isSubmit = $(ev.currentTarget).is("form");
		if(this.dirty && !isSubmit) {
			if(confirm(this.dirtyMsg)) {
				this.dirty = false;
			} else {
				return true;
			}
		}
	}
});

// hack to prevent cache confusion (browser caches should distinguish between
// iQjax and non-iQjax requests) - it'd be more elegant to modify the jqXHR's
// `data` property here, but it appears that's being overridden by jQuery later
iqjax_uri = function(uri) {
	return uri + (uri.indexOf("?") === -1 ? "?" : "&") + "_iqjax=1";
};

requestMethod = function(form) {
	var m = $("input[name=_method]", form).val() || form.attr("method") || "GET";
	return m.toUpperCase();
};

// uses dynamic in-page loading for child elements matching `a[data-remote]`
// options.target is the DOM element within which contents are to be displayed
// (defaults to selector contained in context element's `data-iqjax` attribute)
$.fn.iqjax = function(options) {
	options = options || {};
	return this.each(function(i, node) {
		var context = $(this),
			target = $(options.target || context.data("iqjax")); // TODO: document
		new IQjax(context, target);
	});
};

}(jQuery));
