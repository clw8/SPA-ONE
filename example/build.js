console.log("build.js running");
//run this file to replace files in view folder...be careful that this takes the views html as inputs and overwrites those very files
const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const glob = require('glob');


f = glob('*.html', function(err, files){
  baseIndex = files.indexOf('base.html');
  files.splice(baseIndex, 1);
  writeFiles(files);
});

// var views = fs.readdirSync('views')
function writeFiles(views){
  var baseFile = fs.readFileSync('base.html','utf8');

  var views_paths = views.map(function(elem){
    // return (__dirname + "/views/" + elem);
    return (__dirname + "/" + elem);
  })

  const baseDOM = new JSDOM(baseFile)


  views_paths.forEach(function(doc_path, index){
    //dom for view file..
    let html_string = fs.readFileSync(doc_path, 'utf8')
    let view_DOM = new JSDOM(html_string)
    let view_app_el = view_DOM.window.document.body.querySelector("#app");
    let scripts = Array.from(view_app_el.querySelectorAll("script"));
    //dom for base file
    let new_html_DOM = baseDOM
    let navLinks = Array.from(new_html_DOM.window.document.querySelectorAll(".nav-link"));
    //backup
    // backup_file_path = __dirname + "/backups/" + views[index];
    // fs.writeFileSync(backup_file_path, html_string, 'utf8');
    //navlinks
    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") == views[index]){
        link.classList.add("active");
      }
    });
    //for production
    // scripts.forEach(script => {
    //   script.src = `dist${script.src.replace('js', '')}`;
    // })

    //replace app div contents
    new_html_DOM.window.document.body.querySelector("#app").innerHTML = view_app_el.innerHTML
    //write to views
    write_file_path = views[index]
    write_contents = new_html_DOM.serialize()
    fs.writeFileSync(write_file_path, write_contents, 'utf8')
  })

}
