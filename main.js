const app = {
		currentPage: "home",
		pageCache: {},
		links:[],
		init: function(){
				app.links=document.querySelectorAll('nav a').forEach((link) =>
				{
						link.addEventListener('click', function(e){
							e.preventDefault();
							app.currentPage= e.target.getAttribute('href').substr(1);
							app.getTemplate(app.currentPage)});
				})
				//set initial page
				app.getTemplate("home");	
				},
		getTemplate: function(page){
			app.myAsyncFunction(page)
			.then(function(response){
				app.injectTemplate(response);
			}).then(function(){
				app.applyDOMElements();
			})
			.catch((err) => {alert(err)});

		},
		myAsyncFunction: function(pageName) {
			const xhr = new XMLHttpRequest();
			return new Promise((resolve, reject) => {
			 		//if cached, load page from cache, if not, make new request
			 		if(app.pageCache[pageName]){
								resolve(app.pageCache[pageName]);
					}		
					else{
   				const xhr = new XMLHttpRequest();
    			xhr.open("GET", pageName  + '.html');
    			xhr.onload = () => resolve(xhr.response);
    			xhr.onerror = () => reject(xhr.statusText);
    			xhr.send();
    			}
    			});
			
		},
		injectTemplate: function(templateStr) {
			try{  
				document.getElementById('app').innerHTML=templateStr;
				console.log(app.currentPage);
				app.pageCache[app.currentPage]=templateStr;
			}  catch (err){
				alert(err)
			}
		},
		applyDOMElements: function(){
			try{ 
				let appDiv=document.getElementById('app')
				let htmlElements=appDiv.children[0].content;
				let clone= htmlElements.cloneNode(true);
					appDiv.appendChild(clone);
					//check for Javscript files and apply them
	  		let templateJS= document.querySelector('#app > script');
	  		if(templateJS){
	  				if(templateJS.src){
	  				document.getElementById('app_script').src = templateJS.getAttribute('src');
	  			  }
	  			  else{
						document.getElementById('app_script').innerHTML= templateJS.firstChild.data;
	  			  }
	  		}
	  		//check for CSS files or style links and apply them
	  		let templateExtCSS= document.querySelector('#app > link [type="text/css"]');
				if(templateExtCSS){
	  			document.getElementById('app_csslink').href = templateExtCSS.getAttribute('href');
	  		}
	  		
  		}catch (err){
				alert(err);
			}
		}
		



}

app.init();


