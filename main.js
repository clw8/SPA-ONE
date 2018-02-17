const app = {
		currentPage: "home",
		pageCache: {},
		links:[],
		pageHistory: [],
		init: function(){
				app.links=document.querySelectorAll('nav a').forEach((link) =>
				{
						link.addEventListener('click', function(e){
							e.preventDefault();
							app.currentPage= e.target.getAttribute('href').substr(1);
							app.getTemplate(app.currentPage)});
				})
				//set initial page
				app.getTemplate(app.currentPage);	
				//browser back button functionality
				window.addEventListener('popstate', app.goToPreviousPage)
				},
		getTemplate: function(page){
			//if cached, load page from cache, if not, make new request
			if(app.pageCache[page]){
				let template= app.pageCache[page];
				try{
				app.injectTemplate(template);
			 	app.applyDOMElements();
			 	}catch (err){
				alert(err)
				}		
			}
			else{
				let pageURL = 'templates/' + page  + '.html'
				app.myAsyncFunction(pageURL)
				.then(function(response){
					app.injectTemplate(response);
				}).then(function(){
					app.applyDOMElements();
				})
				.catch((err) => {alert(err)});
				}

			},
		myAsyncFunction: function(pageURL) {
			const xhr = new XMLHttpRequest();
			return new Promise((resolve, reject) => {
   				const xhr = new XMLHttpRequest();
    			xhr.open("GET", pageURL);
    			xhr.onload = () => resolve(xhr.response);
    			xhr.onerror = () => reject(xhr.statusText);
    			xhr.send();
    			
    			});
			
		},
		injectTemplate: function(templateStr) {
			try{  
				document.getElementById('app').innerHTML=templateStr;
				app.pageCache[app.currentPage]=templateStr;
				app.pageHistory.push(app.currentPage);
				history.pushState({}, app.currentPage);
					//reset script, style and link tags
				document.getElementById('app_script').src="";
				document.getElementById('app_script').innerHTML="";
				document.getElementById('app_csslink').href="";
				document.getElementById('app_style').innerHTML="";
			}  catch (err){
				alert(err)
			}
		},
		applyDOMElements: function(){
			try{ 
				let appDiv=document.getElementById('app')
				let htmlElements=appDiv.children[0].content;
				let CSSString;
					for(i=0; i<htmlElements.children.length; i++){
						if(htmlElements.children[i].tagName=='STYLE')
						{
							CSSString=htmlElements.children[i].innerHTML;

						}
						else{
							let clone= htmlElements.children[i].cloneNode(true);
					appDiv.appendChild(clone);
						}
					}
							//set template's Javascript and CSS
	  		let templateJS= document.querySelector('#app > script');
	  		if(templateJS){
	  				if(templateJS.src){
	  				let JSsource=	templateJS.getAttribute('src');
	  				document.getElementById('app_script').src = 'templates/js/' + JSsource;
	  			  }
	  			  else{
						document.getElementById('app_script').innerHTML= templateJS.firstChild.data;
	  			  }
	  		}
	  		//check for CSS files or style links and apply them
	  		let templateExtCSS= document.querySelector('#app > link[type="text/css"]');

				if(templateExtCSS){
					let CSSsource= templateExtCSS.getAttribute('href');
	  			document.getElementById('app_csslink').href = 'templates/css/' + CSSsource;
	  		}
	  		else if (CSSString){
	  			//scope the CSS to the "app" div only, using browser-compatible JS
	  			let newCSSString = CSSString.replace(/\}/g, "\}\£");
	  			let CSSarray= newCSSString.split('\£');
	  			CSSarray.forEach(function(line, index){
	  				CSSarray[index]='#app' + line;
	  			});
	  		document.getElementById('app_style').innerHTML = CSSarray.join();
	  		}
	  		
  		}catch (err){
				alert(err);
			}
		},
		goToPreviousPage: function(){
			app.pageHistory.pop();
			let previousPage=app.pageHistory[app.pageHistory.length-1];
			app.currentPage=previousPage;
			if (app.pageHistory.length== 0 || app.pageHistory.length==undefined){
				history.go(-1);
				}
			else{
				let template= app.pageCache[app.currentPage];
				try{
				app.injectTemplate(template);
			 	app.applyDOMElements();
			 	app.pageHistory.pop();
			 	}catch (err){
				alert(err)
				}
			}		

		}
		



}

app.init();


