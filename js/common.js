convertDate = function(inputDateString) {
	var dateString = inputDateString;
	if ((dateString.indexOf("+") == -1) && (dateString.indexOf("Z") == -1))
		dateString += 'Z';
	var date = new Date(dateString);
	return date;
};

registerPush = function() {
	//AppMobi.notification.alert("Doing checkPushUser now...", "My Message", "OK");
	//See if the push user exists already
	//We are just using the unique device id, but you can send any unique user id and password.
	AppMobi.notification.checkPushUser(window.localStorage.getItem("UserName"), "nopassword");
};
