MyApp.chats = function(params) {
	var viewModel = {
		// dataSource : ko.observableArray(),
		viewShowing : function() {
			doLoadData();
		},
		loadPanelVisible : ko.observable(false),
	};

	var arrayStore = new DevExpress.data.LocalStore({
		name : "chatIdsStore",
		key : "id",
		flushInterval : 1000,
		// immediate: true,
	});
	listDataSource = new DevExpress.data.DataSource({
		store : arrayStore,
		pageSize : 10
	});

	doLoadData = function(actionOptions) {
		// alert(viewModel.id);
		viewModel.loadPanelVisible(true);
		var tokenId = window.localStorage.getItem("MyTokenId");
		var timeStamp = window.localStorage.getItem("ListCommentTimeStamp");
		if (timeStamp == undefined)
			timeStamp = 0;
		var dataToSend = {
			TokenId : tokenId,
			TimeStamp : 0
		};
		var jsonData = JSON.stringify(dataToSend);
		// alert(jsonData);
		return $.ajax({
			url : "http://180.148.138.140/sellerDev2/api/mobile/ListComment",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			if (data.Data.length > 0) {
				window.localStorage.setItem("ListCommentTimeStamp", data.TimeStamp);
				var result = $.map(data.Data, function(item) {
					// alert("ITEM - BuyerName: " + item.BuyerName + " TotalAmount:" + item.TotalAmount);
					var date = new Date(item.CommentDate);
					var dateString = Globalize.format(date, 'dd MM-yy');
					var name = item.CustomerName.toUpperCase();
					var message = name + ' (' + dateString + '): ' + item.Message;
					var dataToSend = {
						TokenId : tokenId,
						Id : item.ProductId
					};
					var jsonData = JSON.stringify(dataToSend);
					var thumbnail = "";
					$.ajax({
						url : "http://180.148.138.140/sellerDev2/api/mobile/ProductInfoById",
						type : "POST",
						data : jsonData,
						contentType : "application/json; charset=utf-8",
						dataType : "json"
					}).done(function(data, textStatus) {
						alert(JSON.stringify(data.Data));
						// thumbnail = data.Data.Thumnail;
					});
					return {
						id : item.Id,
						thumbnail : thumbnail,
						msg : message,
						isParent : item.IsParent
					};
				});
				for (var i = 0; i < result.length; i++) {
					listDataSource.store().insert(result[i]);
				}
				listDataSource.pageIndex(0);
				listDataSource.load();
				// alert(JSON.stringify(data));
				// viewModel.dataSource(result);
				// alert(JSON.stringify(viewModel.dataSource()));
				// popupVisible(false);
			}
			viewModel.loadPanelVisible(false);
			actionOptions.component.release();
			//textStatus contains the status: success, error, etc
		}).fail(function(jqxhr, textStatus, error) {
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Get Failed: " + err);
			viewModel.loadPanelVisible(false);
			actionOptions.component.release();
		});

	};
	textClicked = function(id) {
		MyApp.app.navigate({
			view : 'chatdetails',
			id : id
		});
	};
	return viewModel;
};
