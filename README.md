iQjax
=====

This is an unobtrusive JavaScript component for doing Ajax in conformity 
with the [ROCA-Style](http://roca-style.org). It enables your web application 
to do Ajax without bigger impacts to your server side. 

An iQjax enabled DOM node loads the target of annotated links it contains into a 
specific container DOM node. This is done asynchronously via Ajax. If the 
content contains a form, the form handling (especially error handling) will be 
automatically done in the container too. After a form was successfully submitted, 
iQjax provides methods to update the iQjax container without reloading the whole 
page.

E.g. given a iQjax enabled list of person names with links pointing to a
form to edit the respective person name. Clicking on such a link will
load the form to a given container DOM node. After submitting the form 
with a changed name, the user would expect the list of names to be updated.
iQjax can do this by searching the new list entry in the response of
the form POST. Then it replaces the old node with the new one.

Documentation
-------------

We distinguish six API parts of ROCA-Style JavaScript components:

* The socket HTML markup the component initializes upon,
* the constructor method together with it's parameters,
* methods callable upon the component,
* events triggered by the component,
* HTML markup the component generates and
* Ajax-Requests the component fires.

### Socket markup

iQjax must be initialized on a DOM node with a `data-iqjax` attribute set. 
The attribute must contain a selector for the container the Ajax-response 
should be put in.


... TO BE DONE ...