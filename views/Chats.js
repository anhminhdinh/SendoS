MyApp.chats = function(params) {
	var viewModel = {
		dataSource : ko.observableArray(),
		viewShowing : function() {
			doLoadData();
		},
		loadPanelVisible : ko.observable(false),
	};

	// var arrayStore = new DevExpress.data.ArrayStore({
	// key : "id",
	// data : []
	// });
	// listDataSource = new DevExpress.data.DataSource({
	// store : arrayStore,
	// pageSize : 10
	// });

	doLoadData = function(actionOptions) {
		// alert(viewModel.id);
		viewModel.loadPanelVisible(true);
		var tokenId = window.localStorage.getItem("MyTokenId");

		var dataToSend = {
			TokenId : tokenId
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
			var result = $.map(data.Data, function(item) {
				// alert("ITEM - BuyerName: " + item.BuyerName + " TotalAmount:" + item.TotalAmount);
				var date = new Date(item.CommentDate);
				var dateString = Globalize.format(date, 'dd MM-yy');
				var name = item.CustomerName.toUpperCase();
				var message = name + ' (' + dateString + '): ' + item.Message;
				return {
					id : item.Id,
					productId : item.ProductId,
					msg : message,
					isParent : item.IsParent
				};
			});
			// for (var i = 0; i < result.length; i++) {
			// listDataSource.store().insert(result[i]);
			// }
			// listDataSource.pageIndex(0);
			// listDataSource.load();
			// alert(JSON.stringify(result));
			viewModel.dataSource(result);
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
	textClicked = function(id) {
		MyApp.app.navigate({
			view : 'chatdetails',
			id : id
		});
	};
	return viewModel;
};
