MyApp.user = function(params) {
	var viewModel = {
		username : ko.observable(),
		pass : ko.observable(),
		loadPanelVisible : ko.observable(false),
		passMode : "password",
		isLoggedOut : ko.observable(false),
		viewShowing : function(redirectParams) {
			this.loadPanelVisible(false);
			viewModel.isLoggedOut(window.localStorage.getItem("MyTokenId") == undefined);
			if (window.localStorage.getItem("UserName") != undefined) {
				this.username(window.localStorage.getItem("UserName"));
				registerPush();
				// var passBox = $("#passBox");
				// var passBoxInstance = passBox.dxTextBox("instance");  
				// passBoxInstance.focus();
			} else {
				// $("#nameBox").dxTextBox('instance').focus();
			}
		},
		close : function() {
			delete this.redirectParams;
		},
		
		dologin : function() {
			this.loadPanelVisible(true);
			var dataToSend = {
				UserName : viewModel.username(),
				Password : viewModel.pass()
			};
			var jsonData = JSON.stringify(dataToSend);
			// alert(jsonData);
			var request = $.ajax({
				url : "http://180.148.138.140/SellerTest2/api/mobile/login",
				type : "POST",
				data : jsonData,
				contentType : "application/json; charset=utf-8",
				dataType : "json"
			});
			request.done(function(data, textStatus) {
				viewModel.loadPanelVisible(false);
				window.localStorage.setItem("UserName", viewModel.username());
				window.localStorage.setItem("MyTokenId", data.Data);
				MyApp.app.navigate({
					view : "home",
					id : undefined
				}, {
					root : true
				});
				registerPush();
				//textStatus contains the status: success, error, etc
			});
			request.fail(function(jqxhr, textStatus, error) {
				var err = textStatus + ", " + jqxhr.responseText;
				alert("Login Failed: " + err);
				viewModel.loadPanelVisible(false);
			});
		},
		dologout : function() {
			this.loadPanelVisible(true);
			var dataToSend = {
				TokenId : window.localStorage.getItem("MyTokenId")
			};				
			var jsonData = JSON.stringify(dataToSend);
			// alert(jsonData);
			$.ajax({
				url : "http://180.148.138.140/SellerTest2/api/mobile/logout",
				type : "POST",
				data : jsonData,
				contentType : "application/json; charset=utf-8",
				dataType : "json"
			}).done(function(data, textStatus) {
				viewModel.loadPanelVisible(false);
				window.localStorage.removeItem("MyTokenId");
				viewModel.isLoggedOut(true);
				//textStatus contains the status: success, error, etc
			}).fail(function(jqxhr, textStatus, error) {
				var err = textStatus + ", " + jqxhr.responseText;
				alert("Logout Failed: " + err);
				viewModel.loadPanelVisible(false);
			});
		},
	};
	return viewModel;
};
