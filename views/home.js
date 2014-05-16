MyApp.home = function(params) {
	var viewModel = {

		viewShowing : function() {
			doLoadData();
		},

		username : ko.observable(),
		pass : ko.observable(),
		loadPanelVisible : ko.observable(false),
	};

	doLoadData = function() {
		// DevExpress.ui.notify("loading data", "info", 1000);
		viewModel.loadPanelVisible(true);
		var tokenId = window.localStorage.getItem("MyTokenId");
		var dataToSend = {
			TokenId : tokenId
		};
		var jsonData = JSON.stringify(dataToSend);
		// alert(jsonData);
		return $.ajax({
			url : "http://180.148.138.140/sellerDev2/api/mobile/ListSalesOrder",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			viewModel.loadPanelVisible(false);
			var result = $.map(data.Data, function(item) {
				var display = "Mới";
				switch (item.Status) {
					case "Delayed":
						display = "Đã hoãn";
						break;
					case "Processing":
						display = "Chờ giao hàng";
						break;
					case "Splitting":
						display = "Chờ tách";
						break;
				}
				doLoadDataByOrder(item.Status);
				return {
					statusDisplay : display,
					status : item.Status,
					count : item.Count
				};
			});
			// MyApp.app.navigation[0].option('title', 'Đơn hàng (' + count + ')');
			// textStatus contains the status: success, error, etc
		}).fail(function(jqxhr, textStatus, error) {
			viewModel.loadPanelVisible(false);
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Get Failed: " + err);
		});

	};

	listDataStore = new DevExpress.data.LocalStore({
		type : "local",
		name : "OrdersStore",
		key : "orderNumber",
		flushInterval : 1000,
		// immediate : true,
	});
	items = [{
		title : "Mới",
		dataName : "New",
		listItems : new DevExpress.data.DataSource({
			store : listDataStore,
			sort : "orderNumber",
			filter : ["status", "=", "New"]
		})
	}, {
		title : "Đang giao",
		dataName : "Processing",
		listItems : new DevExpress.data.DataSource({
			store : listDataStore,
			sort : "orderNumber",
			filter : ["status", "=", "Processing"]
		})
	}, {
		title : "Đang hoãn",
		dataName : "Delayed",
		listItems : new DevExpress.data.DataSource({
			store : listDataStore,
			sort : "orderNumber",
			filter : ["status", "=", "Delayed"]
		})
	}, {
		title : "Chờ tách",
		dataName : "Splitting",
		listItems : new DevExpress.data.DataSource({
			store : listDataStore,
			sort : "orderNumber",
			filter : ["status", "=", "Splitting"]
		})
	}];
	listDataSource = new DevExpress.data.DataSource({
		store : listDataStore,
		pageSize : 10
	});

	doLoadDataByOrder = function(status) {

		// DevExpress.ui.notify("loading data", "info", 1000);
		viewModel.loadPanelVisible(true);
		// alert(viewModel.selectedType());
		var tokenId = window.localStorage.getItem("MyTokenId");
		var timeStamp = window.localStorage.getItem("OrdersTimeStamp");
		if (timeStamp == undefined)
			timeStamp = 0;
		var dataToSend = {
			TokenId : tokenId,
			Status : status,
			// Status : viewModel.selectedType(),
			TimeStamp : 0
		};
		var jsonData = JSON.stringify(dataToSend);
		// alert(jsonData);
		return $.ajax({
			url : "http://180.148.138.140/sellerDev2/api/mobile/ListSalesOrderByStatus",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			viewModel.loadPanelVisible(false);
			// alert(JSON.stringify(data.Data));
			if (data.Data.length == 0) {
				DevExpress.ui.notify("loading data from disk", "info", 1000);
			} else {
				// alert(JSON.stringify(data.Data));
				window.localStorage.setItem("OrdersTimeStamp", data.TimeStamp);
				var result = $.map(data.Data, function(item) {
					var itemOrderDate = new Date(item.OrderDate + 'Z');
					var orderDateString = Globalize.format(itemOrderDate, 'dd/MM/yyyy');
					var itemDelayDate = new Date(item.DelayDate + 'Z');
					var delayDateString = Globalize.format(itemDelayDate, 'dd/MM/yyyy');
					var products = $.map(data.Data.Products, function(product) {
						return {
							id:product.Id,
							name:product.Name,
							storeSku:product.StoreSku,
							quantity:product.Quantity,
							thumbnail:product.Thumnail,
							price:product.Price,
							weight:product.Weight,
							stockAvailability:product.StockAvailability,
							upProductDate:product.UpProductDate + 'Z',
							updatedDate:product.UpdatedDate + 'Z',
						};
					});
					return {
						status : status,
						orderNumber : item.OrderNumber,
						date : orderDateString,
						dalayDate : delayDateString,
						buyerName : item.BuyerName,
						buyerAddress : item.BuyerAddress,
						buyerPhone : item.BuyerPhone,
						note : item.Note,
						totalAmount : item.TotalAmount,
						updatedDate : item.UpdatedDate,
						canDelay : item.CanDelay,
						canCancel : item.CanCancel,
						canSplit : item.CanSplit,
						canProcess : item.CanProcess,
						products : products,
					};
				});

				// listDataSource.store().clear();
				for (var i = 0; i < result.length; i++) {
					listDataStore.byKey(result[i].orderNumber).done(function(dataItem) {
						if (dataItem != undefined)
							listDataStore.update(result[i].orderNumber, result[i]).fail(function(error) {
								alert(error);
							});
						else
							listDataStore.insert(result[i]).fail(function(error) {
								alert("insert: " + error);
							});
					});
					// alert(JSON.stringify(result[i]));
				}
				// alert(JSON.stringify(result));
				// listDataSource.filter("status", "=", viewModel.selectedType());
				// listDataSource.pageIndex(0);
				// listDataSource.load();

				// listDataStore.totalCount().done(function(count) {
				// MyApp.app.navigation[0].option('title', 'Đơn hàng (' + count + ')');
				// // DevExpress.ui.notify("total count " + count, "info", 1000);
				// });

				// var toastShown = window.localStorage.getItem("ToastShown");
				// if (toastShown == null) {
				// DevExpress.ui.notify('Chọn loại đơn hàng tại menu: Loại', 'info', 3000);
				// window.localStorage.setItem("ToastShown", true);
				// }

				// alert(JSON.stringify(listDataSource.store()));
				// viewModel.dataSource(result);
			}
			//textStatus contains the status: success, error, etc
		}).fail(function(jqxhr, textStatus, error) {
			viewModel.loadPanelVisible(false);
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Get Failed: " + err);
		});

	};

	return viewModel;
};
