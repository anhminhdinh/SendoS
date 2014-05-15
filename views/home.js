MyApp.home = function(params) {
	var viewModel = {
		dataArray : ko.observableArray([{
			status : "New",
			count : 0
		}, {
			status : "Delayed",
			count : 0
		}, {
			status : "Processing",
			count : 0
		}, {
			status : "Splitting",
			count : 0
		}]),
		// selectedType : ko.observable(''),
		// dataSource : ko.observableArray(),
		viewShowing : function() {
			doLoadData();
		},
		processValueChange : function() {
			doLoadDataByOrder();
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
			var count = 0;
			// var statusArray = [];
			for (var i = 0; i < result.length; i++) {
				count += result[i].count;
				// statusArray.push(result[i].status);
			}
			MyApp.app.navigation[0].option('title', 'Đơn hàng (' + count + ')');
			// window.localStorage.setItem("OrderStatus", JSON.stringify(statusArray));
			// alert(JSON.stringify(result));
			viewModel.dataArray(result);
			// viewModel.selectedType(result[0].status);
			// alert(JSON.stringify(viewModel.dataArray()));
			// doLoadDataByOrder();
			// alert(JSON.stringify(MyApp.app.navigation()));
			//textStatus contains the status: success, error, etc
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
		listItems : new DevExpress.data.DataSource({
			store : listDataStore,
			sort : "orderNumber",
			filter : ["status", "=", "New"]
		})
	}, {
		title : "Đang giao",
		listItems : new DevExpress.data.DataSource({
			store : listDataStore,
			sort : "orderNumber",
			filter : ["status", "=", "Processing"]
		})
	}, {
		title : "Đang hoãn",
		listItems : new DevExpress.data.DataSource({
			store : listDataStore,
			sort : "orderNumber",
			filter : ["status", "=", "Delayed"]
		})
	}, {
		title : "Chờ tách",
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

	// checkDataSize = function() {
	// listDataSource.store().totalCount().done(function(count) {
	// DevExpress.ui.notify("total count " + count, "info", 1000);
	// });
	// };

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
			TimeStamp : timeStamp
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
				// listDataSource.store().totalCount().done(function(count) {
				// if (count > 0) {
				DevExpress.ui.notify("loading data from disk", "info", 1000);
				// listDataSource.store().load();
				// listDataSource.pageIndex(0);
				// listDataSource.load();
				// }
				// });
			} else {
				window.localStorage.setItem("OrdersTimeStamp", data.TimeStamp);
				var result = $.map(data.Data, function(item) {
					// alert("ITEM - orderNumber: " + item.OrderNumber + " TotalAmount:" + item.TotalAmount);
					var itemOrderDate = new Date(item.OrderDate);
					var dateString = Globalize.format(itemOrderDate, 'dd/MM/yyyy'); 
					// itemOrderDate.format("dd mm, yy");
					// alert(itemOrderDate.toString());
					return {
						status : status,
						orderNumber : item.OrderNumber,
						totalAmount : item.TotalAmount,
						date : dateString
					};
				});

				// listDataSource.store().clear();
				for (var i = 0; i < result.length; i++) {
					// viewModel.listDataSource.store().byKey(result[i].orderNumber).done(function(dataItem) {
					// if (dataItem != undefined)
					// listDataSource.store().update(result[i].orderNumber, result[i]).fail(function(error) {
					// alert(error);
					// });
					// else
					// listDataSource.store().insert(result[i]).fail(function(error) {
					// alert("insert: " + error);
					// });
					// });
					//
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
				listDataSource.filter("status", "=", viewModel.selectedType());
				listDataSource.pageIndex(0);
				listDataSource.load();

				listDataSource.store().totalCount().done(function(count) {
					DevExpress.ui.notify("total count " + count, "info", 1000);
				});

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
