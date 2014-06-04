MyApp.home = function(params) {
	var viewModel = {

		viewShowing : function() {
			if (window.localStorage.getItem("MyTokenId") == undefined) {
				MyApp.app.navigate({
					view : "user",
					id : undefined
				}, {
					root : true
				});
			} else {
				// ordersStore.clear();
				doLoadDataByOrderStatus("New");
				doLoadDataByOrderStatus("Delayed");
				doLoadDataByOrderStatus("Processing");
			}
		},

		username : ko.observable(),
		pass : ko.observable(),

		actionSheetVisible : ko.observable(false),
		dropDownMenuData : [{
			text : "Mới",
			clickAction : function() {
				processValueChange("New");
			}
		}, {
			text : "Còn hàng",
			clickAction : function() {
				processValueChange("Processing");
			}
		}, {
			text : "Hết hàng",
			clickAction : function() {
				processValueChange("Cancel");
			}
		}, {
			text : "Hoãn",
			clickAction : function() {
				processValueChange("Delay");
			}
		}, {
			text : "Tách đơn hàng",
			clickAction : function() {
				processValueChange("Split");
			}
		}],
		products : ko.observableArray([]),
		productsToSplit : ko.observableArray([]),
		dataItem : ko.observable(),
		dateBoxValue : ko.observable(new Date()),
		popupDelayVisible : ko.observable(false),
		popupSplitVisible : ko.observable(false),
		loadPanelVisible : ko.observable(false),
	};

	showLoading = function(show) {
		viewModel.loadPanelVisible(show);
	};

	hideSplitPopUp = function() {
		viewModel.loadPanelVisible(false);
		viewModel.popupSplitVisible(false);
	};

	hideDelayPopUp = function() {
		viewModel.loadPanelVisible(false);
		viewModel.popupDelayVisible(false);
	};

	doReloadPivot = function(status) {
		ordersStore.load();
		switch (status) {
			case "New":
				newDataSource.filter("status", status);
				newDataSource.pageIndex(0);
				newDataSource.load();
				break;
			case "Processing":
				processingDataSource.filter("status", status);
				processingDataSource.pageIndex(0);
				processingDataSource.load();
				break;
			case "Delayed":
				delayedDataSource.filter("status", status);
				delayedDataSource.pageIndex(0);
				delayedDataSource.load();
				break;
		}
	};

	doNewOrderByOrderID = function() {
		showLoading(true);
		var tokenId = window.localStorage.getItem("MyTokenId");

		var dataToSend = {
			TokenId : tokenId,
			OrderNumber : viewModel.dataItem().orderNumber,
			Action : "New",
		};
		var jsonData = JSON.stringify(dataToSend);
		return $.ajax({
			url : "http://180.148.138.140/SellerTest2/api/mobile/ProcessOrder",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			showLoading(false);
			var item = viewModel.dataItem();
			var oldStatus = item.status;
			item.status = "New";
			ordersStore.update(item.orderNumber, item);
			doLoadDataByOrderStatus(oldStatus);
			doLoadDataByOrderStatus("New");
		}).fail(function(jqxhr, textStatus, error) {
			showLoading(false);
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Process Failed: " + err);
		});
	};

	doNewOrderByOrderID = function() {
		showLoading(true);
		var tokenId = window.localStorage.getItem("MyTokenId");

		var dataToSend = {
			TokenId : tokenId,
			OrderNumber : viewModel.dataItem().orderNumber,
			Action : "Cancel",
		};
		var jsonData = JSON.stringify(dataToSend);
		return $.ajax({
			url : "http://180.148.138.140/SellerTest2/api/mobile/ProcessOrder",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			showLoading(false);
			var item = viewModel.dataItem();
			var oldStatus = item.status;
			item.status = "Cancel";
			ordersStore.update(item.orderNumber, item);
			doLoadDataByOrderStatus(oldStatus);
		}).fail(function(jqxhr, textStatus, error) {
			showLoading(false);
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Process Failed: " + err);
		});
	};

	doProcessOrderByOrderID = function() {
		showLoading(true);
		var tokenId = window.localStorage.getItem("MyTokenId");

		var dataToSend = {
			TokenId : tokenId,
			OrderNumber : viewModel.dataItem().orderNumber,
			Action : "Processing",
		};
		var jsonData = JSON.stringify(dataToSend);
		return $.ajax({
			url : "http://180.148.138.140/SellerTest2/api/mobile/ProcessOrder",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			showLoading(false);
			var item = viewModel.dataItem();
			var oldStatus = item.status;
			item.status = "Processing";
			ordersStore.update(item.orderNumber, item);
			doLoadDataByOrderStatus(oldStatus);
			doLoadDataByOrderStatus("Processing");
		}).fail(function(jqxhr, textStatus, error) {
			showLoading(false);
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Process Failed: " + err);
		});

	};

	doSplitOrderByOrderID = function() {
		showLoading(true);
		var splitIDs = [];
		for (var i = 0; i < viewModel.productsToSplit().length; i++) {
			var product = {
				Id : viewModel.productsToSplit()[i].id
			};
			splitIDs.push(product);
		}
		var tokenId = window.localStorage.getItem("MyTokenId");
		var dataToSend = {
			TokenId : tokenId,
			OrderNumber : viewModel.dataItem().orderNumber,
			Action : "Split",
			Products : splitIDs
		};
		var jsonData = JSON.stringify(dataToSend);
		return $.ajax({
			url : "http://180.148.138.140/SellerTest2/api/mobile/ProcessOrder",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			hideSplitPopUp();
			doLoadDataByOrderStatus("Splitting");
			//TODO modify local data here
		}).fail(function(jqxhr, textStatus, error) {
			hideSplitPopUp();
			viewModel.popupSplitVisible(false);
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Process Failed: " + err);
		});

	};

	doProcessOrderByOrderID = function() {
		showLoading(true);
		var tokenId = window.localStorage.getItem("MyTokenId");
		var newDelayDate = new Date(viewModel.dateBoxValue());
		var dataToSend = {
			TokenId : tokenId,
			OrderNumber : viewModel.dataItem().orderNumber,
			Action : "Delay",
			DelayDate : Globalize.format(newDelayDate, 'yyyy-MM-dd')
		};
		var jsonData = JSON.stringify(dataToSend);
		// alert(jsonData);
		return $.ajax({
			url : "http://180.148.138.140/SellerTest2/api/mobile/ProcessOrder",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			//TODO modify local data here
			doLoadDataByOrderStatus("Delayed");
			hideDelayPopUp();
		}).fail(function(jqxhr, textStatus, error) {
			hideDelayPopUp();
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Process Failed: " + err);
		});

	};

	ordersStore = new DevExpress.data.LocalStore({
		type : "local",
		name : "OrdersStore",
		key : "orderNumber",
		flushInterval : 1000,
		// immediate : true,
	});

	newDataSource = new DevExpress.data.DataSource({
		store : ordersStore,
		pageSize : 10,
		sort : "orderNumber",
		filter : ["status", "=", "New"]
	});

	processingDataSource = new DevExpress.data.DataSource({
		store : ordersStore,
		pageSize : 10,
		sort : "orderNumber",
		filter : ["status", "=", "Processing"]
	});

	delayedDataSource = new DevExpress.data.DataSource({
		store : ordersStore,
		pageSize : 10,
		sort : "orderNumber",
		filter : ["status", "=", "Delayed"]
	});

	items = [{
		title : "Mới",
		dataName : "New",
		listItems : newDataSource
	}, {
		title : "Đang giao",
		dataName : "Processing",
		listItems : processingDataSource
	}, {
		title : "Đang hoãn",
		dataName : "Delayed",
		listItems : delayedDataSource
	}];

	processValueChange = function(text) {
		switch (text) {
			case "Processing":
				doProcessOrderByOrderID();
				break;
			case "Delay":
				viewModel.popupDelayVisible(true);
				break;
			case "Split":
				viewModel.productsToSplit().length = 0;
				for (var i = 0; i < viewModel.products().length; i++) {
					var product = {
						name : viewModel.products()[i].name,
						id : viewModel.products()[i].id,
						thumbnail : viewModel.products()[i].thumbnail,
						stockAvailability : viewModel.products()[i].stockAvailabilityDisplay
					};
					viewModel.productsToSplit().push(product);
				}

				viewModel.popupSplitVisible(true);
				$("#splitList").dxList('instance').option('dataSource', viewModel.productsToSplit());
				break;
			case "New":
				doNewOrderByOrderID();
				break;
			case "Cancel":
				doCancelOrderByOrderID();
				break;
		}
	};

	doLoadDataByOrderStatus = function(status) {
		// DevExpress.ui.notify("loading data", "info", 1000);
		viewModel.loadPanelVisible(true);
		// alert(viewModel.selectedType());
		var tokenId = window.localStorage.getItem("MyTokenId");
		var timeStamp = window.localStorage.getItem("OrdersTimeStamp" + status);
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
			url : "http://180.148.138.140/SellerTest2/api/mobile/ListSalesOrderByStatus",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			viewModel.loadPanelVisible(false);
			// alert(JSON.stringify(data.Data));
			if (data.Data.length == 0) {
				// DevExpress.ui.notify("loading data from disk for " + status, "info", 1000);
			} else {
				// alert(JSON.stringify(data.Data));
				window.localStorage.setItem("OrdersTimeStamp" + status, data.TimeStamp);
				var result = $.map(data.Data, function(item) {
					// var dateString = item.OrderDate;
					// if (dateString.indexOf("+") == -1)
						// dateString += 'Z';
					// var itemOrderDate = new Date(dateString);
					var itemOrderDate = convertDate(item.OrderDate);
					var orderDateString = Globalize.format(itemOrderDate, 'dd/MM/yyyy');
					
					// dateString = item.DelayDate;
					// if (dateString.indexOf("+") == -1)
						// dateString += 'Z';
					// var itemDelayDate = new Date(dateString);
					var itemDelayDate = convertDate(item.DelayDate);
					
					
					var delayDateString = Globalize.format(itemDelayDate, 'dd/MM/yyyy');
					var itemProducts = $.map(item.Products, function(product) {
						return {
							id : product.Id,
							name : product.Name,
							storeSku : product.StoreSku,
							quantity : product.Quantity,
							thumbnail : product.Thumnail,
							price : product.Price,
							weight : product.Weight,
							upProductDate : product.UpProductDate + 'Z',
							updatedDate : product.UpdatedDate + 'Z',
						};
					});
					return {
						status : status,
						orderNumber : item.OrderNumber,
						orderDate : itemOrderDate,
						delayDate : itemDelayDate,
						paymentMethod : item.PaymentMethod,
						shippingMethod : item.ShippingMethod,
						orderDateDisplay : orderDateString,
						delayDateDisplay : delayDateString,
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
						products : itemProducts,
					};
				});

				// listDataSource.store().clear();
				for (var i = 0; i < result.length; i++) {
					ordersStore.byKey(result[i].orderNumber).done(function(dataItem) {
						if (dataItem != undefined)
							ordersStore.update(result[i].orderNumber, result[i]).fail(function(error) {
								alert(error);
							});
						else
							ordersStore.insert(result[i]).fail(function(error) {
								alert("insert: " + error);
							});
					});
					// alert(JSON.stringify(result[i]));
				}
			}
			//textStatus contains the status: success, error, etc
			doReloadPivot(status);
		}).fail(function(jqxhr, textStatus, error) {
			viewModel.loadPanelVisible(false);
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Get Failed: " + err);
		});

	};

	showDetail = function(orderNumber) {
		MyApp.app.navigate({
			view : 'order-details',
			id : orderNumber
		});
	};

	showActionSheet = function(orderNumber) {
		viewModel.actionSheetVisible(true);
		ordersStore.byKey(orderNumber).done(function(dataItem) {
			viewModel.dataItem(dataItem);
			viewModel.products(dataItem.products);
			viewModel.dropDownMenuData[1].disabled(!dataItem.canProcess);
			viewModel.dropDownMenuData[2].disabled(!dataItem.canDelay);
			viewModel.dropDownMenuData[3].disabled(!dataItem.canSplit);
		});
	};

	return viewModel;
};
