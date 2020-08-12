"use strict"
var User=require("../models/user");
var Admin=require("../models/adm");
var Queue=require("../models/queue");

var dayInWeek=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
var monthInYear=["janvier","fevrier","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","decembre"];

function dateGeneration(){
	var DateObject=new Date();
	
	let day=DateObject.getUTCDay();
	let dayFormat=nameUpper(dayInWeek[day]);
	
	let date=(DateObject.getUTCDate());
	let month=DateObject.getUTCMonth();
	let year=DateObject.getFullYear();
		
	let monthFormat=nameUpper(monthInYear[month]);
	
	return dayFormat+" "+date+" "+monthFormat+" "+year;
}



function deleteSpace(string=""){
	var regex=/\s+/g;
	var newString=string.replace(regex,"");
	return newString;
}

function toLower(string){
	return string.toLowerCase();
}

function nameUpper(name=""){
	let initialLetter=name.substring(0,1);
	let lastName=name.substring(1);
	initialLetter=initialLetter.toUpperCase();
	return initialLetter+lastName;
}

var phoneNumberRegex=/^\+?[0-9]{12}$|^[0-9]{10}$/;
var passewordRegex=/[<>"'&\/]/;
var message={};
module.exports={
	signup:function(req,res){
		let viewModel={};
		viewModel.title="Inscription";
		if(req.session.sub_body){
			viewModel.body=req.session.sub_body;
			delete req.session.sub_body;
		}
		if(req.session.no_firstname){
			viewModel.no_firstname=true;
			delete req.session.no_firstname;
		}
		if(req.session.no_name){
			viewModel.no_name=true;
			delete req.session.no_name;
		}
		if(req.session.no_username){
			viewModel.no_username=true;
			delete req.session.no_username;
		}
		
		if(req.session.no_password){
			viewModel.no_password=true;
			delete req.session.no_password;
		}
		
		if(req.session.no_password_confirmation){
			viewModel.no_password_confirmation=true;
			delete req.session.no_password_confirmation;
		}
		
		if(req.session.check_password){
			viewModel.check_password=req.session.check_password;
			delete req.session.check_password;
		}
		if(req.session.check_password_length){
			viewModel.check_password_length=req.session.check_password_length
			delete req.session.check_password_length;
		}
		
		if(req.session.no_valid_number){
			viewModel.no_valid_number=req.session.no_valid_number;
			delete req.session.no_valid_number;
		}
		if(req.session.no_valid_operator){
			viewModel.no_valid_operator=req.session.no_valid_operator;
			delete req.session.no_valid_operator;
		}
		if(req.session.check_number){
			viewModel.check_number=req.session.check_number;
			delete req.session.check_number;
		}
		if(req.session.user_exist){
			viewModel.user_exist=req.session.user_exist;
			delete req.session.user_exist;
		}
		if(req.session.no_telephone){
			viewModel.no_telephone=req.session.no_telephone;
			delete req.session.no_telephone;
		}
		if(req.session.badname){
			viewModel.badname=req.session.badname;
			delete req.session.badname
		}
		if(req.session.badusername){
			viewModel.badusername=req.session.badusername;
			delete req.session.badusername;
		}
		if(req.session.badpassword){
			viewModel.badpassword=req.session.badusername;
			delete req.session.badusername;
		}
		if(req.session.badconfirmation){
			viewModel.badconfirmation=req.session.badconfirmation;
			delete req.session.badconfirmation;
		}
		if(req.session.logIn){
			let name="";
			if(req.session.username){
				name=req.session.username
				name=name.substr(0,1);
				name=name.toUpperCase();
			}		
			viewModel.firstLetter=name;			
			viewModel.logIn=req.session.logIn;
			viewModel.firstUse=req.session.firstUse;
			viewModel.username=req.session.username;			
			
			viewModel.telephone=req.session.telephone;
			viewModel.password=req.session.password;
			
			delete req.session.firstUse;
		}		
		res.render("signUp",viewModel);
	},
	doSignup:function(req,res){
		var name=toLower(deleteSpace(req.body.name)),
		firstname=toLower(deleteSpace(req.body.firstname)),
		username=toLower(deleteSpace(req.body.username)),
		password=deleteSpace(req.body.password),
		password_confirmation=deleteSpace(req.body.password_confirmation);
		
		function saveUser(validePhone){
			Admin.findOne({telephone:validePhone},function(err,admin){
				if(admin!==null){
					req.session.user_exist="Vous ne pouvez pas vous inscrire avec ce numero";
							req.session.sub_body=req.body;
							res.redirect("/signup");
				}else{
					User.findOne({telephone:validePhone},function(err,user){
						if(user!==null){
							req.session.user_exist="Vous ne pouvez pas vous inscrire avec ce numero";
							req.session.sub_body=req.body;
							res.redirect("/signup");								
						}
						else{
							var userPhone="";								
							let phoneFlag=validePhone.substr(1,2);
							console.log("phoneFlag");
							console.log(phoneFlag);
							if(phoneFlag==="81"||phoneFlag==="82"||phoneFlag==="99"||phoneFlag==="97"||phoneFlag==="84"||phoneFlag==="85"||phoneFlag==="89"){
								userPhone=validePhone;
								var newUser=new User({
									username:username,
									name:name,
									firstname:firstname,
									telephone:userPhone,
									password:password,
									password_confirmation:password_confirmation,							
									solde:0,
									role:"member",
									join:dateGeneration()
								});						
								newUser.save(function(err,data){
									if(data){
										req.session.logIn=true;
										req.session.firstUse=true;
										req.session.username=data.username;								
										req.session.telephone=data.telephone;
										req.session.password=data.password;
										res.redirect("/signup");
									}
								});
							}
							else{
								req.session.sub_body=req.body;
								req.session.no_valid_operator="Operateur non valide";
								res.redirect("/signup");
							}
																			
					}
				});
				}
			});
			
	}
	if(name&&firstname&&username&&password&&password_confirmation&&deleteSpace(req.body.telephone)){			
		if(password.length>=8){
		if(password===password_confirmation){
			var phone=deleteSpace(req.body.telephone);		
			var phonePattern=/^\d{9}$/;
			var phonePatter2=/^\d{10}$/;
			var phonePatter3=/^\+?\d{12}$/;
			var regex=/[<>"'&\/+]/;
			if(!regex.test(name)&&!regex.test(firstname)&&!regex.test(username)&&!regex.test(password)&&!regex.test(password_confirmation)){
				if(phone.match(phonePattern)){
					phone=0+phone;
					saveUser(phone);																		
				}
				else if(phone.match(phonePatter2)){
					if(phone.indexOf("0")===0){
						saveUser(phone);
					}
					else{
						req.session.sub_body=req.body;
						req.session.check_number="Ce numero n'est pas valide";
						res.redirect("/signup");
					}
				}
				else if(phone.match(phonePatter3)&&phone.indexOf("+")===0){
					var prefix=phone.substring(1,4);
					if(prefix==="243"){
						phone=phone.substring(4);
						phone=0+phone;
						saveUser(phone);
					}else{
						req.session.sub_body=req.body;
						req.session.check_number="Ce numero n'est pas valide";
						res.redirect("/signup");
					}					
				}
				else if(phone.match(phonePatter3)&&phone.length===12){
					var prefix=phone.substring(0,3);
					if(prefix==="243"){
						phone=phone.substring(3);
						phone=0+phone;
						saveUser(phone);
					}else{
						req.session.sub_body=req.body;
						req.session.check_number="Ce numero n'est pas valide";
						res.redirect("/signup");
					}
				}
				else{
					req.session.sub_body=req.body;
					req.session.no_valid_number="Numero de telephone non valide"
					res.redirect("/signup");
				}
			}else{
				if(regex.test(name)){
					req.session.sub_body=req.body;
					req.session.badname="Le nom contient de caractère non admissible";
					res.redirect("/signup");
				}
				if(regex.test(firstname)){
					req.session.sub_body=req.body;
					req.session.badfirstname="Ce prenom contient de caractère non admissible";
					res.redirect("/signup");
				}
				if(regex.test(username)){
					req.session.sub_body=req.body;
					req.session.badusername="Le nom d'utilisateur contient de caractère non admissible";
					res.redirect("/signup");
				}
				if(regex.test(password)){
					req.session.sub_body=req.body;
					req.session.badpassword="Le mot de passe contient de caractère non admissible";
					res.redirect("/signup");
				}
				if(regex.test(password_confirmation)){
					req.session.sub_body=req.body;
					req.session.badconfirmation="Le mot de passe contient de caractère non admissible";
					res.redirect("/signup");
				}
			}		
					
			}else{
				req.session.sub_body=req.body;
				req.session.check_password="Le deux mots de passe doivent être conforme";
				res.redirect("/signup");
			}
		}else{
			req.session.sub_body=req.body;
			req.session.check_password_length="Le mot de passe doit contenir au moins 8 caractères";
			res.redirect("/signup");
		}
		}
		else{
			if(!req.body.firstname){
				req.session.sub_body=req.body;
				req.session.no_firstname=true;				
			}
			if(!req.body.name){
				req.session.sub_body=req.body;
				req.session.no_name=true;				
			}
			if(!req.body.username){
				req.session.sub_body=req.body;
				req.session.no_username=true;				
			}
			if(!req.body.email){
				req.session.sub_body=req.body;
				req.session.no_email=true;				
			}
			if(!req.body.password){
				req.session.sub_body=req.body;
				req.session.no_password=true;				
			}
			if(!req.body.password_confirmation){
				req.session.sub_body=req.body;
				req.session.no_password_confirmation=true;				
			}
			if(!req.body.telephone){
				req.session.sub_body=req.body;
				req.session.no_telephone=true;				
			}			
			res.redirect("/signup");
		}		
	},
	login:function(req,res){
		let viewModel={};
		viewModel.title="Se connecter";
		if(req.session.user_body){
			viewModel.body=req.session.user_body;
			delete req.session.user_body
		}
		if(req.session.no_phone_number){
			viewModel.no_phone_number=req.session.no_phone_number;
			delete req.session.no_phone_number;
		}
		if(req.session.no_password){
			viewModel.no_password=req.session.no_password;
			delete req.session.no_password;
		}
		if(req.session.no_user){
			viewModel.no_user="Ce numero n'est pas correct";
			delete req.session.no_user;
		}
		if(req.session.false_password){
			viewModel.false_password=req.session.false_password;
			delete req.session.false_password;
		}
		res.render("login",viewModel);
	},
	doLogin:function(req,res){
		var phoneNumber=deleteSpace(req.body.phone_number),
		
		password=deleteSpace(req.body.password),
		phoneNumberRegex=/^\+?[0-9]{12}$|^[0-9]{10}$/,
		passewordRegex=/[<>"'&\/+]/;
		
		if(phoneNumberRegex.test(phoneNumber)){
			if(phoneNumber.length===12){phoneNumber=0+(phoneNumber.substring(3))}
			if(phoneNumber.length===13){phoneNumber=0+(phoneNumber.substring(4))}	
			
			if(passewordRegex.test(password)){			
				req.session.user_body=req.body;
				req.session.false_password="Caractere inadmissible dans le mot de passe";						
				res.redirect("/login");
			}else{
				if(phoneNumber && password){					
					Admin.findOne({telephone:phoneNumber},function(err,administrator){
						
						if(err){
								
						}
						if(administrator!==null){
							if(administrator.password===password){	
								var admin={};
								admin.telephone=administrator.telephone;
								admin.password=administrator.password;
								req.session.admin=admin;								
								req.session.logIn=true;
								res.redirect("/admin");
							}else{
								req.session.user_body=req.body;
								req.session.false_password="Mot de passe incorrect";
								res.redirect("/login");
							}				
						}else{
							User.findOne({telephone:phoneNumber},function(err,user){
								
								if(err){console.log(err)}
									if(user){
										if(user.password===password){
											var name=user.name;
											var newName=name.substr(1);
											var letter=(name.substring(0,1)).toUpperCase();
											newName=letter+newName;
											req.session.logIn=true;
											req.session.password=user.password;
											req.session.telephone=user.telephone;						
											
											res.redirect("/users");
										}else{
											req.session.user_body=req.body;
											req.session.false_password="Mot de passe incorrect";							
											res.redirect("/login");
										}
										
									}else{
										req.session.no_user=true;
										req.session.user_body=req.body;
										res.redirect("/login");
								}
							});
						}
					});		
				}
				else{
					if(!phoneNumber){
						req.session.no_phone_number="Rensigner ce champ svp";
						req.session.user_body=req.body;				
					}
					if(!password){
						req.session.no_password="Reinseigner ce champ svp";
						req.session.user_body=req.body;
					}			
					res.redirect("/login")
				}
			}
			
		}else{
			req.session.no_phone_number="Format numero incorrect";
			req.session.user_body=req.body;
			res.redirect("/login")
		}
	},
	doLog:function(req,res){
		var phoneNumber=deleteSpace(req.params.phoneNumber);
		var password=deleteSpace(req.params.password);

		var phoneNumberRegex=/^\+?[0-9]{12}$|^[0-9]{10}$/;
		var passewordRegex=/[<>"'&\/+]/;
	
		if(phoneNumberRegex.test(phoneNumber)){
			if(phoneNumber.length===12){phoneNumber=0+(phoneNumber.substring(3))}
			if(phoneNumber.length===13){phoneNumber=0+(phoneNumber.substring(4))}	
			
			if(passewordRegex.test(password)){			
				message.type=false;
				message.password="Caractere inadmissible dans le mot de passe";
				res.status(400).json(message);							
			}else{
				User.findOne({telephone:phoneNumber},function(err,user){
					if(user!==null){								
						User.findOne({telephone:phoneNumber,password:password},function(err,correctUser){
							if(correctUser!==null){
								message.type=true;
								res.status(200).json(message);
								/*
									if(correctUser.connected===true){
										message.type=false;
										message.phoneNumber="Un Numero n'est peut se connectez sur deux terminaux different au meme moment";
										res.status(200).json(message);
										console.log("Vous etes deja connected");
									}else{
										correctUser.connected=true;
										correctUser.save(function(){
											console.log("user is fund");
											message.type=true;
											res.status(200).json(message);
										});	
									}
								*/					
							}else{								
								message.type=false;
								console.log("is not good");
								message.password="Mot de passe incorrect";
								res.status(400).json(message);						
							}
						});														
					}else{
						console.log("unfound");
						message.type=false;
						message.phoneNumber="Compte introuvable réessayez plus tard";
						res.status(400).json(message);			
					}
				});					
			}			
		}else{
			message.type=false;
			message.phoneNumber="Verifiez le format de votre numero";
			res.status(400).json(message);
		}
	},
	doLogout:function(req,res){
		let logIn,phoneNumber,password="";
		if(req.headers.authorization){
			let auth=req.headers.authorization;
			auth=auth.split(",");
			logIn=deleteSpace(auth[0]);
			phoneNumber=deleteSpace(auth[1]);
			password=deleteSpace(auth[2]);
		}else{
			logIn=req.session.logIn;
			phoneNumber=deleteSpace(req.session.telephone);
			password=deleteSpace(req.session.password);
		}			
			if(logIn){
				if(phoneNumberRegex.test(phoneNumber)){
				if(phoneNumber.length===12){phoneNumber=0+(phoneNumber.substring(3))}
				if(phoneNumber.length===13){phoneNumber=0+(phoneNumber.substring(4))}	
				
					if(passewordRegex.test(password)){
						message.type=false;
						res.status(404).json(message);							
					}else{
						User.findOne({telephone:phoneNumber,password:password},function(err,user){
							if(user!==null){
								user.connected=false;
								delete req.session.logIn;
								user.save(function(err){
									message.type=true;
									res.status(200).json(message);
								});
							}else{
								message.type="error";
								res.status(400).json(message);
							}
						});
					}
				}else{
					message.type=false;
					res.status(400).json(message);
				}
			}else{
				message.type=false;
				res.status(400).json(message);	
			}
	},
	profil:function(req,res){
		let logIn,phoneNumber,password="";
		console.log("req.headers.authorization");
		console.log(req.headers.authorization);
		if(req.headers.authorization){
			let auth=req.headers.authorization;
			auth=auth.split(",");
			logIn=deleteSpace(auth[0]);
			phoneNumber=deleteSpace(auth[1]);
			password=deleteSpace(auth[2]);
		}else{
			logIn=req.session.logIn;
			phoneNumber=deleteSpace(req.session.telephone);
			password=deleteSpace(req.session.password);
		}
		if(logIn){
			if(phoneNumberRegex.test(phoneNumber)){
				if(phoneNumber.length===12){phoneNumber=0+(phoneNumber.substring(3))}
				if(phoneNumber.length===13){phoneNumber=0+(phoneNumber.substring(4))}	
				
				if(passewordRegex.test(password)){
					message.type=false;
					res.status(404).json(message);							
				}else{
					User.findOne({telephone:phoneNumber,password:password},function(err,user){						
						if(user!==null){							
							var profile={};													
								profile.name=nameUpper(user.name);
								profile.firstname=nameUpper(user.firstname)||"";
								profile.username=nameUpper(user.username);
								profile.joined=user.join;
								profile.telephone=user.telephone;							
								res.status(200).json(profile);								
						}else{							
							message.type=false;
							res.status(400).json(message);
						}
					});
				}
			}else{
					message.type=false;
					res.status(400).json(message);
					console.log("number is fail");
				}
			}else{
				console.log("login is fail");
				message.type=false;
				res.status(400).json(message);	
			}
		
	}
	
	
};