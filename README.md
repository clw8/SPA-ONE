# SPA-ONE
The spa-one.js script is a vanilla JS script that allows for injecting partials into your html pages, while also supporting loading of individual pages by direct URLS. Great for SEO purposes.

Rules for usage are as follows:
* Your nav links need the class 'nav-link'
* All your dynamically loaded content must be in a div with the id "app"
* The current loaded page must have the class "active" in it's nav link
* Pages may be preloaded by appended 'preload' to the class of the nav link
 
For all the above, see the example folder for usage
See also the tool in the example folder called build.js, which uses the base.html to make everything outside of the app div agree.
Build.js takes the contents of the app div(in this case) index.html, about.html and contact.html files, and dynamically inserts them into the frame provided for by the base.html file, overwriting the original files. (a backup folder is created in case anything goes wrong)

Pros of this script:
* No dependencies
* Super lightweight
* Very SEO friendly
* Supports IE 9+

Cons of this script:
* Needs a flat file architecture for html files (if using build.js)
* Non-data-driven (unlike ReactJS or VueJS, there is no state)
