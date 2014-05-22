﻿MyApp.upproducts = function(params) {
	var viewModel = {
		dataSource : ko.observableArray(),
		viewShowing : function() {
			doLoadData();
		},
		loadPanelVisible : ko.observable(false),
		searchString : ko.observable(''),
		find : function() {
			viewModel.showSearch(!viewModel.showSearch());
			viewModel.searchString('');
		},
		showSearch : ko.observable(false),
	};
	doLoadData = function() {
		// alert(viewModel.id);
		viewModel.loadPanelVisible(true);
		var tokenId = window.localStorage.getItem("MyTokenId");

		var dataToSend = {
			TokenId : tokenId,
			from : 0,
			to : 30
		};
		var jsonData = JSON.stringify(dataToSend);
		// alert(jsonData);
		return $.ajax({
			url : "http://180.148.138.140/sellerDev2/api/mobile/ListUpProduct",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			var result = $.map(data.Data.Products, function(item) {
				// alert("ITEM - BuyerName: " + item.BuyerName + " TotalAmount:" + item.TotalAmount);
				return {
					id : item.Id,
					name : item.Name,
					storeSku : item.StoreSku,
					quantity : item.Quantity,
					thumnail : item.Thumnail,
					price : item.Price,
					weight : item.Weight,
					stockAvailability : (item.StockAvailability) ? 'OK' : 'Out of stock',
					upProductDate : item.UpProductDate,
				};
			});
			// alert(JSON.stringify(result));
			viewModel.dataSource(result);
			viewModel.loadPanelVisible(false);
			// alert(JSON.stringify(viewModel.dataSource()));
			// popupVisible(false);
			//textStatus contains the status: success, error, etc
		}).fail(function(jqxhr, textStatus, error) {
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Get Failed: " + err);
			viewModel.loadPanelVisible(false);
		});

	};
	
	ko.computed(function() {
		return viewModel.searchString();
	}).extend({
		throttle : 500
	}).subscribe(function() {
		doLoadData();
	});
	return viewModel;
};