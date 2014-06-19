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
				refresh();
			}
		},
		viewShown : function() {
			var isAndroid = DevExpress.devices.real().platform === 'android';
			var obj = null;
			obj = $("#listNew");
			var list = obj.dxList("instance");
			// list.option('autoPagingEnabled', !isAndroid);
			list.option('showNextButton', isAndroid);
			list.option('pullRefreshEnabled', !isAndroid);
			loadImages();
		},
		selectNewTab : function(input) {
			var isAndroid = DevExpress.devices.real().platform === 'android';
			var obj = null;
			switch (input.selectedIndex) {
				case 0:
					obj = $("#listNew");
					break;
				case 1:
					obj = $("#listProcessing");
					break;
				case 2:
					obj = $("#listDelayed");
					break;
			}
			var list = obj.dxList("instance");
			list.option('showNextButton', isAndroid);
			list.option('pullRefreshEnabled', !isAndroid);
			// list.option('autoPagingEnabled', !isAndroid);
		},
		username : ko.observable(),
		pass : ko.observable(),

		actionSheetVisible : ko.observable(false),
		dropDownMenuData : [{
			text : "Còn hàng",
			clickAction : function() {
				processValueChange("Processing");
			},
			disabled : ko.observable(true),
		}, {
			text : "Hoãn",
			clickAction : function() {
				processValueChange("Delay");
			},
			disabled : ko.observable(true),
		}, {
			text : "Tách đơn hàng",
			clickAction : function() {
				processValueChange("Split");
			},
			disabled : ko.observable(true),
		}, {
			text : "Hết hàng",
			clickAction : function() {
				processValueChange("Cancel");
			},
			disabled : ko.observable(true),
		}, {
			text : "Xem chi tiết",
			clickAction : function() {
				processValueChange("Details");
			},
			// disabled : ko.observable(false),
		}],
		products : ko.observableArray([]),
		productsToSplit : ko.observableArray([]),
		dataItem : ko.observable(),
		dateBoxValue : ko.observable(new Date()),
		popupDelayVisible : ko.observable(false),
		popupSplitVisible : ko.observable(false),
		loadPanelVisible : ko.observable(false),
		showActionSheet : function(e) {
			var orderNumber = e.model.orderNumber;
			ordersStore.byKey(orderNumber).done(function(dataItem) {
				var idOrderNumber = "#" + orderNumber;
				var actionSheet = $("#actionsheet").dxActionSheet("instance");
				actionSheet.option('target', idOrderNumber);
				viewModel.dataItem(dataItem);
				viewModel.products(dataItem.products);
				viewModel.dropDownMenuData[0].disabled(!dataItem.canProcess);
				viewModel.dropDownMenuData[1].disabled(!dataItem.canDelay);
				viewModel.dropDownMenuData[2].disabled(!dataItem.canSplit);
				viewModel.dropDownMenuData[3].disabled(!dataItem.canCancel);
				viewModel.actionSheetVisible(true);
			});
			e.jQueryEvent.stopPropagation();
		},
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

	doCancelOrderByOrderID = function() {
		showLoading(true);
		var tokenId = window.localStorage.getItem("MyTokenId");

		var dataToSend = {
			TokenId : tokenId,
			OrderNumber : viewModel.dataItem().orderNumber,
			Action : "Cancel",
		};
		var jsonData = JSON.stringify(dataToSend);
		return $.ajax({
			url : "http://ban.sendo.vn/api/mobile/ProcessOrder",
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
			doLoadDataByOrderStatus(oancelldStatus);
			doLoadDataByOrderStatus("Cancel");
		}).fail(function(jqxhr, textStatus, error) {
			showLoading(false);
			alert("Lỗi mạng, thử lại sau!");
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
			url : "http://ban.sendo.vn/api/mobile/ProcessOrder",
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
			alert("Lỗi mạng, thử lại sau!");
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
			url : "http://ban.sendo.vn/api/mobile/ProcessOrder",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			hideSplitPopUp();
			var item = viewModel.dataItem();
			var oldStatus = item.status;
			item.status = "Splitting";
			ordersStore.update(item.orderNumber, item);
			doLoadDataByOrderStatus(oldStatus);
			doLoadDataByOrderStatus("Splitting");
			//TODO modify local data here
		}).fail(function(jqxhr, textStatus, error) {
			hideSplitPopUp();
			viewModel.popupSplitVisible(false);
			alert("Lỗi mạng, thử lại sau!");
		});

	};

	doDelayOrderByOrderID = function() {
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
			url : "http://ban.sendo.vn/api/mobile/ProcessOrder",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			var item = viewModel.dataItem();
			var oldStatus = item.status;
			item.status = "Delayed";
			ordersStore.update(item.orderNumber, item);
			doLoadDataByOrderStatus(oldStatus);
			doLoadDataByOrderStatus("Delayed");
			hideDelayPopUp();
		}).fail(function(jqxhr, textStatus, error) {
			hideDelayPopUp();
			alert("Lỗi mạng, thử lại sau!");
		});

	};

	var myUserName = window.localStorage.getItem("UserName");

	ordersStore = new DevExpress.data.LocalStore({
		type : "local",
		name : myUserName + "OrdersStore",
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
			case "Details":
				showDetail();
				break;
		}
	};

	doLoadDataByOrderStatus = function(status) {
		// DevExpress.ui.notify("loading data", "info", 1000);
		viewModel.loadPanelVisible(true);
		// alert(viewModel.selectedType());
		var tokenId = window.localStorage.getItem("MyTokenId");
		var myUserName = window.localStorage.getItem("UserName");
		var timeStamp = Number(window.localStorage.getItem(myUserName + "OrdersTimeStamp" + status));
		if (timeStamp === null)
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
			url : "http://ban.sendo.vn/api/mobile/ListSalesOrderByStatus",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			viewModel.loadPanelVisible(false);
			// alert(JSON.stringify(data.Data));
			if ((data.Data != null) && (data.Data.length == 0)) {
				// DevExpress.ui.notify("loading data from disk for " + status, "info", 1000);
			} else {
				// alert(JSON.stringify(data.Data));
				window.localStorage.setItem(myUserName + "OrdersTimeStamp" + status, data.TimeStamp);
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
						var price = numberWithCommas(product.Price);
						return {
							id : product.Id,
							name : product.Name,
							storeSku : product.StoreSku,
							quantity : product.Quantity,
							thumbnail : product.Thumnail,
							price : price,
							weight : product.Weight,
							upProductDate : product.UpProductDate + 'Z',
							updatedDate : product.UpdatedDate + 'Z',
							description : product.Description,
						};
					});
					var totalAmount = numberWithCommas(item.TotalAmount);
					return {
						status : status,
						orderNumber : item.OrderNumber,
						orderDate : itemOrderDate,
						delayDate : itemDelayDate,
						paymentMethod : item.PaymentMethod,
						shippingMethod : item.ShippingType,
						orderDateDisplay : orderDateString,
						delayDateDisplay : delayDateString,
						buyerName : item.BuyerName,
						buyerAddress : item.BuyerAddress,
						buyerPhone : item.BuyerPhone,
						note : item.Note,
						totalAmount : totalAmount,
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
			alert("Lỗi mạng, thử lại sau!");
		});

	};

	showDetailsData = function(e) {
		MyApp.app.navigate({
			view : 'order-details',
			id : e.itemData.orderNumber
		});
	};

	showDetail = function() {
		MyApp.app.navigate({
			view : 'order-details',
			id : viewModel.dataItem().orderNumber
		});
	};

	refresh = function() {
		doLoadDataByOrderStatus("New");
		doLoadDataByOrderStatus("Delayed");
		doLoadDataByOrderStatus("Processing");
	};

	loadImages = function() {
		jQuery("img.product-thumbnail.lazy").lazy({
			effect : "fadeIn",
			effectTime : 1500
		});
	};
	return viewModel;
};
