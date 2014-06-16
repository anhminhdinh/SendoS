MyApp.user = function(params) {
	var viewModel = {
		username : ko.observable(),
		pass : ko.observable(),
		loadPanelVisible : ko.observable(false),
		passMode : "password",
		isLoggedOut : ko.observable(false),
		viewShowing : function() {
			viewModel.loadPanelVisible(false);
			if (window.localStorage.getItem("UserName") != undefined) {
				viewModel.username(window.localStorage.getItem("UserName"));
			}
			var tokenId = window.localStorage.getItem("MyTokenId");
			var isLoggedOut = tokenId === null;
			viewModel.isLoggedOut(isLoggedOut);
			if (isLoggedOut) {
				viewModel.toggleNavs(false);
			} else {
				viewModel.dologout();
			}
		},
		toggleNavs : function(onOff) {
			MyApp.app.navigation[0].option('visible', onOff);
			MyApp.app.navigation[1].option('visible', onOff);
			MyApp.app.navigation[2].option('visible', onOff);
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
				viewModel.toggleNavs(true);
				MyApp.app.navigation[3].option('title', 'Đăng xuất');
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
			var result = DevExpress.ui.dialog.confirm("Bạn có chắc muốn đăng xuất?", "Sendo.vn");
			result.done(function(dialogResult) {
				if (dialogResult) {
					viewModel.loadPanelVisible(true);
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
						viewModel.toggleNavs(false);
						MyApp.app.navigation[3].option('title', 'Đăng nhập');
						//textStatus contains the status: success, error, etc
					}).fail(function(jqxhr, textStatus, error) {
						var err = textStatus + ", " + jqxhr.responseText;
						alert("Logout Failed: " + err);
						viewModel.loadPanelVisible(false);
					});
				}
			});
		},
	};
	return viewModel;
};
