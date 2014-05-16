MyApp['order-details'] = function(params) {

	var viewModel = {
		title : ko.observable('Orders'),
		// dropDownMenuData : ko.observableArray(),
		dropDownMenuData : [{
			text : "Mới",
			clickAction : function() {
				processValueChange("New");
			}
		}, {
			text : "Chờ giao hàng ",
			clickAction : function() {
				processValueChange("Processing");
			}
		}, {
			text : "Hoãn",
			clickAction : function() {
				processValueChange("Delay");
			}
		}, {
			text : "Tách",
			clickAction : function() {
				processValueChange("Split");
			}
		}],
		viewShown : function(e) {
			this.title("Đơn hàng " + this.id);
			// var orderStatus = window.localStorage.getItem("OrderStatus");
			// var array = JSON.parse(orderStatus);
			// this.dropDownMenuData(array);
			// alert(orderStatus);
			doLoadDataByOrderID();
		},
		id : params.id,
		orderNumber : ko.observable(0),
		totalAmount : ko.observable(0),
		buyerName : ko.observable('Minh'),
		buyerAddress : ko.observable('HCM'),
		buyerPhone : ko.observable(''),
		orderDate : ko.observable(),
		delayDate : ko.observable(),
		orderStatus : ko.observable(false),
		note : ko.observable(''),
		products : ko.observableArray([]),
		productsToSplit : ko.observableArray([]),
		disabled : ko.observable(false),
		selectedType : ko.observable(''),
		actionSheetVisible : ko.observable(false),
		showActionSheet : function() {
			this.actionSheetVisible(true);
		},
		dateBoxValue : ko.observable(new Date()),
		popupDelayVisible : ko.observable(false),
		popupSplitVisible : ko.observable(false),
		loadPanelVisible : ko.observable(true),

		hideDelayPopup : function() {
			this.popupDelayVisible(false);
		},

		hideSplitPopup : function() {
			this.popupSplitVisible(false);
		}
	};
	processValueChange = function(text) {
		// DevExpress.ui.notify("The widget value has been changed to " + text, "info", 1000);
		switch (text) {
			case "Processing":
				doSwitchProcessOrderByOrderID();
				break;
			case "Delay":
				viewModel.popupDelayVisible(true);
				break;
			case "Split":
				// alert(this.popupSplitVisible());
				viewModel.productsToSplit().length = 0;
				for (var i = 0; i < viewModel.products().length; i++) {
					var product = {
						name : viewModel.products()[i].name,
						id : viewModel.products()[i].id,
						thumbnail : viewModel.products()[i].thumnail,
						stockAvailability : viewModel.products()[i].stockAvailability
					};
					viewModel.productsToSplit().push(product);
				}

				viewModel.popupSplitVisible(true);
				$("#splitList").dxList('instance').option('dataSource', viewModel.productsToSplit());
				// alert(JSON.stringify(this.productsToSplit()));
				break;
			case "New":
				doSwitchNewOrderByOrderID();
				break;
		}
		// MyApp.app.back();
	};
	doLoadDataByOrderID = function() {
		viewModel.loadPanelVisible(true);
		// alert(viewModel.id);
		var tokenId = window.localStorage.getItem("MyTokenId");

		var dataToSend = {
			TokenId : tokenId,
			OrderNumber : viewModel.id
		};
		var jsonData = JSON.stringify(dataToSend);
		// alert(jsonData);
		return $.ajax({
			url : "http://180.148.138.140/sellerDev2/api/mobile/SalesOrderInfoByOrderNumber",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			// alert(JSON.stringify(data));
			viewModel.loadPanelVisible(false);
			viewModel.orderNumber(data.Data.OrderNumber);
			viewModel.totalAmount(data.Data.TotalAmount);
			// alert(data.Data.BuyerName);
			viewModel.buyerName(data.Data.BuyerName);
			viewModel.buyerAddress(data.Data.BuyerAddress);
			viewModel.buyerPhone(data.Data.BuyerPhone);
			var OrderDate = new Date(data.Data.OrderDate + 'Z');
			viewModel.orderDate(Globalize.format(OrderDate, 'dd-MM, yyyy'));
			var DelayDate = new Date(data.Data.DelayDate + 'Z');
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
			// viewModel.disabled(data.Data.OrderStatus != "New");
			// alert(viewModel.editable());
			// viewModel.selectedType(data.Data.OrderStatus);
			viewModel.note('LƯU Ý: ' + data.Data.Note);
			// alert(JSON.stringify(data.Data.Products));
			var result = $.map(data.Data.Products, function(item) {
				return {
					id : item.Id,
					name : item.Name,
					storeSku : item.StoreSku,
					quantity : item.Quantity,
					thumnail : item.Thumnail,
					price : item.Price,
					weight : item.Weight,
					stockAvailability : (item.StockAvailability) ? 'Còn hàng' : 'Hết hàng',
					upProductDate : new Date(item.UpProductDate),
				};
			});
			// alert(JSON.stringify(result));
			viewModel.products(result);
			// alert(JSON.stringify(viewModel.productsToSplit()));
			// alert(JSON.stringify(data));
			//textStatus contains the status: success, error, etc
		}).fail(function(jqxhr, textStatus, error) {
			viewModel.loadPanelVisible(false);
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Get Failed: " + err);
		});

	};

	doSwitchNewOrderByOrderID = function() {
		viewModel.loadPanelVisible(true);
		// alert(viewModel.id);
		var tokenId = window.localStorage.getItem("MyTokenId");

		var dataToSend = {
			TokenId : tokenId,
			OrderNumber : viewModel.id,
			Action : "New",
		};
		var jsonData = JSON.stringify(dataToSend);
		// alert(jsonData);
		return $.ajax({
			url : "http://180.148.138.140/sellerDev2/api/mobile/ProcessOrder",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			// alert(JSON.stringify(data));
			viewModel.loadPanelVisible(false);
			// DevExpress.ui.notify("Processed Order", "info", 1000);
			MyApp.app.back();
		}).fail(function(jqxhr, textStatus, error) {
			viewModel.loadPanelVisible(false);
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Process Failed: " + err);
		});

	};

	doSwitchProcessOrderByOrderID = function() {
		viewModel.loadPanelVisible(true);
		// alert(viewModel.id);
		var tokenId = window.localStorage.getItem("MyTokenId");

		var dataToSend = {
			TokenId : tokenId,
			OrderNumber : viewModel.id,
			Action : "Processing",
		};
		var jsonData = JSON.stringify(dataToSend);
		// alert(jsonData);
		return $.ajax({
			url : "http://180.148.138.140/sellerDev2/api/mobile/ProcessOrder",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			// alert(JSON.stringify(data));
			viewModel.loadPanelVisible(false);
			// DevExpress.ui.notify("Processed Order", "info", 1000);
			MyApp.app.back();
		}).fail(function(jqxhr, textStatus, error) {
			viewModel.loadPanelVisible(false);
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Process Failed: " + err);
		});

	};

	doSplitOrderByOrderID = function() {
		viewModel.loadPanelVisible(true);
		var splitIDs = [];
		for (var i = 0; i < viewModel.productsToSplit().length; i++) {
			var product = {
				Id : viewModel.productsToSplit()[i].id
			};
			splitIDs.push(product);
		}
		// alert(splitIDs);
		var tokenId = window.localStorage.getItem("MyTokenId");
		var dataToSend = {
			TokenId : tokenId,
			OrderNumber : viewModel.id,
			Action : "Split",
			Products : splitIDs
		};
		var jsonData = JSON.stringify(dataToSend);
		// alert(jsonData);
		return $.ajax({
			url : "http://180.148.138.140/sellerDev2/api/mobile/ProcessOrder",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			// alert(JSON.stringify(data));
			viewModel.loadPanelVisible(false);
			// DevExpress.ui.notify("Processed Order", "info", 1000);
			viewModel.popupSplitVisible(false);
			MyApp.app.back();
		}).fail(function(jqxhr, textStatus, error) {
			viewModel.loadPanelVisible(false);
			viewModel.popupSplitVisible(false);
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Process Failed: " + err);
		});

	};

	doDelayProcessOrderByOrderID = function() {
		viewModel.loadPanelVisible(true);
		// alert(viewModel.id);
		var tokenId = window.localStorage.getItem("MyTokenId");
		// alert(viewModel.dateBoxValue());
		var newDelayDate = new Date(viewModel.dateBoxValue());
		// newDelayDate.format("yyyy-mm-dd");
		// alert(newDelayDate.toString());
		var dataToSend = {
			TokenId : tokenId,
			OrderNumber : viewModel.id,
			Action : "Delay",
			DelayDate : Globalize.format(newDelayDate, 'yyyy-MM-dd')
		};
		var jsonData = JSON.stringify(dataToSend);
		alert(jsonData);
		return $.ajax({
			url : "http://180.148.138.140/sellerDev2/api/mobile/ProcessOrder",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			// alert(JSON.stringify(data));
			viewModel.loadPanelVisible(false);
			// DevExpress.ui.notify("Delayed Order", "info", 1000);
			viewModel.popupDelayVisible(false);
			MyApp.app.back();
		}).fail(function(jqxhr, textStatus, error) {
			viewModel.loadPanelVisible(false);
			viewModel.popupDelayVisible(false);
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
