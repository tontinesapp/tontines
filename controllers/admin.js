var Message=require("../models/message");
var UserTontine=require("../models/userTontine");
var Queue=require("../models/queue");
var User=require("../models/user");
var AllTontine=require("../models/allTontine");
var Admin=require("../models/adm");
var Activity=require("../models/userActivity");
var AdminActivity=require("../models/adminActivity");
var OperatorMessage=require("../models/operateurMessage");
var UserAsking=require("../models/userAsking");
var DateObject=new Date();

var dayInWeek=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
var monthInYear=["janvier","fevrier","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","decembre"];

function deleteSpace(string=""){
	var regex=/\s+/g;
	var newString=string.replace(regex,"");
	return newString;
}

function newDateGeneartion(){
	//var DateObject=new Date();
	
	let day=DateObject.getUTCDay();
	let dayFormat=nameUpper(dayInWeek[day]);
	
	let date=(DateObject.getUTCDate());
	let month=DateObject.getUTCMonth();
	let year=DateObject.getFullYear();
	let hour=(DateObject.getUTCHours())+1;
	let minute=DateObject.getUTCMinutes();
	let milliseconds=DateObject.getMilliseconds();
	
	return day+" "+date+ " "+month+" "+year+" "+hour+" "+minute+" "+milliseconds;
}

function generateSolde(solde){
	var lastSolde=solde+"";
	if((lastSolde.indexOf("."))>-1){
		var index=lastSolde.indexOf(".");
		var endIndex=index+3;
		var newSolde=lastSolde.substring(0,endIndex);
		var floatPoint=newSolde.substring(index+1);
		
		if(floatPoint.length===1){
			newSolde=newSolde+"0";			
		}
		console.log(newSolde);
		return newSolde;
	}else{
		return solde+".00";
	}
}

function nameUpper(name){
	let initialLetter=name.substring(0,1);
	let lastName=name.substring(1);
	initialLetter=initialLetter.toUpperCase();
	return initialLetter+lastName;
}

function dateGeneration(){
	var Objectdate=new Date();
	
	let day=Objectdate.getUTCDay();
	let dayFormat=nameUpper(dayInWeek[day]);
	
	let date=(Objectdate.getUTCDate());
	let month=Objectdate.getUTCMonth();
	let year=Objectdate.getFullYear();
		
	let monthFormat=nameUpper(monthInYear[month]);
	
	return dayFormat+" "+date+" "+monthFormat+" "+year;
}


function timeGeneration(){
	var ObjectDate=new Date();
	let hour=(ObjectDate.getUTCHours())+1;
	let minute=ObjectDate.getUTCMinutes();
	
	return hour+":"+minute;
}

