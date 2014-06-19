﻿MyApp.user = function(params) {
	var viewModel = {
		username : ko.observable(),
		pass : ko.observable(),
		loadPanelVisible : ko.observable(false),
		passMode : "password",
		savePassword : ko.observable(false),
		toggleSavePassword : function() {
			var myUserName = window.localStorage.getItem("UserName");
			if (!viewModel.savePassword()) {
				localStorage.removeItem(myUserName + "Password");
				viewModel.pass('');
			}
			localStorage.setItem(myUserName + "SavePassword", Boolean(viewModel.savePassword()));
		},
		isLoggedOut : ko.observable(false),
		viewShowing : function() {
			viewModel.loadPanelVisible(false);
			var tokenId = window.localStorage.getItem("MyTokenId");
			var isLoggedOut = tokenId === null;
			viewModel.isLoggedOut(isLoggedOut);
			if (isLoggedOut) {
				viewModel.toggleNavs(false);
				var myUserName = window.localStorage.getItem("UserName");
				if (myUserName != null) {
					viewModel.username(myUserName);
					var myPassword = window.localStorage.getItem(myUserName + "Password");
					var mySavePassword = localStorage.getItem(myUserName + 'SavePassword');
					if (mySavePassword != null) {
						viewModel.savePassword(Boolean(mySavePassword));
					}
					if (myPassword != null) {
						viewModel.pass(myPassword);
						viewModel.dologin();
					}
				}
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
				if (data.Flag === true) {
					window.localStorage.setItem("UserName", viewModel.username());
					if (viewModel.savePassword)
						window.localStorage.setItem(viewModel.username() + "Password", viewModel.pass());
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
				}
				//textStatus contains the status: success, error, etc
			});
			request.fail(function(jqxhr, textStatus, error) {
				alert("Đăng nhập thất bại!");
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
						alert("Đăng xuất thất bại!");
						viewModel.loadPanelVisible(false);
					});
				}
			});
		},
	};
	return viewModel;
};
