MyApp['product-details'] = function(params) {
	var viewModel = {
		title : ko.observable('Orders'),
		id : params.id,
		name : ko.observable(''),
		storeSku : ko.observable(''),
		quantity : ko.observable(0),
		thumnail : ko.observable(''),
		price : ko.observable(0),
		weight : ko.observable(0),
		stockAvailability : ko.observable(false),
		upProductDate : ko.observable(),
		popupEditVisible : ko.observable(false),
		loadPanelVisible : ko.observable(false),
		viewShown : function(e) {
			this.title("Product " + this.id);
			doLoadDataByProductID();
		},
		hideEditPopup : function(e) {
			this.popupEditVisible(false);
		},
		edit : function(e) {
			this.popupEditVisible(true);
			// this.editName(this.name);
			// this.editPrice(this.price);
			// this.editWeight(this.weight);
		},
		editName : ko.observable(''),
		editPrice : ko.observable(),
		editWeight : ko.observable(),
	};

	doLoadDataByProductID = function() {
		viewModel.loadPanelVisible(true);
		// alert(viewModel.id);
		var tokenId = window.localStorage.getItem("MyTokenId");

		var dataToSend = {
			TokenId : tokenId,
			Id : viewModel.id
		};
		var jsonData = JSON.stringify(dataToSend);
		// alert(jsonData);
		return $.ajax({
			url : "http://180.148.138.140/sellerDev2/api/mobile/ProductInfoById",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			// alert(JSON.stringify(data));
			viewModel.loadPanelVisible(false);
			//TODO: server fix here: not use [0]
			viewModel.name(data.Data[0].Name);
			viewModel.storeSku(data.Data[0].StoreSku);
			viewModel.quantity(data.Data[0].Quantity);
			// alert(data.Data[0].Thumnail);
			viewModel.thumnail(data.Data[0].Thumnail);
			viewModel.price(data.Data[0].Price);
			viewModel.weight(data.Data[0].Weight);
			viewModel.stockAvailability(data.Data[0].StockAvailability);
			var OrderDate = new Date(data.Data[0].UpProductDate);
			viewModel.upProductDate(Globalize.format(OrderDate, 'dd-MM-yy'));
			// alert(viewModel.thumnail());
			//textStatus contains the status: success, error, etc
		}).fail(function(jqxhr, textStatus, error) {
			viewModel.loadPanelVisible(false);
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Get Failed: " + err);
		});

	};

	changeStockStatus = function() {
		if (confirm("Are you sure you wanna change Stock status?")) {
			viewModel.loadPanelVisible(true);
			// alert(viewModel.id);
			var tokenId = window.localStorage.getItem("MyTokenId");

			var dataToSend = {
				TokenId : tokenId,
				Id : viewModel.id,
				StockAvailability : viewModel.stockAvailability(),
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

	changeProductProperties = function() {
		if (confirm("Are you sure you wanna edit this?")) {
			viewModel.loadPanelVisible(true);
			// alert(viewModel.id);
			var tokenId = window.localStorage.getItem("MyTokenId");

			var dataToSend = {
				TokenId : tokenId,
				Id : viewModel.id,
				Name : viewModel.editName(),
				Weight : viewModel.editWeight(),
				Price : viewModel.editPrice(),
			};
			var jsonData = JSON.stringify(dataToSend);
			// alert(jsonData);
			return $.ajax({
				url : "http://180.148.138.140/sellerDev2/api/mobile/UpdateProduct",
				type : "POST",
				data : jsonData,
				contentType : "application/json; charset=utf-8",
				dataType : "json"
			}).done(function(data, textStatus) {
				viewModel.loadPanelVisible(false);
				viewModel.popupEditVisible(false);
				doLoadDataByProductID();
				//textStatus contains the status: success, error, etc
			}).fail(function(jqxhr, textStatus, error) {
				viewModel.loadPanelVisible(false);
				viewModel.popupEditVisible(false);
				var err = textStatus + ", " + jqxhr.responseText;
				alert("Get Failed: " + err);
			});
		}
	};
 
	upProduct = function () {
		if (confirm("Are you sure you wanna up this product?")) {
			viewModel.loadPanelVisible(true);
			// alert(viewModel.id);
			var tokenId = window.localStorage.getItem("MyTokenId");

			var dataToSend = {
				TokenId : tokenId,
				ProductId : viewModel.id,
			};
			var jsonData = JSON.stringify(dataToSend);
			alert(jsonData);
			return $.ajax({
				url : "http://180.148.138.140/sellerDev2/api/mobile/UpProduct",
				type : "POST",
				data : jsonData,
				contentType : "application/json; charset=utf-8",
				dataType : "json"
			}).done(function(data, textStatus) {
				viewModel.loadPanelVisible(false);
				doLoadDataByProductID();
				//textStatus contains the status: success, error, etc
			}).fail(function(jqxhr, textStatus, error) {
				viewModel.loadPanelVisible(false);
				var err = textStatus + ", " + jqxhr.responseText;
				alert("Get Failed: " + err);
			});
		}
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
