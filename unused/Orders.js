MyApp.orders = function(params) {
	var viewModel = {
		title : ko.observable('Orders'),
		viewShown : function(e) {
			this.title(this.id);
		},
		id : params.id,
		dataSource : ko.observableArray(),
		viewShowing : function() {
			doLoadData();
		}
	};
	doLoadData = function() {
		// alert(viewModel.id);
		var tokenId = window.localStorage.getItem("MyTokenId");
		
		var dataToSend = {
			TokenId : tokenId,
			Status : viewModel.id
		};
		var jsonData = JSON.stringify(dataToSend);
		// alert(jsonData);
		return $.ajax({
			url : "http://180.148.138.140/sellerTest2/api/mobile/ListSalesOrderByStatus",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			var result = $.map(data.Data, function(item) {
				// alert("ITEM - BuyerName: " + item.BuyerName + " TotalAmount:" + item.TotalAmount);
				return {
					name : item.BuyerName,
					amount : item.TotalAmount
				};
			});
			// alert(JSON.stringify(result));
			viewModel.dataSource(result);
			// alert(JSON.stringify(viewModel.dataSource()));
			// popupVisible(false);
			//textStatus contains the status: success, error, etc
		}).fail(function(jqxhr, textStatus, error) {
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Get Failed: " + err);
		});

	};
	return viewModel;
};
