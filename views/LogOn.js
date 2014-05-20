MyApp.LogOnPopup = function(params) {
	var viewModel = {
		username : ko.observable(),
		pass : ko.observable(),
		visible : ko.observable(false),
		loadPanelVisible : ko.observable(false),
		length : 10,
		passMode : "password",
		show : function(redirectParams) {
			this.visible(true);
			this.redirectParams = redirectParams;
			if (window.localStorage.getItem("UserName") != undefined) {
				this.username(window.localStorage.getItem("UserName"));
				$('#passBox').dxTextBox('instance').focus();
			} else {
				$('#nameBox').dxTextBox('instance').focus();
			}
		},
		close: function() {
            this.visible(false);
            delete this.redirectParams;
       	},
		dologin : function() {
			//
			// alert("dologin");
			this.loadPanelVisible(true);
			var dataToSend = {
				UserName : viewModel.username(),
				Password : viewModel.pass()
			};
			var jsonData = JSON.stringify(dataToSend);
			// alert(jsonData);
			$.ajax({
				url : "http://180.148.138.140/sellerDev2/api/mobile/login",
				type : "POST",
				data : jsonData,
				contentType : "application/json; charset=utf-8",
				dataType : "json"
			}).done(function(data, textStatus) {
				viewModel.loadPanelVisible(false);
				// alert(data.Data);
				// alert(viewModel.username());
				window.localStorage.setItem("UserName", viewModel.username());
				window.localStorage.setItem("MyTokenId", data.Data);
				// DevExpress.ui.notify("navigate " + viewModel.redirectParams.uri, "info", 1000);
				MyApp.app.navigate(viewModel.redirectParams.uri, viewModel.redirectParams.options);
				viewModel.visible(false);
				delete viewModel.redirectParams;
				//textStatus contains the status: success, error, etc
			}).fail(function(jqxhr, textStatus, error) {
				var err = textStatus + ", " + jqxhr.responseText;
				alert("Login Failed: " + err);
				viewModel.loadPanelVisible(false);
			});
		},
		showPopup : function() {
			this.visible(true);
		},
	};
	return viewModel;
};
