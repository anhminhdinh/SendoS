MyApp['order-details'] = function(params) {

	var viewModel = {
		title : ko.observable('Orders'),
		dropDownMenuData : [{
			text : "Còn hàng",
			clickAction : function() {
				processValueChange("Processing");
			},
			disabled : ko.observable(true),
		}, {
			text : "Hoãn đơn hàng",
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
		}],
		viewShown : function(e) {
			this.title("Đơn hàng " + this.id);
			listDataStore.byKey(this.id).done(function(dataItem) {
				viewModel.totalAmount(dataItem.totalAmount);
				viewModel.orderNumber(dataItem.orderNumber);
				viewModel.buyerName(dataItem.buyerName);
				viewModel.buyerAddress(dataItem.buyerAddress);
				viewModel.buyerPhone(dataItem.buyerPhone);
				viewModel.orderDate(dataItem.orderDate);
				viewModel.delayDate(dataItem.delayDate);
				viewModel.updatedDate(dataItem.updatedDate);
				viewModel.orderDateDisplay(dataItem.orderDateDisplay);
				viewModel.delayDateDisplay(dataItem.delayDateDisplay);
				viewModel.paymentMethod = dataItem.paymentMethod === 2 ? 'Senpay' : 'COD';
				viewModel.shippingMethod(dataItem.shippingMethod);
				switch (dataItem.status) {
					case "New":
						viewModel.orderStatus("Mới");
						break;
					case "Processing":
						viewModel.orderStatus("Đang giao hàng");
						break;
					case "Delayed":
						viewModel.orderStatus("Đang hoãn");
						break;
				}

				viewModel.note(dataItem.note);
				if ((dataItem.note === null) || (dataItem.note === undefined) || (dataItem.note === '')) {
					$("#noteField").hide();
				}
				viewModel.products(dataItem.products);
				viewModel.canDelay(dataItem.canDelay);
				viewModel.canCancel(dataItem.canCancel);
				viewModel.canSplit(dataItem.canSplit);
				viewModel.canProcess(dataItem.canProcess);
				if (viewModel.orderStatus != "Delayed") {
					$("#delayField").hide();
				}
				viewModel.dataItem(dataItem);
				viewModel.loadPanelVisible(false);
			}).fail(function(error) {
				alert(JSON.stringify(error));
				viewModel.loadPanelVisible(false);
			});
		},
		id : params.id,
		dataItem : ko.observable(),
		orderNumber : ko.observable(''),
		totalAmount : ko.observable(0),
		buyerName : ko.observable('Minh'),
		buyerAddress : ko.observable('HCM'),
		buyerPhone : ko.observable(''),
		orderDate : ko.observable(),
		delayDate : ko.observable(),
		orderDateDisplay : ko.observable(''),
		delayDateDisplay : ko.observable(''),
		orderStatus : ko.observable(false),
		paymentMethod : ko.observable(''),
		shippingMethod : ko.observable(''),
		canDelay : ko.observable(false),
		canCancel : ko.observable(false),
		canSplit : ko.observable(false),
		canProcess : ko.observable(false),
		updatedDate : ko.observable(),
		note : ko.observable(''),
		products : ko.observableArray([]),
		productsToSplit : ko.observableArray([]),
		disabled : ko.observable(false),
		selectedType : ko.observable(''),
		actionSheetVisible : ko.observable(false),
		showActionSheet : function() {
			viewModel.dropDownMenuData[0].disabled(!viewModel.dataItem().canProcess);
			viewModel.dropDownMenuData[1].disabled(!viewModel.dataItem().canDelay);
			viewModel.dropDownMenuData[2].disabled(!viewModel.dataItem().canSplit);
			viewModel.dropDownMenuData[3].disabled(!viewModel.dataItem().canCancel);
			viewModel.actionSheetVisible(true);
		},
		dateBoxValue : ko.observable(new Date()),
		popupDelayVisible : ko.observable(false),
		popupSplitVisible : ko.observable(false),
		loadPanelVisible : ko.observable(true),
	};

	listDataStore = new DevExpress.data.LocalStore({
		type : "local",
		name : "OrdersStore",
		key : "orderNumber",
		flushInterval : 1000,
		// immediate : true,
	});

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

	processValueChange = function(text) {
		switch (text) {
			case "Processing":
				doSwitchProcessOrderByOrderID();
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

	doLoadDataByOrderID = function() {
		showLoading(true);
		var tokenId = window.localStorage.getItem("MyTokenId");

		var dataToSend = {
			TokenId : tokenId,
			OrderNumber : viewModel.id
		};
		var jsonData = JSON.stringify(dataToSend);
		return $.ajax({
			url : "http://180.148.138.140/SellerTest2/api/mobile/SalesOrderInfoByOrderNumber",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			showLoading(false);
			viewModel.orderNumber(data.Data.OrderNumber);
			viewModel.totalAmount(data.Data.TotalAmount);
			viewModel.buyerName(data.Data.BuyerName);
			viewModel.buyerAddress(data.Data.BuyerAddress);
			viewModel.buyerPhone(data.Data.BuyerPhone);

			// var dateString = data.Data.OrderDate;
			// if (dateString.indexOf("+") == -1)
			// dateString += 'Z';
			// var OrderDate = new Date(dateString);
			var OrderDate = convertDate(data.Data.OrderDate);
			viewModel.orderDate(Globalize.format(OrderDate, 'dd-MM, yyyy'));

			// var dateString = data.Data.DelayDate;
			// if (dateString.indexOf("+") == -1)
			// dateString += 'Z';
			// var DelayDate = new Date(dateString);
			var DelayDate = convertDate(data.Data.DelayDate);
			viewModel.delayDate(Globalize.format(DelayDate, 'dd-MM, yyyy'));
			var display = "Mới";
			switch (data.Data.OrderStatus) {
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
			if (data.Data.OrderStatus != "Delayed") {
				$("#delayField").hide();
			}
			viewModel.orderStatus(display);
			viewModel.note('LƯU Ý: ' + data.Data.Note);
			var result = $.map(data.Data.Products, function(item) {
				return {
					id : item.Id,
					name : item.Name,
					storeSku : item.StoreSku,
					quantity : item.Quantity,
					thumnail : item.Thumnail,
					price : item.Price,
					weight : item.Weight,
					upProductDate : new Date(item.UpProductDate),
				};
			});
			viewModel.products(result);
		}).fail(function(jqxhr, textStatus, error) {
			showLoading(false);
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Get Failed: " + err);
		});

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
			viewModel.dataItem().status = "New";
			listDataStore.update(viewModel.dataItem().orderNumber, viewModel.dataItem());
			MyApp.app.back();
		}).fail(function(jqxhr, textStatus, error) {
			showLoading(false);
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Process Failed: " + err);
		});
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
			url : "http://180.148.138.140/SellerTest2/api/mobile/ProcessOrder",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			showLoading(false);
			viewModel.dataItem().status = "Cancel";
			listDataStore.update(viewModel.dataItem().orderNumber, viewModel.dataItem());
			MyApp.app.back();
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
			viewModel.dataItem().status = "Processing";
			listDataStore.update(viewModel.dataItem().orderNumber, viewModel.dataItem());
			MyApp.app.back();
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
			OrderNumber : viewModel.id,
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
			MyApp.app.back();
			//TODO modify local data here
		}).fail(function(jqxhr, textStatus, error) {
			hideSplitPopUp();
			viewModel.popupSplitVisible(false);
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Process Failed: " + err);
		});

	};

	doDelayOrderByOrderID = function() {
		showLoading(true);
		var tokenId = window.localStorage.getItem("MyTokenId");
		var newDelayDate = new Date(viewModel.dateBoxValue());
		var dataToSend = {
			TokenId : tokenId,
			OrderNumber : viewModel.id,
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
			hideDelayPopUp();
			MyApp.app.back();
		}).fail(function(jqxhr, textStatus, error) {
			hideDelayPopUp();
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Process Failed: " + err);
		});

	};

	function load(img) {
		img.fadeOut(0, function() {
			img.fadeIn(1000);
		});
	};
	$('.lazyload').lazyload({
		load : load
	});

	return viewModel;
};
