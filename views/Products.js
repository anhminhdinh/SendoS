MyApp.products = function(params) {
	var viewModel = {
		// dataSource : ko.observableArray(),
		viewShowing : function() {
			doLoadData();
		},
		loadPanelVisible : ko.observable(false),
		searchString : ko.observable(''),
		find : function() {
			viewModel.showSearch(!viewModel.showSearch());
			viewModel.searchString('');
			if (viewModel.showSearch())
				$('#searchBox').dxTextBox('instance').focus();

		},
		showSearch : ko.observable(false),
		rowClick : function(e, itemData) {
			MyApp.app.navigate({
				view : 'product-details',
				id : itemData.id
			});
		}
	};

	changeStockStatus = function(e, itemData) {
		e.jQueryEvent.stopPropagation();
		if (confirm("Bạn có chắc muốn chuyển trạng thái còn/hết hàng?")) {
			viewModel.loadPanelVisible(true);
			// alert(viewModel.id);
			var tokenId = window.localStorage.getItem("MyTokenId");
			// alert(itemData.stockAvailability());
			var dataToSend = {
				TokenId : tokenId,
				Id : itemData.id,
				StockAvailability : itemData.stockAvailability(),
			};
			var jsonData = JSON.stringify(dataToSend);
			// alert(jsonData);
			return $.ajax({
				url : "http://180.148.138.140/sellerDev2/api/mobile/UpdateProductStock",
				type : "POST",
				data : jsonData,
				contentType : "application/json; charset=utf-8",
				dataType : "json"
			}).done(function(data, textStatus) {
				viewModel.loadPanelVisible(false);
				// doLoadDataByProductID();
				//textStatus contains the status: success, error, etc
			}).fail(function(jqxhr, textStatus, error) {
				viewModel.loadPanelVisible(false);
				var err = textStatus + ", " + jqxhr.responseText;
				alert("Get Failed: " + err);
			});
		}
	};

	var arrayStore = new DevExpress.data.ArrayStore({
		key : "id",
		data : []
	});
	listDataSource = new DevExpress.data.DataSource({
		store : arrayStore,
		pageSize : 10
	});

	doLoadData = function(actionOptions) {
		// alert(viewModel.id);
		viewModel.loadPanelVisible(true);
		var tokenId = window.localStorage.getItem("MyTokenId");

		var dataToSend = {
			TokenId : tokenId,
			Name : viewModel.searchString(),
			From : 0,
			To : 100
		};
		var jsonData = JSON.stringify(dataToSend);
		// alert(jsonData);
		return $.ajax({
			url : "http://180.148.138.140/sellerDev2/api/mobile/SearchProductByName",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			// alert(JSON.stringify(data));
			var result = $.map(data.Data, function(item) {
				// alert(JSON.stringify(item));
				return {
					id : item.Id,
					name : item.Name,
					thumnail : item.Thumnail,
					price : item.Price,
					stockAvailability : ko.observable(item.StockAvailability),
					// stockAvailability : item.StockAvailability,
				};
			});
			arrayStore.clear();
			for (var i = 0; i < result.length; i++) {
				arrayStore.insert(result[i]);
				// alert(JSON.stringify(result[i]));
			}
			listDataSource.pageIndex(0);
			listDataSource.load();

			// alert(JSON.stringify(result));
			// viewModel.dataSource(result);
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

	ko.computed(function() {
		return viewModel.searchString();
	}).extend({
		throttle : 500
	}).subscribe(function() {
		doLoadData();
	});
	return viewModel;
};
