$(document).ready(function(){	

//MISE EN SURBRILLANCE DU LIEN ACTIF
	var menuLinks=$("#nav_container a");
	/*
	menuLinks.each(function(){
		console.log("$(this");
		console.log($(this).attr("href"));
		if(($(this).attr("href"))===window.location.pathname){
			var lastText=$(this).text();
			var newText="File de "+lastText;
			$(this).text(newText);
			$(this).css({
				color:"rgba(255,255,255,1)",
				backgroundColor:"rgba(0,128,192,1)",
				paddingLeft:"0.6em",
				paddingRight:"0.6em"
			});
		}
	});
	*/
	
	var allList=$("#list li strong span:first-child");
	
	allList.each(function(){
		var name=$(this).text();
		var firstLetter=name.substring(0,1);
		var allLetter=name.substring(1);
		console.log(allLetter);
		firstLetter=firstLetter.toUpperCase();
		var newName=firstLetter+allLetter;
		$(this).text(newName);
		var strong=$(this).parent();
		var li=strong.prev();
		li.text(firstLetter);
	});

	var allFirstLetter=$("#list .firstLetter");
	var red=255;
	var green=255;
	var blue=255;
	function randomColor(){
		red=Math.random()*red;
		green=Math.random()*green;
		blue=Math.random()*blue;
		if(red===255&&green===255&&blue===255){
			randomColor();
		}
		var color="rgba("+red+","+green+","+blue+")";
		return color;
	}
	
	allFirstLetter.each(function(){
		$(this).css({backgroundColor:randomColor()})
	});
	
	var invited=$("#list li i");
	invited.each(function(){
		var tontine=window.location.pathname;
		tontine=tontine.substring(tontine.lastIndexOf("/")+1);
	
		console.log("tontine");
		console.log(tontine);
		
		$(this).on("click",function(){
			console.log("is clicked");
			var childInvited=$(this).attr("id");
			var childInvitedName=$(this).attr("name");
			console.log("childInvited");
			console.log(childInvited);
			$("#wrapper .username").text(childInvitedName);
			$("#wrapper .telephone").text(childInvited);
			$("#wrapper .tontine").text(tontine+" $");
			
			$("#validated").attr("href","/users/invited/"+tontine+"/"+childInvited);
			$("#wrapper").fadeIn();
			$("#wrapper").css({
				display:"flex"
			});
			
			$("#cancel").on("click",function(){
				$("#wrapper").fadeOut();
				$("#validated").attr("href","");
			});
			
		});
		
	});
	
	$("#falseNotification").on("click",function(){
		$("#wrapperNotification").slideUp();
	});
	$("#trueNotification").on("click",function(){
		$("#wrapperTrueNotification").fadeOut();
	});
});
