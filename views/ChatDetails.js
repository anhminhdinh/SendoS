MyApp.chatdetails = function(params) {
	var viewModel = {
		dataSource : ko.observableArray(),
		id : params.id,
		loadPanelVisible : ko.observable(false),
		viewShowing : function() {
			doLoadData();
		},
		commentToPost : ko.observable(''),
	};
	doLoadData = function(actionOptions) {
		viewModel.loadPanelVisible(true);
		var tokenId = window.localStorage.getItem("MyTokenId");
		var dataToSend = {
			TokenId : tokenId,
			Id : viewModel.id
		};
		var jsonData = JSON.stringify(dataToSend);
		// alert(jsonData);
		return $.ajax({
			url : "http://180.148.138.140/sellerDev2/api/mobile/ListCommentById",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			var result = $.map(data.Data, function(item) {
				// alert("ITEM - BuyerName: " + item.BuyerName + " TotalAmount:" + item.TotalAmount);
				var today = new Date();
				var date = new Date(item.CommentDate + 'Z');
				var isSameDay = (date.getDate() == today.getDate() && date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear());
				var dateString = isSameDay ? Globalize.format(date, 'hh:mm') : Globalize.format(date, 'dd-MM-yy');
				var name = item.CustomerName.toLowerCase();
				var message = name.toUpperCase() + ': ' + item.Message;
				var isShop = name === "anna";
				return {
					name : name,
					date : dateString,
					id : item.ProductId,
					msg : message,
					isParent : item.IsParent,
					isShop : isShop
				};
			});
			// alert(JSON.stringify(result));
			viewModel.dataSource(result);
			$("#anna").css("background-color", "lightgray");
			$("#anna").css("color", "black");

			viewModel.loadPanelVisible(false);
			actionOptions.component.release();
			// alert(JSON.stringify(viewModel.dataSource()));
			// popupVisible(false);
			//textStatus contains the status: success, error, etc
		}).fail(function(jqxhr, textStatus, error) {
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Get Failed: " + err);
			viewModel.loadPanelVisible(false);
			actionOptions.component.release();
		});

	};
	postComment = function() {
		viewModel.loadPanelVisible(true);
		var tokenId = window.localStorage.getItem("MyTokenId");
		var dataToSend = {
			TokenId : tokenId,
			Id : viewModel.id,
			Message : viewModel.commentToPost()
		};
		var jsonData = JSON.stringify(dataToSend);
		// alert(jsonData);
		return $.ajax({
			url : "http://180.148.138.140/sellerDev2/api/mobile/SendComment",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			doLoadData();
		}).fail(function(jqxhr, textStatus, error) {
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Get Failed: " + err);
			viewModel.loadPanelVisible(false);
		});

	};
	return viewModel;
};
