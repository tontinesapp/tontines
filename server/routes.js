var express=require("express"),
router=express.Router(),
login=require("../controllers/login"),
user=require("../controllers/user"),
admin=require("../controllers/admin"),
index=require("../controllers/index");

module.exports=function(app){
//Route is login off 
	router.get("/about",index.about);
	router.get("/logout",login.doLogout);
//Routes is for inscription 
	router.get("/signup",login.signup);
	router.post("/signup",login.doSignup);
//Routes is for connection on computer
	router.get("/login",login.login);
	router.post("/login",login.doLogin);
//Route is for connection on phone
	router.get("/login/:phoneNumber/:password",login.doLog);
//Route	is for calculatin solde per user and send then on the index page
	router.get("/users/solde",user.solde);
	router.get("/users/solde/:tontine",user.solde);
//Route is for generating the users info(plan,username,activedepot)
	router.get("/users",user.index);
//Route is for a deposit money on the accompte is generate an operateur number
	router.get("/users/depot",user.depot);
//Route is for a user to retire is money
	router.get("/users/withdraw/:sum/:password",user.withdraw);
//Route for going on the queue When you have money on accompte 
	router.get("/users/invest/:tontine/",user.goOnQueue);
//Route for invited users when they are on the queue	
	router.get("/users/invited/:tontine/:invitedNumber",user.invitedInTontine);//When a user is on the queu the parent click on him
//Route for going in a tontine when users has got money on their accompte	
	router.get("/users/invest/:tontine/:parentPhone",user.goInTontine);

//Route is testing a user session if true is sending a userQueue else we cut a login
	router.get("/users/queue",user.queue);

//Route is with an ajax calling for mainting a session with a webview and redirect to find all users on the queue	
	router.post("/users/queue",user.userQueue);
//Route is calling for find all users on the queue depending with a tontine
	router.get("/users/queue/:tontine",user.findQueue);
//Route is calling for sending 
	router.get("/users/getTontines",user.findTontine);
//Be carefull with the one on the top
//Route is calling for finding a user tree by active tontine
	router.get("/users/getTontine/:tontine",user.getTontineByPlan);

//Route for finding user profile
	router.get("/users/profil",login.profil);
//Routes for finding if user has got a new notification
	router.get("/users/notification_count",user.notification_count);
//Routes for getting notification
	router.get("/users/allnotification",user.allnotification);
	router.post("/users/allnotification",user.postnotification);
	router.get("/users/find_notification/:telephone/:password",user.find_notification);
	
//routes for admin
	//Login on computer
	router.get("/admin",admin.login);
	router.post("/admin/token",admin.token);
//theses routes are for the superAdmin
	router.get("/admin/superAdmin",admin.superAdmin);
//these routes are for the sender admin
	router.get("/admin/sender",admin.sender);
	router.get("/admin/withdraw_request",admin.withdraw_request);	
	router.post("/admin/sender/getUserRequest",admin.getUserRequest);
//these routes are for the checker admin
	router.post("/admin/transaction",admin.transaction_message);
	//router.get("/admin/checker",admin.checker);
	router.get("/admin/checker/deposit",admin.checkDepositMessage);//this route is send the deposit message for validation
	router.get("/admin/checker/findMessage",admin.depositMessage);//this route is calling via ajax for finding all deposit messages
	router.get("/admin/checker/findAllMessage",admin.findAllMessage);
	router.post("/admin/depositValidation",admin.validationDeposit);//this route is calling via ajax to make a validation

	//router.post("/admin/checkDeposit",admin.checkDeposit);
	router.get("/admin/checker/withdraw",admin.checkWithdrawMessage);
	router.get("/admin/checker/findwithdraw",admin.withdrawMessage);//admin.checkWithdrawMessage
	router.post("/admin/withdrawValidation",admin.validationWithdraw);
//this routes is for the transaction 
			
//find all users
	router.get("/admin/all_users",admin.all_users);	//this is call for update users list
	router.post("/admin/index",admin.queue_plan);//this is call via ajax for update users,their plan, queue,activity and solde
	
	router.post("/admin/find_activity",admin.find_activity)
	router.get("/admin/tontine/:tontine",admin.tontines);//this is call for find all users and their tontines
	router.get("/admin/insertIn/:tontine/:parent/:child",admin.insertInTontine);//this is for an admin to insert a users in tontine	
	
	//Login on phone for a message listener
	//router.get("/admin/login/:password/:phoneNumber/:token",admin.doLog);	
	router.post("/admin/login",admin.doLog);
	router.get("/admin/logout",admin.doLogout);	
	
	app.use(router);
}