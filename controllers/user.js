"use strict"

var User=require("../models/user");
var Queue=require("../models/queue");
var UserTontine=require("../models/userTontine");
var AllTontine=require("../models/allTontine");
var Activity=require("../models/userActivity");
var userAsking=require("../models/userAsking");
var Operateur=require("../models/operateur");

var phoneNumberRegex=/^\+?[0-9]{12}$|^[0-9]{10}$/;
var passewordRegex=/[<>"'&\/]/;
var message={};

var dayInWeek=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
var monthInYear=["janvier","fevrier","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","decembre"];


function nameUpper(name=""){
	let initialLetter=name.substring(0,1);
	let lastName=name.substring(1);
	initialLetter=initialLetter.toUpperCase();
	return initialLetter+lastName;
}

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

function newDateGeneartion(){
	var DateObject=new Date();
	
	let day=DateObject.getUTCDay();
	let dayFormat=nameUpper(dayInWeek[day]);
	
	let date=(DateObject.getUTCDate());
	let month=DateObject.getUTCMonth();
	let year=DateObject.getFullYear();
	
	let hour=(DateObject.getUTCHours())+1;
	let minute=DateObject.getUTCMinutes();
	let second=DateObject.getUTCSeconds();
	let milisecond=DateObject.getUTCMilliseconds();
	
	return date+ " "+month+" "+year+" "+hour+" "+minute+" "+second+" "+milisecond;
	//return parseFloat(date)+parseFloat(month)+parseFloat(year)+parseFloat(hour)+parseFloat(minute)+parseFloat(second);
}




function timeGeneration(){
	var DateObject=new Date();
	let hour=(DateObject.getUTCHours())+1;
	let minute=DateObject.getUTCMinutes();
	
	return hour+":"+minute;
}

function generateSolde(solde){
	console.log(solde);
	var lastSolde=solde+"";
	if((lastSolde.indexOf("."))>-1){
		var index=lastSolde.indexOf(".");
		var endIndex=index+3;
		var newSolde=lastSolde.substring(0,endIndex);
		//var floatPoint=newSolde.substring(index+1);		
		/*if(floatPoint.length===1){
			newSolde=newSolde+"0";			
		}*/		
		return newSolde;
	}else{
		return solde+".00";
	}
}


function getSolde(lastValue,telephone,password,res,user){
	var newValue=0,bonus=0;
	if(lastValue===5){newValue=10}
	if(lastValue===10){newValue=20}
	if(lastValue===20){newValue=50;bonus=2;}
	if(lastValue===50){newValue=100;bonus=10}
	if(lastValue===100){bonus=30}
	console.log("lastValue");
	console.log(lastValue);
	console.log(newValue);
	
	UserTontine.findOne({tontine:lastValue,active:true,taken:false,telephone:telephone,password:password},function(err,insideTontine){																										
		if(err){
				console.log("err");			
		}else{
			if(insideTontine===null){
				console.log("is null");
				if(lastValue===100){					
						res.redirect("/users");
					}else{
							res.redirect("/users/solde/"+newValue);
					}
			}else{
			
			var child2=insideTontine.child2;
			AllTontine.findOne({tontine:lastValue},function(err,ids){
				if(err){
						console.log("ton is null");									
				}else{
					if(ids===null){
						console.log("zero");
						if(lastValue===100){
							res.redirect("/users");
						}else{
							res.redirect("/users/solde/"+newValue);
						}																							
					}else{						
						var id=ids.id;
						var allIds=id.sort(function(a,b){
							if(a<b){
								return -1
							}else if(a>b){
								return 1
							}else{
								return 0
							}
						});																	
						if(allIds.indexOf(child2[3])>-1&&allIds.indexOf(child2[0])>-1){								
							var lastChildIndex=(allIds.indexOf(child2[3]))+1;
							var firstChildIndex=allIds.indexOf(child2[0]);
							var newIds=allIds.slice(firstChildIndex,lastChildIndex);
																	
							if(newIds.length===child2.length){
								var soldePartiel=parseFloat(lastValue*3);
								insideTontine.partielSolde=soldePartiel;
								insideTontine.active=false;
								insideTontine.taken=true;																						
								insideTontine.save(function(){									
									var lastSolde=parseFloat(user.solde);
									var newSolde=lastSolde+soldePartiel+bonus;
									user.solde=generateSolde(newSolde);
									var title="Gain sans Bonus";
									var recommandation="Pour plus de gains; investisez dans le plan de ";
									if(bonus!==0){
										title="Gain avec Bonus"
									}
									if(lastValue===5){
										recommandation+="10$";
									}
									if(lastValue===10){
										recommandation+="20$";
									}
									if(lastValue===20){
										recommandation+="50$";
									}
									if(lastValue===50){
										recommandation+="100$";
									}
									if(lastValue===100){
										recommandation="";
									}
									var childActivity=new Activity({
										type:title,
										message:"Fécilitation !!! votre tontine de "+lastValue+"$ est remplie; vous avez un gain de "+generateSolde(soldePartiel)+"$ avec un bonus de "+generateSolde(bonus)+"$ votre solde vient de passer de "+generateSolde(lastSolde)+"$ à "+generateSolde(newSolde)+"$"+recommandation,
										telephone:user.telephone,
										date:dateGeneration(),
										time:timeGeneration(),
										dateFormat:newDateGeneartion()
									});
									user.save(function(){
										if(lastValue===100){
											childActivity.save(function(){
												res.redirect("/users");
											});											
										}else{
											childActivity.save(function(){
												res.redirect("/users/solde/"+newValue);
											})											
										}											
									});																					
																								
								})
							}else{																																					
								if(lastValue===100){
									res.redirect("/users");
								}else{
									res.redirect("/users/solde/"+newValue);
								}																																	
							}
						}else{																		
							if(lastValue===100){
								res.redirect("/users");
							}else{
								res.redirect("/users/solde/"+newValue);
							}
				}																	
			}
		}
	});
			}
		
	}
})
}

function deleteSpace(string=""){
	var regex=/\s+/g;
	var newString=string.replace(regex,"");
	return newString;
}

module.exports={
	/*
	doLogout:function(req,res){
		if(req.session.admin){
			delete req.session.admin;
			delete req.session.logIn;
			res.redirect("/");
		}
		if(req.session.member){
			delete req.session.member;
			delete req.session.logIn;
			res.redirect("/");
		}
	},*/
	updateSolde:function(req,res){
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
						message.type="false";
						res.status(400).json(message);				
					}else{
						User.findOne({telephone:phoneNumber,password:password},function(err,user){
							if(err){
								message.type=false;
								res.status(400).json(message);
							}else{
								if(user===null){
									message.type=false;
									res.status(400).json(message);
								}else{
									var solde=user.solde;
									res.status(200).send(solde)
								}
							}
						})
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
	solde:function(req,res){
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
			console.log("phoneNumber");
			console.log(phoneNumber);
			var tontineValue=parseInt(req.params.tontine)?parseInt(req.params.tontine):5;
			if(phoneNumberRegex.test(phoneNumber)){
				if(phoneNumber.length===12){phoneNumber=0+(phoneNumber.substring(3))}
				if(phoneNumber.length===13){phoneNumber=0+(phoneNumber.substring(4))}
					
				if(passewordRegex.test(password)){				
					message.type="false";
					res.status(400).json(message);				
				}
				else{
					User.findOne({telephone:phoneNumber,password:password},function(err,user){
						if(err){
							console.log("err");
							console.log(err);
							
						}else{
							if(user===null){		
								message.type=false;
								res.status(400).json(message);
							}else{
								UserTontine.find({telephone:phoneNumber,password:password,active:true,taken:false},function(err,userTontine){
									if(err){
										console.log(err);
										message.type=false;
										res.status(400).json(message);
									}else{
										if(userTontine.length===0){
											console.log("is here");										
											res.redirect("/users");									
										}else{											
											var tontineLength=userTontine.length;
											var tontine=[];												
												
											for(let i=0;i<userTontine.length;i++){												
												tontine.push(userTontine[i].tontine);												
											}
											if(tontine.length>0){
												getSolde(tontineValue,phoneNumber,password,res,user);													
											}
										}
									}
								});
							}
						}
					});				
				}
			}else{
				message.type="false";
				res.status(400).json(message);
			}			
		}else{
			message.type=false;
			res.status(400).json(message);
		}
	},
	index:function(req,res){
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
					res.status(400).json(message);							
				}else{
					User.findOne({password:password,telephone:phoneNumber},function(err,user){
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
									userInfo.solde=generateSolde(user.solde);
									userInfo.withfound=generateSolde(user.withfound)||0.00;
									UserTontine.find({telephone:phoneNumber,password:password,active:true,taken:false},function(err,userTontine){
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
						}
					})
				}
			}else{
				message.type=false;
				res.status(400).json(message);
			}
		}
		else{
			message.type="false";
			res.json(message);
		}
		
	},
	depot:function(req,res){
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
					res.status(400).json(message);							
				}else{
					User.findOne({telephone:phoneNumber,password:password},function(err,user){
						if(user){
							if(user===null){
								message.type=false;
								res.status(400).json(message);
							}else{								
								var flag=phoneNumber.substring(1,3);							
								if(flag==="81"||flag==="82"){
									Operateur.findOne({operateur:"vodacom"},function(err,operateur){
										message.type="success";
										message.operatorNumber=operateur.num;
										message.operatorName=operateur.operateur;
										console.log("message")
										console.log(message)
										res.status(200).json(message);
									});
								}
								else if(flag==="99"||flag==="97"){
									Operateur.findOne({operateur:"airtel"},function(err,operateur){
										message.type="success";
										message.operatorNumber=operateur.num;
										message.operatorName=operateur.operateur;;
										res.status(200).json(message);										
									});
								}
								else if(flag==="85"||flag==="84"){
									Operateur.findOne({operateur:"orange"},function(err,operateur){
										message.type="success";
										message.operatorNumber=operateur.num;
										message.operatorName=operateur.operateur;;
										res.status(200).json(message);
									});
								}else{									
									message.type="error";
									message.message="L'operateur réseau de votre numero n'est pas encore disponible";									
									res.status(200).json(message);
								}																						
							}
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
	withdraw:function(req,res){
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
		var userPassword=deleteSpace(req.params.password);
		var sum=parseFloat(deleteSpace(req.params.sum));
		if(logIn){
			if(phoneNumberRegex.test(phoneNumber)){
				if(phoneNumber.length===12){phoneNumber=0+(phoneNumber.substring(3))}
				if(phoneNumber.length===13){phoneNumber=0+(phoneNumber.substring(4))}	
				
				if(passewordRegex.test(password)){
					message.type=false;
					res.status(400).json(message);							
				}else{
					if(passewordRegex.test(userPassword)){
						message.type="error";
						message.message="Le mot de passe contient de caractère non admissible";
						res.status(400).json(message);
						console.log("laster");
					}else{
						if(isNaN(sum)){
							message.type="error";
							message.message="Le montant à retiré doit être un chiffre";
							res.status(400).json(message);
							console.log("is not a number");
						}else{
							if(sum>=5){
							if(userPassword===password){
								User.findOne({telephone:phoneNumber,password:userPassword},function(err,user){
									if(err){
										message.type="error";
										message.message="Une erreur du système est survenue";
										res.status(400).json(message);
										console.log("corercted");
									}else{
										if(user===null){
											message.type="error";
											message.message="Le mot de passe n'est pas valide; il vous reste deux tentatives";
											res.status(400).json(message);
											console.log("solde dede");
										}else{
											var solde=parseFloat(user.solde);
											if(sum<=solde){
												if(user.withfound>0){
													message.type="error";
													message.message="Une autre démande de rétrait est en cours veuillez patienter s'il vous plait";
													res.status(200).json(message);
												}else{												
													var newSolde=solde-sum;
													newSolde=generateSolde(newSolde)
													user.solde=newSolde;
													user.withfound=generateSolde(sum);												
													user.save(function(err){														
														var newActivity=new Activity({
															type:"Démande de retrait",
															message:"Vous venez de faire une démande de retrait de "+generateSolde(sum)+"$ dans votre compte tontine$; votre solde passera de "+generateSolde(solde)+"$ à "+newSolde+"$; Veuillez patienté une notification d'envoi de ce montant vous sera envoyé",
															date:dateGeneration(),
															time:timeGeneration(),
															telephone:phoneNumber,
															dateFormat:newDateGeneartion()
														});
															
														var newUserAsk=new userAsking({
															type:"Retrait",
															message:"Demande de retait",
															sum:sum,
															time:timeGeneration(),
															date:dateGeneration(),
															telephone:phoneNumber,
															dateFormat:newDateGeneartion()
														});
														
														newActivity.save(function(){
															newUserAsk.save(function(err){
																message.type="success";
																message.message="Votre requêtte pour le retrait d'un montant de "+generateSolde(sum)+"$ s'est fait avec succès; une notification vous sera envoyer pour confirmation; veuillez patientez"
																res.status(200).json(message);
																console.log("false");
															});
														})
																													
													});
												}
											}else{
												message.type="error";
												message.message="Votre demande de retait de "+generateSolde(sum)+"$ à echouer car votre solde tontine$ est insuffisant ";
												res.status(400).json(message);
												console.log("not good");
											}
										}
									}
								});
							}else{
								message.type="error";
								message.message="Le mot de passe n'est pas valide; il vous reste deux tentatives";
								res.status(400).json(message);
								console.log("not correcte");
							}
							}else{
								message.type="error";
								message.message="Le montant minimal de retrait doit être de 5.00$";
								res.status(400).json(message);
							}
						}
					}					
				}
			}else{
				message.type=false;
				res.status(400).json(message);
				console.log("is bad");
			}
		}else{
			message.type=false;
			res.status(400).json(message);
			console.log("is false");
		}
	},
	goOnQueue:function(req,res){
		var o=newDateGeneartion();
console.log("o");
console.log(o);
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
					res.status(400).json(message);							
				}else{
					User.findOne({telephone:phoneNumber,password:password},function(err,userInvested){
						var solde=parseFloat(userInvested.solde);
						var tontine=parseInt(req.params.tontine);				
						if(tontine>solde){
							message.type="error";
							message.message="Votre solde est de "+generateSolde(solde) +"$ insuffisant pour investir dans une tontine de"+tontine+"$";
							res.status(400).json(message);
							//res.send("Votre solde est de "+solde +"$ insuffisant pour investir dans une tontine de"+tontine+"$");
						}else if(isNaN(tontine)){
							//res.send("Le plan "+tontine+" n'existe pas");
							message.type="error";
							message.message="Le plan de "+tontine+" n'existe pas";
							res.status(400).json(message);
						}
						else{
							if(tontine===5||tontine===10||tontine===20||tontine===50||tontine===100){								
								Queue.find({telephone:phoneNumber},function(err,allQueue){
									if(err){
										message.type="error";
										message.message="Une erreur est survenue ressayez plus tard";
										res.status(400).json(message);
										//res.send("Une erreur est survenue rééseyayer plus tard");
									}else{
										if(allQueue.length===0){
											UserTontine.findOne({tontine:tontine,telephone:phoneNumber,active:true,taken:false},function(err,userTontine){
												if(err){
													message.type="error";
													message.message="Une erreur est survenue ressayez plus tard";
													res.status(400).json(message);
												}else{
													if(userTontine!==null){
														message.type="error";
														message.message="Vous avez déjà une tontine de "+tontine+"$";
														res.status(400).json(message);
														
													}else{
														var newQueue=new Queue({
															name:userInvested.username,
															telephone:userInvested.telephone,
															tontineQueue:tontine															
														});
														newQueue.save(function(err){
															message.type="success";
															message.message="Fécilitation!!!; vous venez de réjoindre la file d'attente pour la tontine de "+tontine+"$";
															
															var newActivity=new Activity({
																type:"Investissement",
																message:"Vous avez investi "+tontine+"$; vous venez de réjoindre la file d'attente pour la tontine de "+tontine+"$",
																telephone:userInvested.telephone,
																date:dateGeneration(),
																time:timeGeneration(),
																dateFormat:newDateGeneartion()
															});
															newActivity.save(function(){
																res.status(200).json(message);
															});
														});
													}
												}
											});
										}else{
											var sum=0;
											allQueue.forEach(function(i){
												sum+=i.tontineQueue
											});
											if(sum>0){
												console.log("sum");
												console.log(sum);												
												var totale=parseInt(sum)+tontine;
												if(solde>=totale){
													Queue.findOne({telephone:phoneNumber,tontineQueue:tontine},function(err,userQueue){
														if(err){
															//res.send("une erreur est survenue");
															message.type="error";
															message.message="une erreur est survenue";
															res.status(400).json(message);
														}else{
															if(userQueue===null){
																UserTontine.findOne({tontine:tontine,telephone:phoneNumber,active:true,taken:false},function(err,userTontine){
																	if(err){
																		message.type="error";
																		message.message="une erreur est survenue";
																		res.status(400).json(message);
																		//res.send("une erreur est survenue");
																	}else{
																		if(userTontine!==null){
																			message.type="error";
																			message.message="Vous avez déjà une tontine de "+tontine+"$";
																			res.status(400).json(message);
																			//res.send("Vous avez deja une tontine de "+tontine+"$")
																		}else{
																			var newQueue=new Queue({
																				name:userInvested.username,
																				telephone:userInvested.telephone,
																				tontineQueue:tontine															
																			});
																			newQueue.save(function(err){
																				message.type="success";
																				message.message="Fécilitation!!!; vous venez de réjoindre la file d'attente pour la tontine de "+tontine+"$";
																				
																				var newActivity=new Activity({
																						type:"Investissement",
																						message:"Vous avez investi "+tontine+"$ vous venez de réjoindre la file d'attente pour la tontine de "+tontine+"$",
																						telephone:userInvested.telephone,
																						date:dateGeneration(),
																						time:timeGeneration(),
																						dateFormat:newDateGeneartion()
																					});
																					newActivity.save(function(){
																						res.status(200).json(message);
																					});
																				//res.send("Fécilitations; vous venez de réjoindre la file d'attente pour la tontine de "+tontine+"$");
																			});
																		}
																	}
																})
															}else{
																message.type="error";
																message.message="Vous êtes déjà sur la file d'attente pour la tontine de "+tontine+"$";
																res.status(400).json(message);
																//res.send("Vous avez deja une file d'attente pour la tontine de "+tontine+"$")
															}
														}
													});													
												}else{
													message.type="error";
													message.message="Désole vous aurait "+generateSolde(totale)+"$ sur les files d'attentes; valeur supérieure à "+generateSolde(solde)+"$ votre solde actuel";
													res.status(400).json(message);
													//res.send("Désole vous aurait "+totale+"$ ;sur la file d'attente; valeur superieur a "+solde+"$; votre solde actuelle");
												}
											}
										}
									}
								});								
							}else{
								message.type="error";
								message.message="Une tontine de "+tontine+ "$ n'existe pas veuillez investir un montant correct";
								res.status(400).json(message);								
							}
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
	invitedInTontine:function(req,res){
		var o=newDateGeneartion();
console.log("o");
console.log(o);
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
			var lastSolde="";
			var newSolde="";
			var tontine=parseInt(req.params.tontine);
			var childInvitedNumber=deleteSpace(req.params.invitedNumber);
			console.log("childInvitedNumber");
			console.log(childInvitedNumber);
			if(phoneNumberRegex.test(phoneNumber)){
				if(phoneNumber.length===12){phoneNumber=0+(phoneNumber.substring(3))}				
				if(phoneNumber.length===13){phoneNumber=0+(phoneNumber.substring(4))}			
				
				if(passewordRegex.test(password)){
					res.redirect("/login");							
				}else{
					if(phoneNumberRegex.test(childInvitedNumber)){
						if(childInvitedNumber.length===12){childInvitedNumber=0+(childInvitedNumber.substring(3))}
						if(childInvitedNumber.length===13){childInvitedNumber=0+(childInvitedNumber.substring(4))}	
					
						UserTontine.findOne({telephone:phoneNumber,tontine:tontine,active:true,taken:false},function(err,parentTontine){
							if(err){
								req.session.falseNotification="Une erreur est survenue ";
								req.session.lastTontine=tontine;
								//res.redirect("/users/queue/"+tontine);
								res.redirect("/users/queue");								
							}else{
								if(parentTontine===null){									
									req.session.falseNotification="Désolé Vous n'avait pas une tontine de "+tontine+" $";
									//res.redirect("/users/queue/"+tontine);
									req.session.lastTontine=tontine;
									res.redirect("/users/queue");
								}else{
									if(parentTontine.active){
											User.findOne({telephone:childInvitedNumber},function(err,childInvited){
												if(err){
													req.session.falseNotification="Une erreur est survenue ";
													//res.redirect("/users/queue/"+tontine);
													req.session.lastTontine=tontine;
													res.redirect("/users/queue");
												}else{
													if(childInvited===null){														
														req.session.falseNotification="Désolé "+childInvitedNumber+"n' a pas de compte";
														//res.redirect("/users/queue/"+tontine);
														req.session.lastTontine=tontine;
														res.redirect("/users/queue");
													}else{
														if(parseInt(childInvited.solde)>=tontine){
															Queue.findOne({telephone:childInvitedNumber,tontineQueue:tontine},function(err,childQueue){
															if(err){
																req.session.falseNotification="Une erreur est survenue ";
																//res.redirect("/users/queue/"+tontine);
																req.session.lastTontine=tontine;
																res.redirect("/users/queue");
															}else{
																if(childQueue===null){																	
																	req.session.falseNotification="Désolé "+childInvitedNumber+" n'est pas sur la file d'attente";
																	//res.redirect("/users/queue/"+tontine);
																	req.session.lastTontine=tontine;
																	res.redirect("/users/queue");
																}else{
																	UserTontine.find({telephone:childInvitedNumber,tontine:tontine,active:true,taken:false},null,{sort:{id:-1}},function(err,childTontine){
																		if(err){
																			req.session.falseNotification="Une erreur est survenue ";
																			//res.redirect("/users/queue/"+tontine);
																			req.session.lastTontine=tontine;
																			res.redirect("/users/queue/"+tontine);
																		}else{
																			var parentId=parentTontine.id;
																			var leftChildId=(parentId*2)-1;
																			var rightChildId=(parentId*2);
																			
																			if(childTontine.length===0){
																				lastSolde=childInvited.solde;
																				newSolde=parseFloat(childInvited.solde)-tontine;
																				
																				var parentActivity=new Activity({
																					type:"Invitation",
																					date:dateGeneration(),
																					time:timeGeneration(),
																					message:"Vous avez invité "+childInvited.username+" dans votre tontine de "+tontine+"$",
																					telephone:phoneNumber,
																					dateFormat:newDateGeneartion()
																				});
																																	
																				var FirstchildActivity=new Activity({
																					type:"Invitation",
																					date:dateGeneration(),
																					time:timeGeneration(),
																					message:"Vous venez de rejoindre la tontine de "+tontine+"$ de "+parentTontine.username,
																					telephone:childInvited.telephone,
																					dateFormat:newDateGeneartion()
																					});
																																
																				var SecondchildActivity=new Activity({
																					type:"Retrait de la file",
																					date:dateGeneration(),
																					time:timeGeneration(),
																					message:"Suite à l'invitation de "+parentTontine.username+" dans sa tontine de "+tontine+"$ ; vous venez d'être retiré de cette file d'attente; votre solde passe de "+generateSolde(lastSolde)+"$ à "+generateSolde(newSolde)+"$",
																					telephone:childInvited.telephone,
																					dateFormat:newDateGeneartion()
																				});
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
																												//var childThirdGeneration=childGenerate(childSecondGeneration);
																												
																												parentTontine.child1=[...parentTontine.child1,leftChildId];
																												parentTontine.child2=childSecondGeneration;
																												//parentTontine.child3=childThirdGeneration;
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
																														
																														childInvited.solde=parseFloat(childInvited.solde)-tontine;																														
																														
																														childInvited.save(function(){
																															childQueue.remove(function(err){
																																AllTontine.findOne({tontine:tontine},function(err,allIds){																								
																																	
																																	if(allIds===null){
																																		var newTontine=new AllTontine({
																																			tontine:tontine,
																																			id:[parseInt(leftChildId)]
																																		});
																																		newTontine.save(function(){																																			
																																			req.session.trueNotification=childInvited.username+" Vient de rejoindre votre tontine de "+tontine+"$";
																																			//res.redirect("/users/queue/"+tontine);
																																			req.session.lastTontine=tontine;																																			
																																			
																																			
																																			parentActivity.save(function(){
																																				FirstchildActivity.save(function(){
																																					SecondchildActivity.save(function(){
																																						res.redirect("/users/queue");
																																					});
																																				});
																																			});																																			
																																		})
																																	}else{
																																		var ids=allIds.id;
																																		var newIds=[...ids,leftChildId];
																																		allIds.id=newIds;
																																		allIds.save(function(){
																																			req.session.trueNotification=childInvited.username+" Vient de rejoindre votre tontine de "+tontine+"$";
																																			//res.redirect("/users/queue/"+tontine);
																																			req.session.lastTontine=tontine;
																																			parentActivity.save(function(){
																																				FirstchildActivity.save(function(){
																																					SecondchildActivity.save(function(){
																																						res.redirect("/users/queue");
																																					});
																																				});
																																			});
																																			
																																			//res.redirect("/users/queue");
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
																																																																																								
																														childInvited.solde=parseFloat(childInvited.solde)-tontine;
																														
																														childInvited.save(function(){
																															childQueue.remove(function(err){
																																AllTontine.findOne({tontine:tontine},function(err,allIds){
																																	if(allIds===null){
																																		var newTontine=new AllTontine({
																																			tontine:tontine,
																																			id:[parseInt(rightChildId)]
																																		});
																																		newTontine.save(function(){
																																			req.session.trueNotification="Félicitation!!!"+childInvited.username+" Vient de rejoindre votre tontine de "+tontine+"$";
																																			//res.redirect("/users/queue/"+tontine);
																																			req.session.lastTontine=tontine;
																																			//res.redirect("/users/queue");
																																			
																																			parentActivity.save(function(){
																																				FirstchildActivity.save(function(){
																																					SecondchildActivity.save(function(){
																																						res.redirect("/users/queue");
																																					});
																																				});
																																			});	
																																		});
																																	}else{
																																		var ids=allIds.id;
																																		var newIds=[...ids,parseInt(rightChildId)];
																																		allIds.id=newIds;
																																		allIds.save(function(){																																			
																																			req.session.trueNotification="Félicitation !!! "+childInvited.username+" Vient de rejoindre votre tontine de "+tontine+"$";
																																			//res.redirect("/users/queue/"+tontine);
																																			req.session.lastTontine=tontine;
																																			//res.redirect("/users/queue");
																																			parentActivity.save(function(){
																																				FirstchildActivity.save(function(){
																																					SecondchildActivity.save(function(){
																																						res.redirect("/users/queue");
																																					});
																																				});
																																			});	
																																		});
																																	}
																																});
																																//res.send(childInvited.telephone+" Vient de rejoindre votre tontine");
																															
																															});
																														});
																													});
																												});
																										}else{																											
																											req.session.falseNotification="Vous avez déjà atteint vos deux inviter";
																											//res.redirect("/users/queue/"+tontine);
																											req.session.lastTontine=tontine;
																											res.redirect("/users/queue");
																										}
																				
																			}
																			else{					
																			
																				req.session.falseNotification="Le "+childInvitedNumber+" possede déjà une tontine de "+tontine+" $";
																				//res.redirect("/users/queue/"+tontine);
																				req.session.lastTontine=tontine;
																				res.redirect("/users/queue");
																			}
																		}
																	});
																}
															}
														});
														}else{														
															req.session.falseNotification="Votre solde est insuffisant pour rejoindre une tontine de "+tontine+"$";
															//res.redirect("/users/queue/"+tontine);
															req.session.lastTontine=tontine;
															res.redirect("/users/queue");
														}
														
													}
												}
											});							
									}else{										
										req.session.falseNotification="Vous n'avait pas une tontine de "+tontine+"$; veuillez investir de nouveau";
										//res.redirect("/users/queue/"+tontine);
										req.session.lastTontine=tontine;
										res.redirect("/users/queue");
									}
								}
							}
						});
					}else{						
						req.session.falseNotification="Le numero de votre invité n'est pas admissible";
						//res.redirect("/users/queue/"+tontine);
						req.session.lastTontine=tontine;
						res.redirect("/users/queue");						
					}					
				}
			}else{				
				res.redirect("/login")
			}
		}else{
			res.redirect("/login")
		}
	},
	goInTontine:function(req,res){
		var o=newDateGeneartion();
console.log("o");
console.log(o);
		let logIn,hotePhone,password="";
		if(req.headers.authorization){
			let auth=req.headers.authorization;
			auth=auth.split(",");
			logIn=deleteSpace(auth[0]);
			hotePhone=deleteSpace(auth[1]);
			password=deleteSpace(auth[2]);
		}else{
			logIn=req.session.logIn;
			hotePhone=deleteSpace(req.session.telephone);
			password=deleteSpace(req.session.password);
		}
		
		if(logIn){
			var parentPhone=deleteSpace(req.params.parentPhone);
			var tontine=parseInt(req.params.tontine);
			console.log("parentPhone")
			console.log(parentPhone)
			if(phoneNumberRegex.test(hotePhone)){
				if(hotePhone.length===12){hotePhone=0+(hotePhone.substring(3))}
				if(hotePhone.length===13){hotePhone=0+(hotePhone.substring(4))}	
				
				if(passewordRegex.test(password)){
					message.type=false;
					message.password="Caractere inadmissible dans le mot de passe";
					res.status(400).json(message);							
				}else{
					if(phoneNumberRegex.test(parentPhone)){
						if(parentPhone.length===12){parentPhone=0+(parentPhone.substring(3))}
						if(parentPhone.length===13){parentPhone=0+(parentPhone.substring(4))}	
						
						User.findOne({telephone:hotePhone,password:password},function(err,user){
							if(err){
								message.type="error";
								message.message="Une erreur est survenue";
								res.status(400).json(message);
								//res.send("une erreur est survenue");
							}else{
								if(user===null){
									//res.send("une erreur est survenue");
									message.type="error";
									message.message="Une erreur est survenue";
									res.status(400).json(message);
								}else{
									if(parseInt(user.solde)>=tontine){
										
										
										UserTontine.findOne({telephone:parentPhone,tontine:tontine,active:true,taken:false},function(err,parentTontine){
											if(err){
												//res.send("error");
												message.type="error";
												message.message="Une erreur est survenue";
												res.status(400).json(message);
											}else{
												if(parentTontine===null){
													message.type="error";
													message.message="Le parrain "+parentPhone+" n'a pas de tontine de "+tontine+"$";
													res.status(400).json(message);
													//res.send("ce parent n'a pas de tontine de "+tontine+"$");
												}else{
													if(!parentTontine.open){
														message.type="error";
														message.message="Faite une demande au "+parentPhone+" de deverouiller sa tontine";
														res.status(400).json(message);
														//res.send("Faite une demande a "+parentPhone+"de deverouiller sa tontine");
													}else{
														var parentId=parentTontine.id;
														Queue.findOne({telephone:hotePhone,tontineQueue:tontine},function(err,childQueue){
															if(err){
																//res.send("Une Erreur est survenue");
																message.type="error";
																message.message="Une erreur est survenue";
																res.status(400).json(message);
															}else{
																UserTontine.find({telephone:hotePhone,tontine:tontine,active:true,taken:false},null,{sort:{id:-1}},function(err,childTontine){
																	if(err){
																		message.type="error";
																		message.message="Une erreur est survenue";
																		res.status(400).json(message);
																	}else{
																		var leftChildId=(parentId*2)-1;
																		var rightChildId=(parentId*2);
																		if(childTontine.length===0){
																			var newBalance=parseInt(user.solde)-tontine;
																			//newBalance=newBalance+"";
																			//if(newBalance.indexOf(",")===-1){newBalance=newBalance+",00"}
																			var parentActivity=new Activity({
																					type:"Invitation",
																					date:dateGeneration(),
																					time:timeGeneration(),
																					message:user.username+" vient de rejoindre votre tontine de "+tontine+" $",
																					telephone:parentPhone,
																					dateFormat:newDateGeneartion()
																				});
																																	
																				var FirstchildActivity=new Activity({
																					type:"Invitation",
																					date:dateGeneration(),
																					time:timeGeneration(),
																					message:"Vous venez de rejoindre la tontine de "+tontine+"$ de "+parentTontine.username+"; votre solde vient de passer de "+generateSolde(user.solde)+"$ à "+generateSolde(newBalance)+"$",
																					telephone:user.telephone,
																					dateFormat:newDateGeneartion()
																				});
																				
																				var SecondchildActivity=new Activity({
																					type:"Retrait de la file",
																					date:dateGeneration(),
																					time:timeGeneration(),
																					message:"Suite a votre entrée de la tontine de "+tontine+"$ de "+parentTontine.username+" ; vous venez d'être retiré de cette file d'attente; votre solde vient de passer de "+generateSolde(user.solde)+"$ à "+generateSolde(newBalance)+"$",
																					telephone:user.telephone,
																					dateFormat:newDateGeneartion()
																				});
																				
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
																													//var childThirdGeneration=childGenerate(childSecondGeneration);
																													
																													parentTontine.child1=[...parentTontine.child1,leftChildId];
																													parentTontine.child2=childSecondGeneration;
																													//parentTontine.child3=childThirdGeneration;
																													parentTontine.save(function(err){
																														var newUserTontine=new UserTontine({
																															username:user.username,
																															telephone:user.telephone,
																															password:user.password,
																															tontine:tontine,
																															id:parseInt(leftChildId),
																															parent:parentTontine.username																			
																														});
																														newUserTontine.save(function(){
																															user.solde=parseFloat(user.solde)-tontine;
																															user.save(function(){
																																function addTontineId(retire=false){
																																	var retired=retire?" et vous venez d'etre rétirer de la file d'attente pour la tontine de "+tontine +"$":""
																																	AllTontine.findOne({tontine:tontine},function(err,allIds){
																																		if(allIds===null){
																																			var newTontine=new AllTontine({
																																				tontine:tontine,
																																				id:[parseInt(leftChildId)]
																																			});
																																			
																																			
																																			newTontine.save(function(){
																																				message.type="success";
																																				message.message="Félicitation !!! "+user.username +" vous venez de rejoindre la tontine de "+parentPhone +"("+parentTontine.username+")"+retired;
																																				//res.status(200).json(message);
																																				parentActivity.save(function(){
																																					FirstchildActivity.save(function(){
																																						if(retire){
																																							SecondchildActivity.save(function(){
																																								res.status(200).json(message);
																																							});
																																						}else{
																																							res.status(200).json(message);
																																						}																																						
																																					});
																																				});
																																				//res.send("Félicitation "+user.telephone +" vous venez de rejoindre la tontine de "+parentPhone);
																																			})
																																		}else{
																																			var ids=allIds.id;
																																			var newIds=[...ids,leftChildId];
																																			allIds.id=newIds;
																																			allIds.save(function(){
																																				message.type="success";
																																				message.message="Félicitation !!! "+user.username +" vous venez de rejoindre la tontine de "+parentPhone+"("+parentTontine.username+")"+retired;
																																				//res.status(200).json(message);
																																				parentActivity.save(function(){
																																					FirstchildActivity.save(function(){
																																						if(retire){
																																							SecondchildActivity.save(function(){
																																								res.status(200).json(message);
																																							});
																																						}else{
																																							res.status(200).json(message);
																																						}
																																					});
																																				});
																																				//res.send("Félicitation "+user.telephone +" vous venez de rejoindre la tontine de "+parentPhone);
																																			});
																																		}
																																	});
																																}
																																if(childQueue==null){
																																	addTontineId();																													
																																}else{
																																	childQueue.remove(function(err){
																																		addTontineId(true)																													
																																	});
																																}
																																
																															});
																														});
																													});
																													
																											}else if(child1Number===1){
																												parentTontine.child1=[...parentTontine.child1,rightChildId];
																												parentTontine.save(function(err){
																														var newUserTontine=new UserTontine({
																															username:user.username,
																															telephone:user.telephone,
																															password:user.password,
																															tontine:tontine,
																															id:parseInt(rightChildId),
																															parent:parentTontine.username																		
																														});
																														newUserTontine.save(function(){
																															user.solde=parseFloat(user.solde)-tontine;
																															user.save(function(){
																																function addTontineId(retire=false){
																																	var retired=retire?" et vous ête retirer de la file de "+tontine +" $":""
																																	AllTontine.findOne({tontine:tontine},function(err,allIds){
																																		if(allIds===null){
																																			var newTontine=new AllTontine({
																																				tontine:tontine,
																																				id:[parseInt(rightChildId)]
																																			});
																																			newTontine.save(function(){
																																				message.type="success";
																																				message.message="Félicitation !!! "+user.username +" vous venez de rejoindre la tontine de "+parentPhone+"("+parentTontine.username+")"+retired;
																																				//res.status(200).json(message);
																																				parentActivity.save(function(){
																																					FirstchildActivity.save(function(){
																																						if(retire){
																																							SecondchildActivity.save(function(){
																																								res.status(200).json(message);
																																							});
																																						}else{
																																							res.status(200).json(message);
																																						}
																																					});
																																				});
																																				//res.send("Félicitation "+user.telephone +" vous venez de rejoindre la tontine de "+parentPhone);
																																			});
																																		}else{
																																			var ids=allIds.id;
																																			var newIds=[...ids,parseInt(rightChildId)];
																																			allIds.id=newIds;
																																			allIds.save(function(){
																																				message.type="success";
																																				message.message="Félicitation !!! "+user.username +" vous venez de rejoindre la tontine de "+parentPhone+"("+parentTontine.username+")"+retired;
																																				//res.status(200).json(message);
																																				parentActivity.save(function(){
																																					FirstchildActivity.save(function(){
																																						if(retire){
																																							SecondchildActivity.save(function(){
																																								res.status(200).json(message);
																																							});
																																						}else{
																																							res.status(200).json(message);
																																						}
																																					});
																																				});
																																				//res.send("Félicitation "+user.telephone +" vous venez de rejoindre la tontine de "+parentPhone);
																																			});
																																		}
																																	});
																																	//res.send(childInvited.telephone+" Vient de rejoindre votre tontine");
																																}
																																if(childQueue===null){
																																	addTontineId()
																																}else{
																																	childQueue.remove(function(err){																									
																																		addTontineId(true)
																																	});
																																}
																															});
																														});
																													});
																											}else{
																												message.type="error";
																												message.message="Le "+parentPhone+"à deja atteint ces deux invités";
																												res.status(400).json(message);
																												//res.send("Le "+parentPhone+"à deja atteint ces deux enfants");
																											}
																					
																				}
																				else{
																					message.type="error";
																					message.message="Vous avez déjà une tontine de "+tontine+"$; essayez un autre plan si votre solde le permet; sinon faite un depot";
																					res.status(400).json(message);
																					//res.send("Vous avez deja une tontine de "+tontine+" $; essayer un autre plan si votre solde le permet");															
																				}
																			}
																		});
																}
															});
													}
												}
											}
										})
										
										
										
										}else{
											message.type="error";
											message.message="Votre solde est de "+generateSolde(user.solde)+"$ insuffisant pour rejoindre la tontine de "+tontine+"$"
											res.status(400).json(message);
											//res.send("Votre solde est insuffisant pour rejoindre une tontine de "+tontine+" $")
										}						
									}
								}
							});
					}else{
						message.type="error";
						message.message="Le numero "+parentPhone+" n'est pas admissible";
						res.status(400).json(message);						
					}						
				}
			}else{
				message.type=false;
				message.phoneNumber="Format numero incorrect";
				res.status(400).json(message);
			}
		}else{
			message.type=false;
			res.status(400).json(message);
		}
	},
	queue:function(req,res){
		var viewModel={};
		if(req.session.lastTontine){
			viewModel.lastTontine=req.session.lastTontine;
			console.log("req.session.lastTontine")
			console.log(req.session.lastTontine)
			delete req.session.lastTontine
		}
		if(req.session.falseNotification){
			viewModel.falseNotification=req.session.falseNotification;
			delete req.session.falseNotification;
		}
		if(req.session.trueNotification){
			viewModel.trueNotification=req.session.trueNotification;
			delete req.session.trueNotification;
		}		
		res.render("queuef",viewModel);
	},
	userQueue:function(req,res){
		console.log("req.body");
		console.log(req.body);
		
		if(req.body.logIn==="true"){
			req.session.logIn=true;
			req.session.telephone=deleteSpace(req.body.phone);
			req.session.password=deleteSpace(req.body.pass);
			res.redirect("/users/queue/"+req.body.tontine);
		}else{
			message.type=false;
			res.status(400).json(message);
		}
	},
	findQueue:function(req,res){
		
		let logIn,phoneNumber,password="";
		
		if(req.headers.authorization){
			let auth=req.headers.authorization;
			auth=auth.split(",");
			logIn=deleteSpace(auth[0]);
			phoneNumber=deleteSpace(auth[1])||deleteSpace(session.telephone);
			password=deleteSpace(auth[2])||deleteSpace(session.password);
		}else{
			logIn=req.session.logIn;
			phoneNumber=deleteSpace(req.session.telephone);
			password=deleteSpace(req.session.password);
		}
		
		if(logIn){
			var tontine=parseInt(req.params.tontine);
			
			if(isNaN(tontine)){tontine=5}
			if(phoneNumberRegex.test(phoneNumber)){
				if(phoneNumber.length===12){phoneNumber=0+(phoneNumber.substring(3))}
				if(phoneNumber.length===13){phoneNumber=0+(phoneNumber.substring(4))}	
				
				if(passewordRegex.test(password)){
					//res.redirect("/login");
					message.type=false;
					res.status(400).json(message);
				}else{
					//var viewModel={};
					var object={};
					User.findOne({telephone:phoneNumber,password:password},function(err,user){
						if(err){							
							
							object.error="Une erreur est survenue; ressayez plus tard";
							//viewModel.error="Une erreur est survenue; réessayez plus tard";
							if(req.session.falseNotification){
								//viewModel.falseNotification=req.session.falseNotification;
								object.falseNotification=req.session.falseNotification;
								delete req.session.falseNotification;
							}
							if(req.session.trueNotification){
								//viewModel.trueNotification=req.session.trueNotification;
								object.trueNotification=req.session.trueNotification;
								delete req.session.trueNotification;
							}
							res.status(400).json(object);
								
							//res.render("queue",viewModel);
							
						}else{
							if(user===null){
								object.error="Vous n'etes pas connue comme user";
								//viewModel.error="Vous n'etes pas connue comme user";
								if(req.session.falseNotification){
										//viewModel.falseNotification=req.session.falseNotification;
										object.falseNotification=req.session.falseNotification;
										delete req.session.falseNotification;
								}
								if(req.session.trueNotification){
									//viewModel.trueNotification=req.session.trueNotification;
									object.trueNotification=req.session.trueNotification;
									delete req.session.trueNotification;
								}
								res.status(400).json(object);
								
								//res.render("queue",viewModel);
							}else{
								
								Queue.find({tontineQueue:tontine},function(err,allQueue){
									if(err){
										
									}else{
										if(allQueue.length===0){
											console.log("queu is zero")
											QueueGeneration();
										}else{
											
											var allUsers=[];
											for(let i=0;i<allQueue.length;i++){
												
												User.findOne({telephone:allQueue[i].telephone},function(err,user){
													allUsers.push(i);
													if(err){														
														if(allUsers.length===allQueue.length){															
															res.send("une erreur est survenue");
														}
													}else{
														if(user===null){														
															if(allUsers.length===allQueue.length){
																res.send("une erreur est survenue");
															}
														}else{														
															if(parseFloat(user.solde)<tontine){
																var childActivity=new Activity({
																			type:"Retrait de la file",
																			date:dateGeneration(),
																			time:timeGeneration(),
																			message:"Suite à votre solde de "+generateSolde(user.solde)+"$ inferieur à la valeur de "+tontine+"$; vous venez d'etre retirer de la file de cette tontine",
																			telephone:user.telephone,
																			dateFormat:newDateGeneartion()
																});																
																if(allUsers.length===allQueue.length){																	
																	Queue.remove({telephone:user.telephone,tontineQueue:tontine},function(err){
																		console.log("last remove");
																		childActivity.save(function(){
																			QueueGeneration()
																		});																		
																	});	
																}else{
																	Queue.remove({telephone:user.telephone,tontineQueue:tontine},function(err){
																		childActivity.save(function(){																			
																		});																	
																	});	
																}															
															}else{																
																if(allUsers.length===allQueue.length){																	
																	QueueGeneration()
																}															
															}
														}
													}
												});
											}
										}
									}
								});
								
								function QueueGeneration(){
									Queue.find({tontineQueue:tontine},"name telephone",{sort:{name:1}},function(err,usersQueue){
										if(err){
											//viewModel.error="Une erreur est survenue; réessayez plus tard";
											object.error="Une erreur est survenue; veuillez ressayez plus tard";
											if(req.session.falseNotification){
													//viewModel.falseNotification=req.session.falseNotification;
													object.falseNotification=req.session.falseNotification;
													delete req.session.falseNotification;
												}
												if(req.session.trueNotification){
													//viewModel.trueNotification=req.session.trueNotification;
													object.trueNotification=req.session.trueNotification;
													delete req.session.trueNotification;
												}
											//res.render("queue",viewModel);
											res.status(400).json(object);
											
										}else{
											var queue={};
											if(usersQueue.length===0){
												object.error="Aucune file d'attente pour la tontine de "+tontine+"$";
												//viewModel.error="Aucune file d'attente pour la tontine de "+tontine+"$";
												if(req.session.falseNotification){
													//viewModel.falseNotification=req.session.falseNotification;
													object.falseNotification=req.session.falseNotification;
													delete req.session.falseNotification;
												}
												if(req.session.trueNotification){
													//viewModel.trueNotification=req.session.trueNotification;
													object.trueNotification=req.session.trueNotification;
													delete req.session.trueNotification;
												}
												//res.render("queue",viewModel);
												res.status(200).json(object);
												console.log("oldone");
											}else{											
												if(req.session.falseNotification){
													//viewModel.falseNotification=req.session.falseNotification;
													object.trueNotification=req.session.trueNotification;
													delete req.session.falseNotification;
												}
												if(req.session.trueNotification){
													object.trueNotification=req.session.trueNotification;
													//viewModel.trueNotification=req.session.trueNotification;												
													delete req.session.trueNotification;
												}
												console.log("okkk");											
												object.queue=usersQueue;
												res.status(200).json(object);
												//viewModel.queue=usersQueue;						
												//res.render("queue",viewModel);
											}
										}
									});
								}
								
								
							}
						}
					})
						
				}
			}else{
				//res.redirect("/login");
				message.type=false;
				res.status(400).json(message)
			}
		}else{
			//res.redirect("/login");
			message.type=false;
			res.status(400).json(message);
		}
		
	},
	findTontine:function(req,res){
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
					console.log("mot de passe incorrect");
					message.type=false;
					res.status(400).json(message);							
				}else{
					User.findOne({telephone:phoneNumber,password:password},function(err,user){
						if(err){
							res.send("error")
						}else{
							if(user===null){
								res.send("No user is found");
							}else{
								UserTontine.find({telephone:phoneNumber,password:password,active:true,taken:false},"",{sort:{tontine:-1}},function(err,tontines){
									if(err){
										res.send("error");
									}else{
										
										var userTontine={5:false,10:false,20:false,50:false,100:false};
										var userInfo={};
										
										if(tontines.length===0){
											userInfo.active=false;
											userInfo.plan=userTontine;
											res.json(userInfo);
										}else{
											var firstTontine=parseInt(tontines[0].tontine);
											tontines.forEach(function(x){
												if(x.tontine===5 || x.tontine===10 ||x.tontine===20 ||x.tontine===50 ||x.tontine===100){
													userTontine[x.tontine]=true;
												}
											});
											userInfo.active=true;
											userInfo.plan=userTontine;
											
											UserTontine.findOne({telephone:phoneNumber,password:password,tontine:firstTontine,active:true,taken:false},function(err,tontine){
												if(err){
													res.send(err)
												}else{
													if(tontine===null){
														res.send("pas de tontine")
													}else{												
														var tree=[];
														var parent=tontine.parent;
														var name=user.name;												
														var firstGeneration=tontine.child1;
														console.log("firstGeneration");
														console.log(firstGeneration);
														console.log(firstGeneration.length);
														var child1Tab=[],child2Tab=[],child3Tab=[];
														if(firstGeneration.length===0){
															child1Tab=new Array(0,0);
															child2Tab=new Array(0,0,0,0);															
														}
														else if(firstGeneration.length===1){
															child1Tab=[...tontine.child1,0];
															child2Tab=[...tontine.child2];
														
														}
														else{
															child1Tab=[...tontine.child1];
															child2Tab=[...tontine.child2];
															
														}
														var childs=[...child1Tab,...child2Tab];
														console.log("childs");
														console.log(childs);
														var tree={};
														var treeOfNumber={};
														treeOfNumber.admin=firstGeneration.length;
														tree.parent=parent;
														tree.admin=name;
														userInfo.tree=tree;
														userInfo.treeOfNumber=treeOfNumber;														
													
														for(let i=0;i<6;i++){
																console.log("first")
															UserTontine.findOne({id:parseInt(childs[i]),active:true,taken:false,tontine:firstTontine},"",function(err,childTontine){
																if(err){
																	console.log("err");
																	console.log(err);
																}else{																	
																	if(childTontine===null){											
																		tree[i]="Vide";
																		treeOfNumber[i]=0;
																		
																	}else{
																		var FirstGenerationChild=childTontine.child1;
																		tree[i]=childTontine.username;
																		treeOfNumber[i]=FirstGenerationChild.length;
																	}
																	if(tree.hasOwnProperty(0)&&tree.hasOwnProperty(1)&&tree.hasOwnProperty(2)&&tree.hasOwnProperty(3)&&tree.hasOwnProperty(4)&&tree.hasOwnProperty(5)){
																	
																			res.send(userInfo);
																	}																
																}
															});
														}
														
													}
												}
											});
											
										}
									}
								});
							}
						}
					})	
				}
			}else{
				console.log("number fail");
				message.type=false;
				res.status(400).json(message);
			}
		}else{
			console.log("login is false");
			message.type=false;
			res.status(400).json(message);
		}
	},
	getTontineByPlan:function(req,res){
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
			var tontine=parseInt(req.params.tontine);
			console.log("tontine");
			console.log(tontine);
			if(phoneNumberRegex.test(phoneNumber)){
				if(phoneNumber.length===12){phoneNumber=0+(phoneNumber.substring(3))}
				if(phoneNumber.length===13){phoneNumber=0+(phoneNumber.substring(4))}	
				
				if(passewordRegex.test(password)){
					console.log("mot de passe incorrect");
					message.type=false;
					message.password="Caractère inadmissible dans le mot de passe";
					res.status(400).json(message);							
				}else{
					User.findOne({telephone:phoneNumber,password:password},function(err,user){
						if(err){
							res.send("error");
						}else{
							if(user===null){
								res.send("Pas d'utilisateur pour ce numero");
							}else{
								var userInfo={};
								UserTontine.findOne({telephone:phoneNumber,password:password,tontine:tontine,active:true,taken:false},function(err,userTontine){
												if(err){
													res.send("Une erreur est survenue")
												}else{
													if(userTontine===null){
														res.send("Vous n'avais pas une tontine de "+tontine+"$");
													}else{											
														var parent=userTontine.parent;
														var name=user.username;												
														var firstGeneration=userTontine.child1;
														var child1Tab=[],child2Tab=[],child3Tab=[];
														if(firstGeneration.length===0){
															child1Tab=new Array(0,0);
															child2Tab=new Array(0,0,0,0);
															
														}
														else if(firstGeneration.length===1){
															child1Tab=[...userTontine.child1,0];
															child2Tab=[...userTontine.child2];
															
														}
														else{
															child1Tab=[...userTontine.child1];
															child2Tab=[...userTontine.child2];
															
														}
														var childs=[...child1Tab,...child2Tab];						
									
														var tree={};
														var treeOfNumber={};
														treeOfNumber.admin=firstGeneration.length;
														tree.parent=nameUpper(parent);
														tree.admin=nameUpper(name);
														userInfo.tree=tree;
														userInfo.treeOfNumber=treeOfNumber;				
																												
														for(let i=0;i<6;i++){																	
															UserTontine.findOne({id:parseInt(childs[i]),active:true,taken:false,tontine:tontine},"",function(err,childTontine){
																if(err){
																	console.log(err);
																}else{
																	if(childTontine===null){											
																		tree[i]="Vide";
																		treeOfNumber[i]=0;
																		
																	}else{
																		var FirstGenerationChild=childTontine.child1;
																		var lastName=childTontine.username;																		
																		tree[i]=nameUpper(lastName);
																		treeOfNumber[i]=FirstGenerationChild.length;
																	}
																	if(tree.hasOwnProperty(0)&&tree.hasOwnProperty(1)&&tree.hasOwnProperty(2)&&tree.hasOwnProperty(3)&&tree.hasOwnProperty(4)&&tree.hasOwnProperty(5)){
																			console.log("tree")
																			console.log(tree)
																			res.send(userInfo);
																	}
																	
																}
															});
														}									
													}
												}
											});			
							}
					}
			});
					
				}
			}else{
				console.log("number fail");
				message.type=false;
				message.phoneNumber="Format numero incorrect";
				res.status(400).json(message);
			}
		}else{
			console.log("session is lost");
			message.type=false;
			message.session=false;
			res.status(400).json(message);
		}
	},
	allnotification:function(req,res){
		res.render("notification");
	},
	postnotification:function(req,res){
		console.log("dede")
		if(req.body.logIn==="true"){
			console.log("is there");
			req.session.logIn=true;
			var phone=deleteSpace(req.body.phone);
			var password=deleteSpace(req.body.pass);
			req.session.telephone=phone;
			req.session.password=password;
			res.redirect("/users/find_notification/"+phone+"/"+password);
		}else{
			console.log("is false");
			message.type=false;
			res.status(400).json(message);
		}
	},
	notification_count:function(req,res){
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
					message.password="Caractere inadmissible dans le mot de passe";
					res.status(400).json(message);							
				}else{
					Activity.find({telephone:phoneNumber,read:false},function(err,notification){
						if(err){
							console.log(err);
						}else{
							if(notification.length>0){
								message.type=true;
								message.count=true;
								
								res.status(200).json(message);
							}else{
								message.type=true;
								message.count=false;
								res.status(200).json(message);
							}
						}
					});					
				}
			}else{
				message.type=false;
				message.phoneNumber="Format numero incorrect";
				res.status(400).json(message);
			}
		}else{
			console.log("session is lost");
			message.type=false;
			message.session=false;
			res.status(400).json(message);
		}
	},
	find_notification:function(req,res){
		let logIn,phoneNumber,password="";
		
		if(req.headers.authorization){
			let auth=req.headers.authorization;
			auth=auth.split(",");
			logIn=deleteSpace(auth[0]);
			phoneNumber=deleteSpace(auth[1])||deleteSpace(session.telephone);
			password=deleteSpace(auth[2])||deleteSpace(session.password);
		}else{
			logIn=req.session.logIn;
			phoneNumber=deleteSpace(req.session.telephone);
			password=deleteSpace(req.session.password);
		}
		
		if(logIn){
			var activity={};
			if(phoneNumberRegex.test(phoneNumber)){
				if(phoneNumber.length===12){phoneNumber=0+(phoneNumber.substring(3))}
				if(phoneNumber.length===13){phoneNumber=0+(phoneNumber.substring(4))}	
				
				if(passewordRegex.test(password)){					
					activity.error="Veuillez vous connecter";
					res.status(400).json(activity);
				}else{									
					Activity.find({telephone:phoneNumber},{ },{sort:{dateFormat:-1}},function(err,myActivity){
						if(err){
							activity.error="Une erreur est survenue";
							res.status(400).json(activity);
						}else{
							if(myActivity.length===0){
								activity.no_activity="Aucune nouvelle notification pour vous";
								res.status(200).json(activity);
							}else{								
								Activity.update({},{$set:{read:true}},{multi:true},function(err){
									activity.notification=myActivity;
									console.log(myActivity);
									res.status(200).json(activity);
								});						
								
							}
						}
					});	
				}
			}else{
				activity.error="Verifier votre numero";
				res.status(400).json(activity)
			}
		}else{
			activity.error="Veuillez vous connectez";
			res.status(400).json(message);
		}
	}	
	
}

