//npm install --save async
//importo le librerie
var express = require('express');
var request = require('request');
var session = require('express-session');
var async = require('async');
//var mdb = require('moviedb')('4b10523401b47e7acc9a274b5534d26f');

var app = express();

var CLIENT_ID="475724565966039";
var APP_SECRET="9a3f73277eb1b42a4cea662adacaad7e";

var PATH="/home/biar/Desktop/ProgettoRetiNew"

//istanzio una sessione per mantere l' access_token
app.use(session( {
	name: 'Movies',
	secret: '123456qwerty'
} ));

app.use(express.static(PATH+'/public'));
app.use(express.static(PATH+'/public/stylesheets'));

//variabile globale per la sessione
var sessione;
var filmVisti;
/*
var url_base;//url base per le immagini
request.get("http://api.themoviedb.org/3/configuration?api_key=4b10523401b47e7acc9a274b5534d26f", function(error, status, data){
		url_base= JSON.parse(data).images.base_url;
		});*/

//get sulla root, rispondo con la pagina html che contiene il bottone di login
app.get('/', function (req, res) {
   res.sendFile(PATH+'/public/login.html');
});


//rindirizzo sulla pagina facebook, dove do i consensi
app.get('/login', function(req,res){
    //user_actions.videos
   res.redirect("https://www.facebook.com/dialog/oauth?client_id="+CLIENT_ID+"&scope=user_actions.video&redirect_uri=http://localhost:3000/login/confirm");
  });
  
  
//estraggo il code
app.get('/login/confirm',function(req,res){
    sessione=req.session;
    var code=req.query.code;
    console.log("questo è il code:\n");
   console.log(code+"\n\n\n");
   //faccio una get a facebook per ottenere l'access token
   var url="https://graph.facebook.com/v2.3/oauth/access_token?client_id="+CLIENT_ID+"&redirect_uri=http://localhost:3000/login/confirm&client_secret="+APP_SECRET+"&code="+code;
   request.get(url ,function(error,response,body){
                        if(!error && response.statusCode==200){
                        var access_token =JSON.parse(body).access_token;
                        sessione.access_token=access_token;
                        console.log("questo è l' access_token: \n");
                        console.log(sessione.access_token);
                        res.redirect('http://localhost:3000/welcomePage');
                        
                        request.get("https://graph.facebook.com/me?access_token="+sessione.access_token ,function(error,response,body){
                            if(!error && response.statusCode==200){
                                risp= JSON.parse(body);
                                console.log("questo è l' id: \n");
                                console.log(risp.id);
                                request.get("https://graph.facebook.com/me/video.watches?access_token="+sessione.access_token ,function(error,response,body){
                                        if(!error && response.statusCode==200){
										filmVisti=body;
                                        console.log(JSON.parse(filmVisti));
                            }
                            else{
                                console.log("errore :\n");
                                console.log(error);
                            }
                        });
                            }
                            else{
                                console.log("errore :\n");
                                console.log(error);
                            }
                        });
                        }
                        else{
                            console.log("errore :\n");
                            console.log(error);
                            }
                            
    });
    
});
   
app.get('/welcomePage', function (req, res) {
   res.sendFile(PATH+'/public/welcome2.html');
});


app.get('/watched', function(req,res){
    res.sendFile(PATH+'/public/watched.html');
  });
  
app.get('/wishlist', function(req,res){
    res.sendFile(PATH+'/public/wishlist.html');
  });

app.get('/recommended', function(req,res){
    res.sendFile(PATH+'/public/recommended.html');
  });
  
app.get('/visti', function(req,res){
	var url_base;//url base per le immagini
	request.get("http://api.themoviedb.org/3/configuration?api_key=4b10523401b47e7acc9a274b5534d26f", function(error,status,data){
		url_base= JSON.parse(data).images.base_url+"w92";
        console.log(url_base);
        var testo=JSON.parse(filmVisti);
        var i=0;
        var html="<table>";
        console.log("QUESTO"+testo.data.length);
        async.whilst(
            function(){return i<testo.data.length;},
            function(next){
                if(testo.data[i].data!=null){
                    var titolo=testo.data[i].data.movie.title;
                    //console.log("TIOTLI DA FB:"+titolo);
                    var url="http://api.themoviedb.org/3/search/movie?api_key=4b10523401b47e7acc9a274b5534d26f&query="+titolo;
                    request.get(url,function(err,stat,body){
                        if(JSON.parse(body).results.length!=0){			
                            var risp=JSON.parse(body).results[0].poster_path;
                            //var rispStringa=JSON.stringify(risp);
                            //console.log(rispStringa+"RISPSTRING");
                            //var titolo=testo.data[i].data.movie.title;
                            console.log("TIOTLI DA MDB:"+titolo);
                            //jsona+="{\"titolo\":"+"\""+titolo+"\""+", \"path\": "+"\""+url_base+rispStringa+"\""+"}";
                            console.log(url_base+risp);
                            html+="<tr><td>"+titolo+"</td>"+"<td><img src="+url_base+risp+"></img></td>";
                            
                            }
                        i++;
                        next(null,i);
                    });
                }
            },
            function(err,n){		
                html+="</table>";
                console.log("NOSTRO HTML:"+html);
                res.send(html);
                }
        );
        });			
        console.log("dati inviati\n");
        });
 


app.get('/logout', function(req, res){      
     request.del("https://graph.facebook.com/me/permissions?access_token="+sessione.access_token ,function(error,response,body){
                        if(!error && response.statusCode==200){
                            res.redirect('http://localhost:3000/');  
                        }
                        else{
                            console.log("errore :\n");
                            console.log(error);
                            }
    });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
  });     

app.post('/static', function (req, res) {
  res.sendFile(PATH+'/public/images/fiore.jpg');
});



app.listen(3000, function () {
  console.log('In ascolto sulla porta 3000!');
});
