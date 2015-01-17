var express = require('express');
//var bodyParser  = require('body-parser');
var app = express();

var handlebars = require('express3-handlebars'); 
handlebars.create();
app.engine('.hbs', handlebars({defaultLayout:'main', 
                    extname: '.hbs',
					 helpers: { 
					 section: function(name, options){   
						 if(!this._sections) this._sections = {}; 
							 this._sections[name] = options.fn(this); 
							 return null; 
						 } 
					 } 
					
					}));
app.set('view engine', '.hbs');
app.set('view cache', true);

app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded());
app.use(require('body-parser')());

app.use(function(req, res, next){   
     res.locals.showTests = app.get('env') !== 'production' && 
	            req.query.test === '1';       
	 next(); 
});
 
function getData() {
	return {
		locations: [
		{name:"Warrington",
		tel:"0121 78789"},
		{name:"Leeds",
		tel:"0787 7878"}
		]
	}
	
}

app.get('/form', function(req, res){  
 res.render('form1', { csrf: 'CSRF token goes here' });
});

app.post('/process', function(req, res){  
  console.log('Form (from querystring): ' + req.query.form);  
  console.log('CSRF token (from hidden form field): ' + req.body._csrf); 
  console.log('Name (from visible form field): ' + req.body.name);  
  console.log('Email (from visible form field): ' + req.body.email); 
  res.redirect(303, '/thank-you'); }); 

app.use(function(req, res, next){  
      if(!res.locals.partials) res.locals.partials = {};
	  res.locals.partials.aPartialTest = getData(); 
	  next();
	  }); 
 
app.get('/', function(req, res){ 
	   res.render('home'); }); 

app.disable('x-powered-by'); 
	   
var fortune = require('./lib/fortune.js');   

app.get('/about', function(req, res){  
    res.render('about', { fortune: fortune.getFortune(),
                          pageTestScript: '/qa/tests-about.js'
	} ); 
});

app.get('/customer', function(req, res){ 
       res.render('customer'); 
	   }); 
app.get('/data/customer', function(req, res){  
      res.json({
		  fn: 'joe',
		  sn: 'bloggs',  
		  nino: 'ac121212d', 
		  age: 18,  
		  });
		  }); 

app.get('/t/:one/:two', function(req, res){   
    res.render('test/this', { 'fn':'Tim', 'sn':'Jones','route':req.route,  'o':req.params.one,'t':req.params.two}); 
});

app.get('/e',function(req, res) {
	res.render('no-layout',{layout:null});
	
});

var tours = [   
     { id: 0, name: 'Hood River', price: 99.99 }, 
	 { id: 1, name: 'Oregon Coast', price: 149.95 }
 ];

app.get('/api', function(req, res){
	   res.json(tours);
	}
	); 

app.post('/process-contact', function(req, res){ 
       console.log('Received contact from ' + req.body.name +  
	   ' <' + req.body.email + '>');   
	   try {          
			// save to database....
           return res.xhr ?
			   res.render({ success: true }) :   
			   res.redirect(303, '/thank-you');  
		} catch(ex) {    
		   return res.xhr ?   
			   res.json({ error: 'Database error.' }) :   
			   res.redirect(303, '/database-error');   
		} 
 });		

				
app.get('/tours/hood-river', function(req, res){  
      res.render('tours/hood-river'); 
	  }); 
	  
app.get('/tours/request-group-rate',
	  function(req, res){  
      res.render('tours/request-group-rate');
	  }); 	  
// custom 404 page 
app.use(function(req, res){  
   
	  res.status(404);       
	  res.render('404');
	  });
// custom 500 page
 app.use(function(err, req, res, next){
	 console.error(err.stack);      
 
	 res.status(500);    
	 res.render('500');
	 });
	 
app.listen(app.get('port'),
    function(){ 
		 console.log( 'Express started on http://localhost:' + 
			  app.get('port') + '; press Ctrl-C to terminate.' ); 
		 }
);
