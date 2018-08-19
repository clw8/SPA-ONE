function ready(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(fn);

function fn(){

	let appDiv = document.getElementById('app');
	let head = document.getElementsByTagName('head')[0];
	var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
	var htmlRegex = /^(.+)\.html$/;

	const app = {
			currentPage: "",
			pageCache: {},
			links:{},
			pageHistory: [],
			preloadViews: true,
			init: function(){
					//map the nav-links to an object which pairs the link itself with its href value. this will be useful for the popstate event
				for (i = 0; i < navLinks.length ; i++){
					var linkHref = htmlRegex.exec(navLinks[i].getAttribute('href'))[1];
					app.links[linkHref] = navLinks[i];
				}
				//event listeners for each nav click, which fetches the html file and injects the corresponding app div into the current page
				for (var key in app.links){
					if(!app.links.hasOwnProperty(key)) continue;
					app.links[key].addEventListener('click', function(e){
						e.preventDefault();
            console.log(e.target)
						app.currentPage = htmlRegex.exec(e.target.getAttribute('href'))[1];
						app.getTemplate(app.currentPage);
						//using the pusState API to manage browser interactions
						window.history.pushState({'page': app.currentPage + '.html'}, null, app.currentPage + '.html');
					})
				}

				//get initial page's href value and current html document for caching
				var initActiveNavLink = document.querySelector('.active');
				app.currentPage = htmlRegex.exec(initActiveNavLink.getAttribute('href'))[1];
				app.pageCache[app.currentPage] = document;

				//browser back button functionality
				window.addEventListener('popstate', function(e){
						app.getTemplate(e.state.page);})
				window.history.pushState({'page': app.currentPage + '.html'}, null, app.currentPage + '.html');
			},
			getTemplate: function(page){
				//if loaded, show page,
        console.log(page)
				if(app.pageCache.page){
					app.applyDOMElements(page, app.pageCache.page, appDiv);
				}
				//if not cached, if not, make new request
				else{
          //if there is an add-on domain, any http requests go to the root,
          //..not the add-on domain, so path issues need to be resolved with the pageURL variable
					let pageURL = page  + '.html'
					app.myAsyncFunction(page, pageURL, appDiv, app.applyDOMElements)
					}
			},
			myAsyncFunction: function(page, pageURL, loadlocation, callback) {
					const xhr = new XMLHttpRequest();
					xhr.onload = () => callback(page, xhr.response, loadlocation);
					xhr.onerror = () => callback(page, 'There was an error retrieving the document. Please try again', loadlocation);
					xhr.open("GET", pageURL, true);
					xhr.responseType = "document";
					xhr.setRequestHeader('Content-type', 'text/html');
					xhr.overrideMimeType("text/html");
					xhr.send();
				},
			applyDOMElements: function(page, response, loadlocation){
				console.log('loading' + page);
				//error handling
				if(typeof response == 'string'){
					loadlocation.innerHTML = response;
				}
				else{
					//if not already cached, cache the response
					if(!app.pageCache[page]){
					app.pageCache[page] = response;
					}

					var	appDivResponse = response.getElementById('app');
					var images = Array.prototype.slice.call(appDivResponse.querySelectorAll('img'));
					var bgimages = Array.prototype.slice.call(appDivResponse.querySelectorAll('*[background-image-src]'));
					var scripts = Array.prototype.slice.call(response.querySelectorAll('.app-script'));

					//css animation for new view
					loadlocation.classList.add('view-enter');
					loadlocation.addEventListener('animationend', function(){
						loadlocation.classList.remove('view-enter');
						app.viewTransitionEnd = true;
					}, true);

				//reset current app view in preparation for new view: innerHTML, and scripts are reset
					loadlocation.innerHTML = "";

					var appendedScript = Array.prototype.slice.call(head.querySelectorAll('appendedScript'));
					appendedScript.forEach(function (script){
							head.removeChild(script);
					})

					//load the new view's app div into the current html page
					loadlocation.innerHTML = appDivResponse.innerHTML;

					//for smoother transitions and image loading, images and backgroundimages (with "background-image-src" attribute) are given the class imgloaded
					images.forEach(function (img){
							img.onload = function(){
								img.classList.remove('hidden');
								img.classList.add('imgloaded');
							}
					})
					bgimages.forEach(function (bgimg){
						var bgimgsrc = bgimg.getAttribute('background-image-src');
						var img = new Image();
							img.onload = function(){
								bgimg.style.backgroundImage = 'url(' + bgimgsrc + ')';
								bgimg.classList.remove('hidden');
								bgimg.classList.add('imgloaded');
							}
							img.src = bgimgsrc;
					})

					//scripts must be loaded manually or they won't work; setTimeout is used to add the scripts *in order* to the rendering queue
					var scriptcount = 0;
					(function loadScript(){
					if (scripts[scriptcount]){
							setTimeout(function(){
								var newScript = document.createElement('script');
								newScript.onload = function(){
									scripts[scriptcount].parentNode.removeChild(scripts[scriptcount]);
									scriptcount++;
									loadScript(scriptcount);
								}
								 newScript.src = scripts[scriptcount].getAttribute('src');
								 newScript.classList.add('appendedScript');
								 head.appendChild(newScript);
							}, 0)
						}
					})(scriptcount);
					//preload other views if turned on
					if(app.preloadViews == true){
						app.preloadOtherViews();
					}

					app.changeNavLinkAppearance(app.links[page], navLinks);
				}
			},
			preloadOtherViews: function(){
				var viewsToPreload = Array.prototype.slice.call(document.querySelectorAll('.preload'));

				viewsToPreload.forEach(function(link){
					let preloadPageName = htmlRegex.exec(link.getAttribute('href'))[1];
					let preloadPageURL = preloadPageName  + '.html';
					let cachedDiv = document.createElement('div');

					app.myAsyncFunction(preloadPageName, preloadPageURL, cachedDiv, preloadElements);
					app.preloadViews = false;
				})

					function preloadElements(page, response, loadlocation){
						//cache app view
						var appDivResponse = response.getElementById('app');
						appDivResponse.removeAttribute('id');
						app.pageCache[page] = response;

						//preloading of images without appending them to the DOM
						var preloadImages = Array.prototype.slice.call(appDivResponse.querySelectorAll('.preload-img'));
						for (i=0 ; i < preloadImages.length; i++){
							if(preloadImages[i].attributes.src){
								var image = new Image();
								image.src = preloadImages[i].getAttribute('src');
							}
							else if(preloadImages[i].getAttribute("background-image-src")){
								var image = new Image();
								image.src = preloadImages[i].getAttribute("background-image-src");
							}
						}
					}
			},
			changeNavLinkAppearance: function(link, navlinks){
				for (i=0; i<navlinks.length; i++){
					if(navlinks[i].classList.contains('active')){
						navlinks[i].classList.remove('active');
					}
				}
				link.classList.add('active');
			}
	}

	app.init();
}