var phoneNumberRegex=/^\+?[0-9]{12}$|^[0-9]{10}$/;
var passewordRegex=/[<>"'&\/+]/;
var tokenRegex=/[<>"'&\/+]/;
var messageRegex=/[<>"'&\/+]/;

module.exports={
	doLogout:function(req,res){
		var message={};
		let logIn,phoneNumber,password="";
			console.log("req.headers");
			console.log(req.headers);
			if(req.headers.authorization){
				let auth=req.headers.authorization;
				auth=auth.split(",");
				logIn=auth[0];
				phoneNumber=auth[1];
				password=auth[2];
			}else{
				logIn=req.session.logIn;
				phoneNumber=req.session.telephone;
				password=req.session.password;
			}
			if(logIn){
				if(phoneNumberRegex.test(phoneNumber)){
				if(phoneNumber.length===12){phoneNumber=0+(phoneNumber.substring(3))}
				if(phoneNumber.length===13){phoneNumber=0+(phoneNumber.substring(4))}	
				
					if(passewordRegex.test(password)){
						message.type=false;
						res.status(400).json(message);							
					}else{
						Admin.findOne({telephone:phoneNumber,passeword:passeword},function(err,user){
							if(user!==null){
								user.connected=false;
								delete req.session.logIn;
								user.save(function(err){
									message.type=false;
									res.status(400).json(message);
								});
							}else{
								message.type=false;
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
//Login on phone
	doLog:function(req,res){
		//var phoneNumber=req.params.phoneNumber;
		//var password=decodeURIComponent(req.params.password);
		//var token=req.params.token
		var phoneNumber=req.body.phoneNumber;
		var password=req.body.password;
		var token=req.body.token;
		var message={};
		console.log("req.body");
		console.log(req.body);
		if(phoneNumberRegex.test(phoneNumber)){
			if(phoneNumber.length===12){phoneNumber=0+(phoneNumber.substring(3))}
			if(phoneNumber.length===13){phoneNumber=0+(phoneNumber.substring(4))}
			
			if(passewordRegex.test(password)){
				console.log("mot de passe incorrect");
				message.type=false;
				message.password="Caractere inadmissible dans le mot de passe";
				res.status(400).json(message);							
			}else{
				if(tokenRegex.test(token)){
					console.log("mot de passe incorrect");
					message.type=false;
					message.password="Caractere inadmissible dans le token";
					res.status(400).json(message);
				}else{
					Admin.findOne({telephone:phoneNumber},function(err,user){
					if(user!==null){								
						Admin.findOne({telephone:phoneNumber,password:password},function(err,correctUser){
							if(correctUser!==null){
								Admin.findOne({telephone:phoneNumber,password:password,token:token},function(err,admin){
									if(admin.isConnected){
										message.connected=true;
										message.isConnected="Un Numero n'est peut se connectez sur deux terminaux different au meme moment";
										res.status(200).json(message);
									}else{
										admin.connected=true;
										admin.save(function(){
										console.log("The listiner is in place");
										message.type=true;
										req.session.admin=admin;
										res.status(200).json(message);
									});	
									}
								});																		
							}else{
								message.type=false;
								message.password="Mot de passe incorrect";
								res.status(400).json(message);						
							}
						});														
					}else{
						message.type=false;
						message.phoneNumber="Ce numero n'est pas reconnu";
						res.status(400).json(message);			
					}
					});
				}									
			}
			
		}else{
			console.log("number fail");
			message.type=false;
			message.phoneNumber="Verifiez le format de votre numero";
			res.status(400).json(message);
		}
	},
//Login in computer these information come from login on login controller
	login:function(req,res){
		if(req.session.admin){
			var phone=deleteSpace(req.session.admin.telephone);
			var password=deleteSpace(req.session.admin.password);
			Admin.findOne({telephone:phone,password:password},function(err,user){
				if(err){
					res.redirect("/login");
					console.log("err is e")
				}
				if(user){					
					let viewModel={
						title:"AdminLogin"
					};
					if(req.session.false_token){
						viewModel.false_token=req.session.false_token;
						delete req.session.false_token
					}
					res.render("adminLogin",viewModel);
				}else{
					res.redirect("/login");
				}
			});	
		}
		else{
			res.redirect("/login");
		}		
	},
	token:function(req,res){
		console.log("req.session.");
		console.log(req.session.admin);
		if(req.session.admin && req.session.logIn){
			var telephone=req.session.admin.telephone;
			var token=deleteSpace(req.body.token);
			var passeword=req.session.admin.password;
			
			if(passewordRegex.test(token)){			
				req.session.token=false;
				req.session.false_token="Caractère inadmissible dans votre token";				
				res.redirect("/admin");
			}else{
				Admin.findOne({telephone:telephone,password:passeword},function(err,user){
					if(err){
						console.log("err");
						res.redirect("/login");}
					if(user){
						console.log("is there");
						if(user.token===token){
							console.log("oki");
							if(user.role==="sender"){
								req.session.privilege="sender";
								res.redirect("/admin/sender");							
							}
							else if(user.role==="checker"){
								req.session.privilege="checker";
								res.redirect("/admin/checker/deposit");					
							}
							else if(user.role==="superAdmin"){
								req.session.privilege="superAdmin";
								res.redirect("/admin/superAdmin");
							}
							else{
								req.session.token=token;
								//req.session.false_token="Vous n'est pas acredité";				
								//res.redirect("/login");
								res.redirect("/admin/all_users");
							}						
						}else{
							req.session.token=false;
							req.session.false_token="Code d'acces erroner";				
							res.redirect("/admin");
						}
					}else{
						console.log("is not")
						res.redirect("/login");
					}
				});
			}
		}
		else{
			res.redirect("/login");
		}
		
	},
	superAdmin:function(req,res){
		if(req.session.admin&&req.session.logIn){
			if(req.session.privilege==="superAdmin"){
				var viewModel={};
				User.find({},function(err,users){
					if(err){
						
					}else{
						Admin.findOne({role:"admin"},function(err,admin){
							if(err){
								
							}else{
								if(admin!==null){
									var adminSolde=parseFloat(admin.solde);
									var allUsers=0;
									var usersSolde=0;
									var actifUsers=0;
									if(users.length===0){										
										var profit=adminSolde-usersSolde;
										usersSolde=generateSolde(usersSolde);
										profit=generateSolde(profit);
										adminSolde=generateSolde(adminSolde);
										
										viewModel.allUsers=allUsers;
										viewModel.actifUsers=actifUsers;
										viewModel.usersSolde=usersSolde;
										viewModel.adminSolde=adminSolde;
										viewModel.profit=profit;
										res.render("adminSuper",viewModel);
									}
									if(users.length>0){
										allUsers=users.length;													
										users.forEach(function(user,i){
											console.log("iindex");
											console.log(i);
											usersSolde+=parseFloat(user.solde);
										});
										var profit=adminSolde-usersSolde;
										usersSolde=generateSolde(usersSolde);
										profit=generateSolde(profit);
										adminSolde=generateSolde(adminSolde);
										viewModel.allUsers=allUsers;
										viewModel.usersSolde=usersSolde;
										viewModel.adminSolde=adminSolde;
										viewModel.profit=profit;													
										UserTontine.find({active:true,taken:false},function(err,usersTontine){
											if(err){
												
											}else{
												Queue.find({},function(err,usersQueue){
													if(err){
														
													}else{
														var usersOnQueue=0;
														if(usersQueue.length===0){															
															viewModel.usersOnQueue=usersOnQueue;
															if(usersTontine.length===0){																	
																viewModel.actifUsers=actifUsers;													
																res.render("adminSuper",viewModel);
															}
															if(usersTontine.length>0){
																actifUsers=usersTontine.length;
																viewModel.actifUsers=actifUsers;													
																res.render("adminSuper",viewModel);
															}
														}
														if(usersQueue.length>0){
															usersOnQueue=usersQueue.length;
															viewModel.usersOnQueue=usersOnQueue;
															if(usersTontine.length===0){												
																viewModel.actifUsers=actifUsers;													
																res.render("adminSuper",viewModel);
															}
															if(usersTontine.length>0){
																actifUsers=usersTontine.length;
																viewModel.actifUsers=actifUsers;													
																res.render("adminSuper",viewModel);
															}
														}
													}
												});
												
											}
										});
										
										
									}
								}
							}
						});						
					}
				});
				
			}else{
				res.redirect("/login");
			}
		}else{
			res.redirect("/login")
		}
	},
	sender:function(req,res){
		if(req.session.admin&&req.session.logIn){
			if(req.session.privilege==="sender"){
				res.render("adminSender");
			}else{
				res.redirect("/login");
			}
		}else{
			res.redirect("/login")
		}
	},
	withdraw_request:function(req,res){
		var withdraw={};
		if(req.session.logIn && req.session.admin){
			if(req.session.privilege==="sender"){
				UserAsking.find({type:"Retrait",check:false},function(err,message){
					if(err){
						withdraw.error="Une erreur est survenue; ressayez plus tard";
						res.status(200).json(withdraw);
					}else{
						if(message.length>0){
							withdraw.withdraw=message;
							res.status(200).json(withdraw);
						}else{							
							withdraw.no_withdraw="Pas de demande de retrait en cours";
							res.status(200).json(withdraw);
						}
					}
				});
			}else{
				withdraw.error="Désolé vous n'êtes pas abilité a acceder à ces documents";
				res.status(200).json(withdraw);
			}
		}else{
			withdraw.error="Désolé vous n'avait pas de connection";
			res.status(200).json(withdraw);			
		}
	},
	getUserRequest:function(req,res){
		var withdraw={};
		if(req.session.logIn && req.session.admin){
			if(req.session.privilege==="sender"){
				var id=req.body.id;
				UserAsking.findOne({type:"Retrait",check:false,_id:id},function(err,message){
					if(err){
						withdraw.error="Une erreur est survenue; ressayez plus tard";
						res.status(200).json(withdraw);
					}else{												
						if(message!==null){
							var sumAsk=message.sum;
							var phoneAsk=message.telephone;
							message.traited=true;							
							message.traitedTime=timeGeneration();
							message.traitedDate=dateGeneration();
							message.save(function(){
								var senderActivity=new AdminActivity({
									type:"envoie",
									message:"Vous venez de certifier avoir envoyer un montant de "+generateSolde(sumAsk)+"$ au numero "+phoneAsk,
									telephone:req.session.admin.telephone,
									date:dateGeneration(),
									time:timeGeneration(),
									dateFormat:newDateGeneartion(),
									year:DateObject.getFullYear(),
									month:DateObject.getUTCMonth(),
									dat:DateObject.getUTCDate(),
									hour:(DateObject.getUTCHours())+1,
									minute:DateObject.getUTCMinutes(),
									second:DateObject.getUTCMinutes(),
									millisecond:DateObject.getUTCMilliseconds()
								});
								senderActivity.save(function(){
									withdraw.withdraw=message;
									res.status(200).json(withdraw);
								});								
							});							
						}else{							
							withdraw.no_withdraw="Pas de demande de rétrait en cours";
							res.status(200).json(withdraw);
						}
						
					}
				});
			}else{
				withdraw.error="Désolé vous n'êtes pas abilité a acceder à ces documents";
				res.status(200).json(withdraw);
			}
		}else{
			withdraw.error="Désolé vous n'avait pas de connection";
			res.status(200).json(withdraw);			
		}
	},
	checkDepositMessage:function(req,res){
		if(req.session.admin&&req.session.logIn){
			if(req.session.privilege==="checker"){
				res.render("checkDeposit");
			}else{
				res.redirect("/login");
			}
		}else{
			res.redirect("/login")
		}
	},
	transaction_message:function(req,res){
		console.log(req.body);
		let login,phoneNumber,password="";
		console.log("req.headers.authorization");
		console.log(req.headers.authorization);
		if(req.headers.authorization){
			let auth=req.headers.authorization;
			auth=auth.split(",");
			logIn=deleteSpace(auth[0]);
			phoneNumber=deleteSpace(auth[1]);
			password=deleteSpace(auth[2]);
			token=deleteSpace(auth[3]);
		}else{
			logIn=req.session.logIn;
			phoneNumber=deleteSpace(req.session.telephone);
			password=deleteSpace(req.session.password);
		}		
		var validMessage=/usd|cdf|fc/ig;
		var receiveMessage=/receive|recu|reçu|received/ig;
		var sentMessage=/sent|envoi|envoyer/ig;
		var message={};		
		if(logIn){
			if(phoneNumberRegex.test(phoneNumber)){
				if(phoneNumber.length===12){phoneNumber=0+(phoneNumber.substring(3))}
				if(phoneNumber.length===13){phoneNumber=0+(phoneNumber.substring(4))}				
				if(passewordRegex.test(password)){
					message.type=false;
					res.status(400).json(message);
					console.log("bad regex");
				}else{
					if(req.body.message){
						var operateurMessage=req.body.message;
						if(messageRegex.test(operateurMessage)){
							message.type="error";
							message.message="Caractère inadmissible dans le message";
							res.status(400).json(message);
							console.log("bad messs");
						}else{
							console.log("is dan");
							var prefix=phoneNumber.substring(0,3);							
							if(prefix==="081"||prefix==="082"){
								var role="vodacom";
							}
							if(prefix==="084"||prefix==="085"||prefix==="089"){
								var role="orange";
							}
							if(prefix==="099"||prefix==="097"){
								var role="airtel";
							}
							console.log(prefix);
							console.log(role);
							if(validMessage.test(operateurMessage)){
								console.log("is there");
								if(receiveMessage.test(operateurMessage)){
									let newOperatorMessage=new OperatorMessage({
										type:"received",
										message:operateurMessage,
										date:dateGeneration(),
										time:timeGeneration(),
										admissible:true,
										role:role,
										year:DateObject.getFullYear(),
										month:DateObject.getUTCMonth(),
										dat:DateObject.getUTCDate(),
										hour:(DateObject.getUTCHours())+1,
										minute:DateObject.getUTCMinutes(),
										second:DateObject.getUTCSeconds(),
										millisecond:DateObject.getUTCMilliseconds()
									});
									newOperatorMessage.save(function(){
										message.type="succes";								
										res.status(200).json(message);
									});
									console.log("here we are")
								}else if(sentMessage.test(operateurMessage)){
									let newOperatorMessage=new OperatorMessage({
										type:"sent",
										message:operateurMessage,
										date:dateGeneration(),
										time:timeGeneration(),
										admissible:true,
										role:role,
										year:DateObject.getFullYear(),
										month:DateObject.getUTCMonth(),
										dat:DateObject.getUTCDate(),
										hour:(DateObject.getUTCHours())+1,
										minute:DateObject.getUTCMinutes(),
										second:DateObject.getUTCSeconds(),
										millisecond:DateObject.getUTCMilliseconds()
									});
									newOperatorMessage.save(function(){
										message.type="succes";								
										res.status(200).json(message);
									});
									console.log("deredef");
								}else{
									let newOperatorMessage=new OperatorMessage({
										type:"unrecognized",
										message:operateurMessage,
										date:dateGeneration(),
										time:timeGeneration(),
										role:role,
										year:DateObject.getFullYear(),
										month:DateObject.getUTCMonth(),
										dat:DateObject.getUTCDate(),
										hour:(DateObject.getUTCHours())+1,
										minute:DateObject.getUTCMinutes(),
										second:DateObject.getUTCSeconds(),
										millisecond:DateObject.getUTCMilliseconds()
									});
									newOperatorMessage.save(function(){
										message.type="unrecognized";								
										res.status(200).json(message);
									});
								}
							}else{
								console.log("oupse");
								let newOperatorMessage=new OperatorMessage({
									type:"unrecognized",
									message:operateurMessage,
									date:dateGeneration(),
									time:timeGeneration(),
									role:role,
									year:DateObject.getFullYear(),
									month:DateObject.getUTCMonth(),
									dat:DateObject.getUTCDate(),
									hour:(DateObject.getUTCHours())+1,
									minute:DateObject.getUTCMinutes(),
									second:DateObject.getUTCSeconds(),
									millisecond:DateObject.getUTCMilliseconds()
								});
								newOperatorMessage.save(function(){
									message.type="unrecognized";								
									res.status(200).json(message);
								});
							}
						}
					}else{
						message.type="error";
						message.message="une erreur est survenue"
						res.status(400).json(message);
						console.log("error");
					}					
				}
			}else{
				message.type=false;
				res.status(400).json(message);
				console.log("bad regex flas");
			}
		}else{
			message.type=false;
			res.status(400).json(message);
			console.log("bad regex gosde");
		}
	},
	depositMessage:function(req,res){
		var deposit={};
		if(req.session.logIn && req.session.admin){
			if(req.session.privilege==="checker"){
				OperatorMessage.find({type:"received",check:false,admissible:true},function(err,message){
					if(err){
						deposit.error="Une erreur du systeme est survenue";
						res.status(200).json(deposit);
					}else{
						if(message.length>0){
							deposit.message=message;
							res.status(200).json(deposit);
						}else{
							deposit.no_message="Aucun message de confirmation de depot";
							res.status(200).json(deposit);
						}
					}
				});
			}else{
				deposit.no_ability="Veuiller verifiez votre abilitation";
				res.status(200).json(deposit);
			}
		}else{
			deposit.connect="Veuillez vous connecter";
			res.status(200).json(deposit);
		}
	},
	validationDeposit:function(req,res){
		var validation={};
		if(req.session.logIn && req.session.admin){
			if(req.session.privilege==="checker"){
				var body=req.body;
				console.log(body);
				var code=deleteSpace(body.code);
				var telephone=deleteSpace(body.telephone);
				var sum=deleteSpace(body.sum);
				var cost=deleteSpace(body.cost);				
				var solde=deleteSpace(body.solde);
				var id=deleteSpace(body.id);
				if(code.length>0 && telephone.length>0 && !isNaN(parseFloat(sum)) && !isNaN(parseFloat(solde)) && id.length>0 && !isNaN(parseFloat(cost))){
					console.log("first");
					var badcode="Format inadmissible dans ce champ";
					if(messageRegex.test(code)){
						console.log("second");
						validation.badcode=badcode;
						validation.body=req.body;
						res.status(200).json(validation);
					}else{
						console.log("third");
						if(messageRegex.test(telephone)){
							console.log("fourth");
							validation.badphone=badcode;
							validation.body=req.body;
							res.status(200).json(validation);
						}else{
							console.log("fifth");
							if(messageRegex.test(sum)){
								console.log("sixth");
								validation.badsum=badcode;
								validation.body=req.body;
								res.status(200).json(validation);
							}else{
								console.log("sev");
								if(messageRegex.test(solde)){
									console.log("eefff");
									validation.badsolde=badcode;
									validation.body=req.body;
									res.status(200).json(validation);
								}else{
									console.log("dede");
									if(isNaN(parseFloat(sum))){
										console.log(sum);
										console.log("olde");
										validation.no_number="Ce champ doit etre un chiffre";
										validation.body=req.body;
										res.status(200).json(validation);
									}else{
										console.log("unet");
										if(isNaN(parseFloat(solde))){
											console.log("side");
											validation.no_solde="Ce champ doit un chiffre";
											validation.body=req.body;
											res.status(200).json(validation);
										}else{
											if(isNaN(parseFloat(cost))){
												validation.no_cost="Ce champ doit un chiffre";
												validation.body=req.body;
												res.status(200).json(validation);
											}
											else{
											if(id && !messageRegex.test(id)){
												if(telephone.length===9){
													var prefix=telephone.substring(0,2);
													var role="";
													if(prefix==="81"||prefix==="82"){
														role="vodacom"
													}
													if(prefix==="99"||prefix==="97"){
														role="airtel"
													}
													if(prefix==="89"||prefix==="85"||prefix==="84"){
														role="orange"
													}												
												
												OperatorMessage.findOne({type:"received",check:false,admissible:true,_id:id,role:role},function(err,message){
													if(err){
														console.log(err);
														validation.msg_error="Une erreur du systeme est survenue remplissez correctement les données attendues";
														validation.body=req.body;
														res.status(200).json(validation);
													}else{														
														if(message!==null){
															var adminMessage=message.message;
															console.log("adminMessage");
															console.log(adminMessage);
															var firstPhone="0"+telephone;
															var secondPhone="243"+telephone;
															var thirdPhone="+243"+telephone;
															var regex=/\d+(?:\.{1}|,{1})\d+/g;
															var myArray=[];
															while((tab=regex.exec(adminMessage))!==null){
																myArray.push(tab[0]);
															}
															if(myArray.length>0){											
																console.log("myArray");
																console.log(myArray);
																var sumString=sum+"";
																var soldeString=solde+"";
																var costString=cost+"";	
																console.log(myArray.indexOf(sumString));
																console.log(myArray.indexOf(soldeString));
																console.log(myArray.indexOf(costString));
																
															if(adminMessage.indexOf(code)>-1 && (adminMessage.indexOf(firstPhone)>-1 || adminMessage.indexOf(secondPhone)>-1 || adminMessage.indexOf(thirdPhone)>-1) && myArray.indexOf(sumString)>-1 && myArray.indexOf(soldeString)>-1&& myArray.indexOf(costString)) {
																
																User.findOne({telephone:firstPhone},function(err,user){
																	if(err){
																		console.log(err);
																		validation.msg_error="Une erreur du systeme est survenue remplissez correctement les données attendues";
																	}else{
																		if(user!==null){
																			var lastUserSolde=user.solde;
																			if(sum.indexOf(",")){
																				sum=sum.replace(/,/,".");
																			}
																			if(solde.indexOf(",")){
																				solde=solde.replace(/,/,".");
																			}
																			if(cost.indexOf(",")){
																				cost=cost.replace(/,/,".");
																			}
																			console.log("sum is here");
																			console.log(sum)
																			console.log(solde)
																			console.log(cost);
																			var newUserSolde=parseFloat(lastUserSolde)+parseFloat(sum);
																			var newUserActivity=new Activity({
																				type:"Depot",
																				message:"Votre depot de "+generateSolde(sum)+"$ s'est fait success;votre solde actuelle est de "+generateSolde(newUserSolde)+" $",
																				date:dateGeneration(),
																				time:timeGeneration(),
																				telephone:firstPhone,
																				dateFormat:newDateGeneartion(),
																				year:DateObject.getFullYear(),
																				month:DateObject.getUTCMonth(),
																				dat:DateObject.getUTCDate(),
																				hour:(DateObject.getUTCHours())+1,
																				minute:DateObject.getUTCMinutes(),
																				second:DateObject.getUTCSeconds(),
																				millisecond:DateObject.getUTCMilliseconds()
																			});
																			var checkerActivity=new AdminActivity({
																					type:"Validation",
																					message:"Vous venez de valider un depot d'un montant de "+generateSolde(sum)+" $ pour le compte de "+firstPhone,
																					date:dateGeneration(),
																					time:timeGeneration(),
																					dateFormat:newDateGeneartion(),
																					telephone:req.session.admin.telephone,
																					year:DateObject.getFullYear(),
																					month:DateObject.getUTCMonth(),
																					dat:DateObject.getUTCDate(),
																					hour:(DateObject.getUTCHours())+1,
																					minute:DateObject.getUTCMinutes(),
																					second:DateObject.getUTCSeconds(),
																					millisecond:DateObject.getUTCMilliseconds()
																			});
																			Admin.findOne({role:role},function(err,admin){
																				var adminSolde=parseFloat(admin.solde);
																				var adminNewSolde=adminSolde+parseFloat(sum);
																				console.log(generateSolde(adminNewSolde));
																				console.log(generateSolde(solde));
																				if(generateSolde(adminNewSolde)===generateSolde(solde)){
																					
																					admin.solde=adminNewSolde;
																					admin.save(function(){																						
																						user.solde=newUserSolde;
																						user.save(function(){
																							newUserActivity.save(function(){
																								checkerActivity.save(function(){
																									message.check=true;
																									message.save(function(){
																										validation.success="La validation s'est fait avec succes";
																										res.status(200).json(validation);
																									});
																								});
																							});
																						});
																					});
																				}else{
																					validation.msg_error="Une erreur du systeme est survenue remplissez correctement les données attendues";
																					res.status(200).json(validation);
																				}
																			})
																		}else{
																			validation.no_user="Le numero "+telephone+" n'est pas encore attribué";
																			res.status(200).json(validation);
																		}
																	}
																});															
															}
															else{
																console.log("valid data");
																validation.checkdata="Les données envoyées doivent correspondre aux contenues du message à valider";
																res.status(200).json(validation);
															}
														}else{
															validation.no_message="Veuillez introduire les bonnes données";
															res.status(200).json(validation);
														}
														}else{
															validation.no_message="Veuillez introduire les bonnes données";
															res.status(200).json(validation);
														}
													}
												});
												}else{
													validation.no_valid_length="Le numero de telephone doit avoir 9 caractere";
													validation.body=req.body;
													res.status(200).json(validation);
												}												
												
											}else{
												validation.no_id="Erreur dans le code de réference du message";
												validation.body=req.body;
												res.status(200).json(validation);
											}											
										}
									}
									}							
								}
							}
						}
					}
				}else{
					var error="Veuiller replire ce champ";
					console.log("iderrrr");
					if(!code){						
						validation.no_code=error;
					}
					if(!telephone){
						validation.no_phone="Ce champ doit être un numero de telephone valide";
					}
					if(isNaN(parseFloat(sum))){
						validation.no_sum="Ce Champ doit être un chiffre";
					}
					if(isNaN(parseFloat(solde))){
						validation.no_solde="Ce champ doit être un chiffre";
					}
					if(!id){
						validation.no_id=error;
						console.log("ide");
					}
					if(isNaN(parseFloat(cost))){
						validation.no_cost="Ce champ doit etre un chiffre";
					}
					validation.body=req.body;
					res.status(200).json(validation)
				}
			}else{
				validation.error="Veuillez verifier votre abilitation";
				res.status(200).json(validation);
			}
		}else{
			validation.error="Veuillez vous connecter";
			res.status(200).json(validation);
		}
	},
	checkWithdrawMessage:function(req,res){
		if(req.session.admin&&req.session.logIn){
			if(req.session.privilege==="checker"){
				res.render("checkSend");
			}else{
				res.redirect("/login");
			}
		}else{
			res.redirect("/login")
		}
	},
	withdrawMessage:function(req,res){
		var withdraw={};
		if(req.session.logIn && req.session.admin){
			if(req.session.privilege==="checker"){
				OperatorMessage.find({type:"sent",check:false,admissible:true},function(err,message){
					if(err){
						withdraw.error="Une erreur est survenue";
						res.status(200).json(withdraw);
					}else{
						if(message.length>0){
							withdraw.message=message;
							res.status(200).json(withdraw);
						}else{							
							withdraw.no_message="Aucun message de confirmation de rétrait";
							res.status(200).json(withdraw);
						}
					}
				});
					
			}else{
				withdraw.error="Veuiller verifier votre abilitation";
				res.status(200).json(withdraw);
			}
		}else{
			withdraw.error="Veuillez vous connecter";
			res.status(200).json(withdraw);
		}
	},
	validationWithdraw:function(req,res){
		var validation={};
		if(req.session.logIn && req.session.admin){
			if(req.session.privilege==="checker"){
				var body=req.body;
				console.log(body);
				var code=deleteSpace(body.code);
				var telephone=deleteSpace(body.telephone);
				var sum=deleteSpace(body.sum);
				var cost=deleteSpace(body.cost);
				var solde=deleteSpace(body.solde);
				var id=deleteSpace(body.id);
				
				if(code.length>0 && telephone.length>0 && sum.length>0 && solde.length>0 && id.length>0 && cost.length>0){
					console.log("first");
					var badcode="Format inadmissible dans ce champ";
					if(messageRegex.test(code)){
						console.log("second");
						validation.badcode=badcode;
						validation.body=req.body;
						res.status(200).json(validation);
					}else{
						console.log("third");
						if(messageRegex.test(telephone)){
							console.log("fourth");
							validation.badphone=badcode;
							validation.body=req.body;
							res.status(200).json(validation);
						}else{
							console.log("fifth");
							if(messageRegex.test(sum)){
								console.log("sixth");
								validation.badsum=badcode;
								validation.body=req.body;
								res.status(200).json(validation);
							}else{
								console.log("sev");
								if(messageRegex.test(solde)){
									console.log("eefff");
									validation.badsolde=badcode;
									validation.body=req.body;
									res.status(200).json(validation);
								}else{
									console.log("dede");
									if(isNaN(parseFloat(sum))){
										console.log(sum);
										console.log("olde");
										validation.no_number="Ce champ doit être un chiffre";
										validation.body=req.body;
										res.status(200).json(validation);
									}else{
										console.log("unet");
										if(isNaN(parseFloat(solde))){
											console.log("side");
											validation.no_solde="Ce champ doit être un chiffre";
											validation.body=req.body;
											res.status(200).json(validation);
										}else{
											if(isNaN(parseFloat(cost))){
												validation.no_cost="Ce champ doit être un chiffre";
												validation.body=req.body;
												res.status(200).json(validation);
											}else{
											console.log("odee");
											if(id && !messageRegex.test(id)){
												if(telephone.length===9){											
													var firstPhone="0"+telephone;
													var secondPhone="243"+telephone;
													var thirdPhone="+243"+telephone;
													var flag=telephone.substring(0,2);
													var bankOpererator="";
													var role="";
													if(flag==="81"||flag==="82"){
														bankOpererator="M-Pesa";
														role="vodacom";
													}
													if(flag==="99"||flag==="97"){
														bankOpererator="Airtel-Money";
														role="airtel";
													}
													if(flag==="85"||flag==="84"||flag==="89"){
														bankOpererator="Orange-Money";
														role="orange"
													}
												
												OperatorMessage.findOne({type:"sent",check:false,admissible:true,_id:id,role:role},function(err,Operatormessage){
													if(err){
														console.log(err);
														validation.msg_error="Une erreur du systeme est survenue replissez correctement les données attendues";
														validation.body=req.body;
														res.status(200).json(validation);
													}else{
														if(Operatormessage!==null){
															var adminMessage=Operatormessage.message;
															console.log("adminMessage");
															console.log(adminMessage);
															
															var regex=/\d+(?:\.{1}|,{1})\d+/g;
															var myArray=[];
															while((tab=regex.exec(adminMessage))!==null){
																myArray.push(tab[0]);
															}
															
															if(myArray.length>0){
																var sumString=sum+"";
																var soldeString=solde+"";
																var costString=cost+"";
															if(adminMessage.indexOf(code)>-1 && (adminMessage.indexOf(firstPhone)>-1 || adminMessage.indexOf(secondPhone)>-1 || adminMessage.indexOf(thirdPhone)>-1) && myArray.indexOf(sumString)>-1 && myArray.indexOf(soldeString)>-1 && myArray.indexOf(costString)>-1){
																
																User.findOne({telephone:firstPhone},function(err,user){
																	if(err){
																		validation.msg_error="Une erreur du systeme est survenue remplissez correctement les données attendues";
																	}else{
																		if(user!==null){
																			if(sum.indexOf(",")){
																				sum=sum.replace(/,/,".");
																			}
																			if(solde.indexOf(",")){
																				solde=solde.replace(/,/,".");
																			}
																			if(cost.indexOf(",")){
																				cost=cost.replace(/,/,".");
																			}
																			var withfound=parseFloat(user.withfound);
																			if(generateSolde(withfound)===generateSolde(sum)){						
																				
																				var newUserActivity=new Activity({
																					type:"Retait",
																					message:"Conforment à votre démande de retrait precedent un depot de "+generateSolde(sum)+" $ vient d'être effectué sur votre compte "+bankOpererator+" votre solde tontine$ est de "+generateSolde(user.solde)+"$",
																					date:dateGeneration(),
																					time:timeGeneration(),
																					dateFormat:newDateGeneartion(),
																					telephone:firstPhone,
																					year:DateObject.getFullYear(),
																					month:DateObject.getUTCMonth(),
																					dat:DateObject.getUTCDate(),
																					hour:(DateObject.getUTCHours())+1,
																					minute:DateObject.getUTCMinutes(),
																					second:DateObject.getUTCSeconds(),
																					millisecond:DateObject.getUTCMilliseconds()
																				});
																				var checkerActivity=new AdminActivity({
																						type:"Validation",
																						message:"Vous venez de valider un retait d'un montant de "+generateSolde(sum)+"$ pour le compte de "+firstPhone,
																						date:dateGeneration(),
																						time:timeGeneration(),
																						dateFormat:newDateGeneartion(),
																						telephone:req.session.admin.telephone,
																						year:DateObject.getFullYear(),
																						month:DateObject.getUTCMonth(),
																						dat:DateObject.getUTCDate(),
																						hour:(DateObject.getUTCHours())+1,
																						minute:DateObject.getUTCMinutes(),
																						second:DateObject.getUTCSeconds(),
																						millisecond:DateObject.getUTCMilliseconds()
																				});
																				UserAsking.findOne({type:"Retrait",check:false,telephone:firstPhone,traited:true},function(err,message){
																					if(err){
																						validation.msg_error="Une erreur est survenue; ressayez plus tard";
																						res.status(200).json(validation);
																					}else{												
																						if(message!==null){																						
																							message.check=true;							
																							message.checkTime=timeGeneration();
																							message.checkDate=dateGeneration();
																							message.sum=0;
																							Admin.findOne({role:role},function(err,admin){
																								var adminSolde=parseFloat(admin.solde);
																								var adminNewSolde=adminSolde-sum;
																								console.log("adminNewSolde")
																								console.log(adminNewSolde)
																								console.log(solde)
																								if(generateSolde(adminNewSolde)===generateSolde(solde)){																					
																									admin.solde=generateSolde(adminNewSolde);
																									admin.save(function(){																										
																										user.withfound=0;
																										message.save(function(){
																											user.save(function(){
																												newUserActivity.save(function(){
																													checkerActivity.save(function(){
																														Operatormessage.check=true;
																														Operatormessage.save(function(){
																															validation.success="Votre validation s'est fait avec succes";
																															res.status(200).json(validation);
																														});
																													});
																												});
																											});
																										});																										
																									})
																								}else{
																									validation.msg_error="Une erreur du systeme est survenue remplissez correctement les données attendues";
																									res.status(200).json(validation);
																								}
																							});
																							
																						}else{							
																							validation.no_withdraw="Ce retrait n'a pas encore fait l'objet d'un traitement préalable, veuillez ressayez plus tard";
																							res.status(200).json(validation);
																						}
																						
																					}
																				});																				
																				
																			}else{
																				validation.no_withdraw="Le montant de retrait inscrit n'est correspond pas au montant attandu par l'utilisateur";
																				res.status(200).json(validation);
																			}																		
																		}else{
																			validation.no_user="Le numero "+telephone+" n'est pas encore attribué";
																			res.status(200).json(validation);
																		}
																	}
																});															
															}else{
																console.log("valid data");
																validation.checkdata="Les données envoyées doivent correspondre aux contenues du message à valider";
																res.status(200).json(validation);
															}
														}else{
															validation.no_message="Veuillez introduire les bonnes données";
															res.status(200).json(validation);
															}
														}else{
															validation.no_message="Veuillez introduire les bonnes données";
															res.status(200).json(validation);
														}
													}
												});
												}else{
													validation.no_valid_length="Le numero de telephone doit avoir 9 caractere";
													validation.body=req.body;
													res.status(200).json(validation);
												}												
												
											}else{
												validation.no_id="Erreur dans le code de reference du message";
												validation.body=req.body;
												res.status(200).json(validation);
											}
											}
										}
										
									}							
								}
							}
						}
					}
				}else{
					var error="Veuiller replire ce champ";
					console.log("iderrrr");
					if(!code){						
						validation.no_code=error;
					}
					if(!telephone){
						validation.no_phone="Ce champ doit être un numero de telephone valide";
					}
					if(isNaN(sum)){
						validation.no_sum="Ce Champ doit être un chiffre";
					}
					if(isNaN(solde)){
						validation.no_solde="Ce Champ doit être un chiffre";
					}
					if(isNaN(cost)){
						validation.no_cost="Ce champ doit etre un chiffre";
					}
					if(!id){
						validation.no_id=error;
						console.log("ide");
					}					
					validation.body=req.body;
					res.status(200).json(validation)
				}
			}else{
				validation.error="Veuillez verifier votre abilitation";
				res.status(200).json(validation);
			}
		}else{
			validation.error="Veuillez vous connecter";
			res.status(200).json(validation);
		}
	},
	all_users:function(req,res){
		if(req.session.logIn && req.session.admin){
			console.log("req.session");
			console.log(req.session);
			Admin.findOne({telephone:req.session.admin.telephone,password:req.session.admin.password,token:req.session.token},function(err,admin){
				if(err){
					res.redirect("/login")
				}
				if(admin!==null){
					var viewModel={};
					User.find({},"",{sort:{name:1}},function(err,users){
						if(err){
							console.log("err");
						}else{
							if(users.length>0){
								viewModel.userCount=users.length;
								viewModel.users=users;
								res.render("adminIndex",viewModel);							
							}else{
								viewModel.no_users="Pas d'utilisateur actif";
								res.render("adminIndex",viewModel);							
							}
						}
					});					
				}
			});
		}else{
			res.redirect("/login")
		}
	},
	queue_plan:function(req,res){
		var phoneNumber=req.body.phone;
		console.log("phoneNumber");
		console.log(phoneNumber);
		var message={};
		User.findOne({telephone:phoneNumber},function(err,user){
						if(err){
							message.type=false;
							res.json(message);
						}else{
							if(user){						
								if(user===null){									
									message.type=false;
									res.json(message);
								}else{
									var userInfo={};																			
									userInfo.type=true;									
									userInfo.solde=generateSolde(parseFloat(user.solde));
									userInfo.withfound=user.withfound||0;
								Activity.find({telephone:phoneNumber},"",{sort:{dateFormat:-1,time:-1}},function(err,activity){
									if(err){
										message.type=false;
										res.json(message);
									}else{
										if(activity.length===0){
											userInfo.no_activity="no_cativity";
											sendIt();
											console.log("no active")
										}else{
											console.log("activity");
											console.log(activity);
											userInfo.activity=activity
											sendIt();
										}
									}
								});	
								function sendIt(){
									UserTontine.find({telephone:phoneNumber,active:true,taken:false},function(err,userTontine){
										if(err){											
											res.json(userInfo);
										}
										else{
											var userPlan={5:false,10:false,20:false,50:false,100:false};
											var userQueue={5:false,10:false,20:false,50:false,100:false};
											if(userTontine.length===0){
												Queue.find({telephone:phoneNumber},function(err,allQueue){
													if(err){
														userInfo.active=false;
														userInfo.plan=userPlan;
														res.json(userInfo);
													}else{
														if(allQueue.length===0){
															userInfo.active=false;
															userInfo.plan=userPlan;
															userInfo.queue=userQueue;
															res.json(userInfo);
														}else{
															allQueue.forEach(function(i){
																if(i.tontineQueue===5 ||i.tontineQueue===10||i.tontineQueue===20||i.tontineQueue===50||i.tontineQueue===100){
																	userQueue[i.tontineQueue]=true;
																}
															});
															userInfo.active=false;
															userInfo.plan=userPlan;
															userInfo.queue=userQueue;
															res.json(userInfo);														
														}
													}
												});
																							
											}else{																							
												userTontine.forEach(function(x){
													if(x.tontine===5 || x.tontine===10 ||x.tontine===20 ||x.tontine===50 ||x.tontine===100){
														userPlan[x.tontine]=true;
													}
												});
												Queue.find({telephone:phoneNumber},function(err,allQueue){
													if(err){
														userInfo.active=false;
														userInfo.plan=userPlan;
														res.json(userInfo);
													}else{
														if(allQueue.length===0){
															userInfo.active=false;
															userInfo.plan=userPlan;
															userInfo.queue=userQueue;
															res.json(userInfo);
														}else{
															allQueue.forEach(function(i){
																if(i.tontineQueue===5 ||i.tontineQueue===10||i.tontineQueue===20||i.tontineQueue===50||i.tontineQueue===100){
																	userQueue[i.tontineQueue]=true;
																}
															});
															userInfo.active=false;
															userInfo.plan=userPlan;
															userInfo.queue=userQueue;
															res.json(userInfo);														
														}
													}
												});																													
											}							
										}
									});
									
								}
								}
							}else{
								message.type=false;
								res.status(200).json(message);
							}
						}
					})
	},
	tontines:function(req,res){		
		if(req.session.logIn && req.session.token && req.session.admin){
			Admin.findOne({telephone:req.session.admin.telephone,token:req.session.token,password:req.session.admin.password},function(err,admin){
				if(err){
					res.redirect("/login")
				}
				if(admin!==null){
						var tontine=parseInt(req.params.tontine);
						var viewModel={};
						UserTontine.find({tontine:tontine,active:true,taken:false},"",{sort:{id:1}},function(err,allTontines){
							if(err){
								
							}else{
								if(allTontines.length===0){
									viewModel.noTontine="Pas d'utilisateur pour la tontine de "+tontine+ "$";
									if(req.session.falseNotification){
										viewModel.falseNotification=req.session.falseNotification
										delete req.session.falseNotification;
									}
									if(req.session.trueNotification){
										viewModel.trueNotification=req.session.trueNotification;
										delete req.session.trueNotification;
									}
									res.render("adminTable",viewModel);
								}else{
									var totalOfUsers=allTontines.length;					
									var users=[];				
									
									for(var i=0;i<allTontines.length;i++){
										var elem={};
										elem.username=allTontines[i].username;
										elem.telephone=allTontines[i].telephone;
										elem.password=allTontines[i].password;
										elem.id=allTontines[i].id;
										elem.firstChild=allTontines[i].child1[0];
										elem.secondChild=allTontines[i].child1[1];
										
										elem.thirdChild=allTontines[i].child2[0]
										elem.fourthChild=allTontines[i].child2[1]
										elem.fifthChild=allTontines[i].child2[2]
										elem.sixthChild=allTontines[i].child2[3]
										
										users.push(elem);
										if(allTontines.length===users.length){
											Queue.find({tontineQueue:tontine},"",{sort:{id:1}},function(err,userQueue){
												if(err){
													if(req.session.falseNotification){
														viewModel.falseNotification=req.session.falseNotification
														delete req.session.falseNotification
													}
													if(req.session.trueNotification){
														viewModel.trueNotification=req.session.trueNotification
														delete req.session.trueNotification
													}
													viewModel.error="Une erreur est survenue veuillez ressayer plus tard";
													viewModel.users=users;
													res.render("adminTable",viewModel);
													console.log("error");
												}else{
													if(userQueue.length===0){
														console.log("noQueue");
														if(req.session.falseNotification){
															viewModel.falseNotification=req.session.falseNotification;
															delete req.session.falseNotification;
														}
														if(req.session.trueNotification){
															viewModel.trueNotification=req.session.trueNotification;
															delete req.session.trueNotification;
														}
														viewModel.noQueue="Pas de file d'attente pour la tontine "+tontine+" $";
														viewModel.users=users;
														res.render("adminTable",viewModel);
													}else{
														if(req.session.falseNotification){
															viewModel.falseNotification=req.session.falseNotification;
															delete req.session.falseNotification;
														}
														if(req.session.trueNotification){
															viewModel.trueNotification=req.session.trueNotification;
															delete req.session.trueNotification;
														}
														viewModel.queue=userQueue;
														console.log("userQueue");
														console.log(userQueue);
														viewModel.users=users;
														res.render("adminTable",viewModel);
													}
												}
											});							
										}
									}				
								}
							}
						});
					
				}else{
					res.redirect("/login");
				}
			})
		}else{
			res.redirect("/login");
		}

	},
	insertInTontine:function(req,res){
		if(req.session.logIn && req.session.token && req.session.admin){
			Admin.findOne({telephone:req.session.admin.telephone,token:req.session.token,password:req.session.admin.password},function(err,admin){
				if(err){
					res.redirect("/login")
				}
				if(admin!==null){
					var parentPhone=req.params.parent;
					console.log("parentPhone");
					console.log(parentPhone);
					var child=req.params.child;
					var tontine=parseInt(req.params.tontine);
					if(!isNaN(parentPhone)&&!isNaN(child)){
						if(!isNaN(tontine)){
									UserTontine.findOne({telephone:parentPhone,tontine:tontine,active:true,taken:false},function(err,parentTontine){
										if(err){
											req.session.falseNotification="Une erreur est survenue ";
											res.redirect("/admin/tontine/"+tontine);
										}else{
											if(parentTontine===null){									
												req.session.falseNotification="Désole Vous n'avait pas une tontine de "+tontine+" $";
												res.redirect("/admin/tontine/"+tontine);
											}else{
												if(parentTontine.active){
														User.findOne({telephone:child},function(err,childInvited){
															if(err){
																req.session.falseNotification="Une erreur est survenue ";
																res.redirect("/admin/tontine/"+tontine);
															}else{
																if(childInvited===null){														
																	req.session.falseNotification="Desole "+child+"n' a pas de compte";
																	res.redirect("/admin/tontine/"+tontine);
																}else{
																	if(parseInt(childInvited.solde)>=tontine){
																		Queue.findOne({telephone:child,tontineQueue:tontine},function(err,childQueue){
																		if(err){
																			req.session.falseNotification="Une erreur est survenue ";
																			res.redirect("/admin/tontine/"+tontine);
																		}else{
																			if(childQueue===null){																	
																				req.session.falseNotification="Desole "+child+" n'est pas sur la file d'attente";
																				res.redirect("/admin/tontine/"+tontine);
																			}else{
																				UserTontine.find({telephone:child,tontine:tontine,active:true,taken:false},null,{sort:{id:-1}},function(err,childTontine){
																					if(err){
																						req.session.falseNotification="Une erreur est survenue ";
																						res.redirect("/admin/tontine/"+tontine);
																					}else{
																						var parentId=parentTontine.id;
																						var leftChildId=(parentId*2)-1;
																						var rightChildId=(parentId*2);
																						
																						if(childTontine.length===0){
																							//Child proccess generation 
																													var child1=parentTontine.child1
																													var child1Number=child1.length;																							
																													if(child1Number===0){
																														//Generate child function
																															function childGenerate(lastChild){
																																var newChild=[];
																																lastChild.forEach(function(v){
																																	var firstChild=(v*2)-1;
																																	var secondChild=(v*2);
																																	newChild.push(firstChild,secondChild);
																																});
																																if(newChild.length>0){
																																	return newChild;
																																}
																															}
																															//End of the function
																															var childFirstGeneration=[leftChildId,rightChildId];																	
																															var childSecondGeneration=childGenerate(childFirstGeneration);
																															var childThirdGeneration=childGenerate(childSecondGeneration);
																															
																															parentTontine.child1=[...parentTontine.child1,leftChildId];
																															parentTontine.child2=childSecondGeneration;
																															parentTontine.child3=childThirdGeneration;
																															parentTontine.save(function(err){
																																var newUserTontine=new UserTontine({
																																	username:childInvited.username,
																																	telephone:childInvited.telephone,
																																	password:childInvited.password,
																																	tontine:tontine,
																																	id:parseInt(leftChildId),
																																	parent:parentTontine.username																			
																																});
																																newUserTontine.save(function(){
																																	childInvited.solde=parseInt(childInvited.solde)-tontine;
																																	childInvited.save(function(){
																																		childQueue.remove(function(err){
																																			AllTontine.findOne({tontine:tontine},function(err,allIds){
																																				if(allIds===null){
																																					var newTontine=new AllTontine({
																																						tontine:tontine,
																																						id:[parseInt(leftChildId)]
																																					});
																																					newTontine.save(function(){
																																						req.session.trueNotification=childInvited.telephone+" Vient de rejoindre la tontine de "+parentPhone+" $";
																																						res.redirect("/admin/tontine/"+tontine);
																																					})
																																				}else{
																																					var ids=allIds.id;
																																					var newIds=[...ids,leftChildId];
																																					allIds.id=newIds;
																																					allIds.save(function(){
																																						req.session.trueNotification=childInvited.telephone+" Vient de rejoindre la tontine de "+parentPhone+" $";
																																						res.redirect("/admin/tontine/"+tontine);
																																					});
																																				}
																																			});
																																			//res.send(childInvited.telephone +" Vient de rejoindre votre tontine");
																																		});
																																	});
																																});
																															});
																															
																													}else if(child1Number===1){
																														parentTontine.child1=[...parentTontine.child1,rightChildId];
																														parentTontine.save(function(err){
																																var newUserTontine=new UserTontine({
																																	username:childInvited.username,
																																	telephone:childInvited.telephone,
																																	password:childInvited.password,
																																	tontine:tontine,
																																	id:parseInt(rightChildId),
																																	parent:parentTontine.username																		
																																});
																																newUserTontine.save(function(){
																																	childInvited.solde=parseInt(childInvited.solde)-tontine;
																																	childInvited.save(function(){
																																		childQueue.remove(function(err){
																																			AllTontine.findOne({tontine:tontine},function(err,allIds){
																																				if(allIds===null){
																																					var newTontine=new AllTontine({
																																						tontine:tontine,
																																						id:[parseInt(rightChildId)]
																																					});
																																					newTontine.save(function(){
																																						req.session.trueNotification="Félicitation "+childInvited.telephone+" Vient de rejoindre la tontine de "+parentPhone+" $";
																																						res.redirect("/admin/tontine/"+tontine);
																																					});
																																				}else{
																																					var ids=allIds.id;
																																					var newIds=[...ids,parseInt(rightChildId)];
																																					allIds.id=newIds;
																																					allIds.save(function(){																																			
																																						req.session.trueNotification="Félicitation "+childInvited.telephone+" Vient de rejoindre la tontine de "+parentPhone+" $";
																																						res.redirect("/admin/tontine/"+tontine);
																																					});
																																				}
																																			});
																																			//res.send(childInvited.telephone+" Vient de rejoindre votre tontine");
																																		
																																		});
																																	});
																																});
																															});
																													}else{																											
																														req.session.falseNotification=parentPhone+" a deja atteint vos deux inviter";
																														res.redirect("/admin/tontine/"+tontine);
																													}
																							
																						}
																						else{					
																						
																							req.session.falseNotification="Le "+child+" possede déjà une tontine de "+tontine+" $";
																							res.redirect("/admin/tontine/"+tontine);
																						}
																					}
																				});
																			}
																		}
																	});
																	}else{														
																		req.session.falseNotification="Le solde de "+child+" est insuffisant pour rejoindre une tontine de "+tontine+"$";
																		res.redirect("/admin/tontine/"+tontine);
																	}
																	
																}
															}
														});							
												}else{										
													req.session.falseNotification=parentPhone+" n' pas une tontine de "+tontine+" $ active";
													res.redirect("/admin/tontine/"+tontine);
												}
											}
										}
									});
						}else{
								var elem="";
									req.session.falseNotification="La valeur de la tontine inseré n'est correspond pas";
									res.redirect("/admin/tontine/"+tontine);
								}
					}else{
						req.session.falseNotification="Veuillez inserer le bon format de numero";
						res.redirect("/admin/tontine/"+tontine);
					}
					
					
				}else{
					res.redirect("/login");
				}
			})
		}else{
			res.redirect("/login");
		}		
	},
	find_activity:function(req,res){
		var phoneNumber=req.body.phone;
		console.log("phoneNumber");
		console.log(phoneNumber);
		var userInfo={};
		Admin.findOne({role:phoneNumber},function(err,admin){
			if(err){
				userInfo.role=phoneNumber;
				userInfo.no_activity="Une erreur est survenue";
				res.json(userInfo);
			}else{
				if(admin!==null){
					AdminActivity.find({telephone:admin.telephone},{ },{sort:{date:1}},function(err,activity){
						if(err){
							userInfo.role=admin.role;
							userInfo.no_activity="Une erreur est survenue";
							res.json(userInfo);	
						}else{
							if(activity.length===0){
								userInfo.role=admin.role;
								userInfo.no_activity="no_cativity";
								res.json(userInfo);					
							}else{	
								userInfo.role=admin.role;
								userInfo.activity=activity;
								res.json(userInfo);	
							}
						}
					});
				}else{
					userInfo.role=phoneNumber;
					userInfo.no_activity="Admin non trouvé";
					res.json(userInfo);
				}				
			}			
		});	
	}
}