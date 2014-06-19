MyApp.products = function(params) {
	var viewModel = {
		// dataSource : ko.observableArray(),
		viewShowing : function() {
			if (window.localStorage.getItem("MyTokenId") == undefined) {
				MyApp.app.navigate({
					view : "user",
					id : undefined
				}, {
					root : true
				});
			} else {
				// productsStore.clear();
				doLoadProducts();
			}
		},
		viewShown : function() {
			var isAndroid = DevExpress.devices.real().platform === 'android';
			var obj = null;
			obj = $("#productsList");
			var list = obj.dxList("instance");
			list.option('showNextButton', isAndroid);
			list.option('pullRefreshEnabled', !isAndroid);
			var _dataSource = list._dataSource;
			if (_dataSource != undefined) {
				var _items = _dataSource._items;
				if (_items != undefined) {
					var length = _items.length;
					currentView = length;
				}
			}
			// list.option('autoPagingEnabled', !isAndroid);
			loadImages();
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
		},
		selectedType : ko.observable('updatedDate'),

		processSortTypeChange : function() {
			// alert(viewModel.selectedType());
			doReload(true);
		},
		showSortOptions : function() {
			this.actionSheetVisible(true);
		},
		actionSheetVisible : ko.observable(false),
		dropDownMenuData : [{
			text : "Mới nhất",
			clickAction : function() {
				// viewModel.selectedType("updatedDate");
				doReload(true);
			}
		}, {
			text : "Cũ nhất",
			clickAction : function() {
				// viewModel.selectedType("upProductDate");
				doReload(false);
			}
		}],
		dataItem : ko.observable(),
		popupEditVisible : ko.observable(false),
		editName : ko.observable(''),
		editPrice : ko.observable(0),
		editWeight : ko.observable(0),
		hideEditPopup : function(e) {
			this.popupEditVisible(false);
		},
	};
	var currentLoadStart = 0;
	var currentLoadSize = 100;
	var currentView = 0;
	edit = function(e, itemData) {
		viewModel.popupEditVisible(true);
		productsStore.byKey(itemData.id).done(function(dataItem) {
			viewModel.dataItem(dataItem);
			viewModel.editName(dataItem.name);
			viewModel.editPrice(dataItem.price);
			viewModel.editWeight(dataItem.weight);
		});
	};

	changeStockStatus = function(e, itemData) {
		// e.jQueryEvent.stopPropagation();
		var result = DevExpress.ui.dialog.confirm("Bạn có chắc muốn thay đổi trạng thái còn / hết hàng?", "Sendo");
		result.done(function(dialogResult) {
			if (dialogResult) {
				viewModel.loadPanelVisible(true);
				// alert(viewModel.id);
				var tokenId = window.localStorage.getItem("MyTokenId");
				// alert(itemData.stockAvailability);
				var dataToSend = {
					TokenId : tokenId,
					Id : itemData.id,
					StockAvailability : !itemData.stockAvailability,
				};
				var jsonData = JSON.stringify(dataToSend);
				// alert(jsonData);
				return $.ajax({
					url : "http://180.148.138.140/SellerTest2/api/mobile/UpdateProductStock",
					type : "POST",
					data : jsonData,
					contentType : "application/json; charset=utf-8",
					dataType : "json"
				}).done(function(data, textStatus) {
					productsStore.byKey(itemData.id).done(function(dataItem) {
						// dataItem.stockAvailability = itemData.stockAvailability;
						dataItem.stockAvailability = !itemData.stockAvailability;
						dataItem.stockAvailabilityDisplay = itemData.stockAvailability ? 'Còn hàng' : 'Hết hàng';
						productsStore.remove(itemData.id);
						productsStore.insert(dataItem);
						// productsStore.update(id, dataItem);
					});
					doReload(true);
					viewModel.loadPanelVisible(false);
					// doLoadDataByProductID();
					//textStatus contains the status: success, error, etc
				}).fail(function(jqxhr, textStatus, error) {
					viewModel.loadPanelVisible(false);
					var err = textStatus + ", " + jqxhr.responseText;
					alert("Get Failed: " + err);
				});
			} else {
				doReload(true);
			}
		});
	};

	changeProductProperties = function() {
		var result = DevExpress.ui.dialog.confirm("Bạn có chắc muốn sửa thông tin sản phẩm?", "Sendo");
		result.done(function(dialogResult) {
			if (dialogResult) {
				viewModel.loadPanelVisible(true);
				// alert(viewModel.id);
				var tokenId = window.localStorage.getItem("MyTokenId");

				var dataToSend = {
					TokenId : tokenId,
					Id : viewModel.dataItem().id,
					Name : viewModel.editName(),
					Weight : viewModel.editWeight(),
					Price : viewModel.editPrice(),
				};
				var jsonData = JSON.stringify(dataToSend);
				// alert(jsonData);
				return $.ajax({
					url : "http://180.148.138.140/SellerTest2/api/mobile/UpdateProduct",
					type : "POST",
					data : jsonData,
					contentType : "application/json; charset=utf-8",
					dataType : "json"
				}).done(function(data, textStatus) {
					productsStore.byKey(viewModel.dataItem().id).done(function(dataItem) {
						dataItem.name = viewModel.editName();
						dataItem.price = viewModel.editPrice();
						dataItem.weight = viewModel.editWeight();
						productsStore.remove(dataItem.id);
						productsStore.insert(dataItem);
					});
					doReload(true);
					viewModel.loadPanelVisible(false);
					viewModel.popupEditVisible(false);
					//textStatus contains the status: success, error, etc
				}).fail(function(jqxhr, textStatus, error) {
					viewModel.loadPanelVisible(false);
					viewModel.popupEditVisible(false);
					var err = textStatus + ", " + jqxhr.responseText;
					alert("Get Failed: " + err);
				});
			}
		});
	};

	var myUserName = window.localStorage.getItem("UserName");
	productsStore = new DevExpress.data.LocalStore({
		name : myUserName + "productsStore",
		key : "id",
	});
	productsDataSource = new DevExpress.data.DataSource({
		store : productsStore,
		sort : [{
			getter : 'upProductDate',
			desc : true
		}, {
			getter : 'updatedDate',
			desc : true
		}],
		pageSize : 10
	});

	doLoadProducts = function(actionOptions) {
		// alert(viewModel.id);
		viewModel.loadPanelVisible(true);
		var myUserName = window.localStorage.getItem("UserName");
		var tokenId = window.localStorage.getItem("MyTokenId");
		var timeStamp = Number(window.localStorage.getItem(myUserName + "ProductsTimeStamp"));
		if (timeStamp === null)
			timeStamp = 0;

		if (viewModel.searchString() != '')
			timeStamp = 0;
		var dataToSend = {
			TokenId : tokenId,
			Name : viewModel.searchString(),
			From : currentLoadStart,
			To : currentLoadStart + currentLoadSize - 1,
			TimeStamp : timeStamp,
		};
		var jsonData = JSON.stringify(dataToSend);
		// alert(jsonData);
		return $.ajax({
			url : "http://180.148.138.140/SellerTest2/api/mobile/SearchProductByName",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			// alert(JSON.stringify(data));
			if (data.Flag === true && data.Data != null) {
				if (viewModel.searchString() != '')
					window.localStorage.setItem(myUserName + "ProductsTimeStamp", data.TimeStamp);
				var result = $.map(data.Data, function(item) {
					// var dateString = item.UpProductDate;
					// if (dateString.indexOf("+") == -1)
					// dateString += 'Z';
					// var UpProductDate = new Date(dateString);
					var UpProductDate = convertDate(item.UpProductDate);
					UpProductDateDisplay = Globalize.format(UpProductDate, 'dd/MM/yyyy');

					// dateString = item.UpdatedDate;
					// if (dateString.indexOf("+") == -1)
					// dateString += 'Z';
					// var UpdatedDate = new Date(dateString);
					var UpdatedDate = convertDate(item.UpdatedDate);
					UpdatedDateDisplay = Globalize.format(UpdatedDate, 'dd/MM/yyyy');
					// alert(JSON.stringify(item));
					var price = numberWithCommas(item.Price);
					var showUpProductDate = UpProductDate.getFullYear() > 1;
					return {
						id : item.Id,
						// stockAvailabilityDisplay : ko.observable(item.StockAvailability),
						name : item.Name,
						thumbnail : item.Thumnail,
						price : price,
						storeSKU : item.StoreSku,
						quantity : item.Quantity,
						weight : item.Weight,
						storeSKU : item.StoreSku,
						upProductDate : UpProductDate,
						updatedDate : UpdatedDate,
						displayUpProductDate : showUpProductDate,
						upProductDateDisplay : UpProductDateDisplay,
						updatedDateDisplay : UpdatedDateDisplay,
						stockAvailability : item.StockAvailability,
						stockAvailabilityDisplay : item.StockAvailability ? 'Còn hàng' : 'Hết hàng',
					};
				});
				// arrayStore.clear();
				for (var i = 0; i < result.length; i++) {
					productsStore.byKey(result[i].id).done(function(dataItem) {
						if (dataItem != undefined)
							productsStore.update(result[i].id, result[i]);
						else
							productsStore.insert(result[i]);
					}).fail(function(error) {
						productsStore.insert(result[i]);
					});
					// alert(JSON.stringify(result[i]));
				}
			}
			// alert(JSON.stringify(result));
			// viewModel.dataSource(result);
			viewModel.loadPanelVisible(false);
			doReload(true);
			if ((actionOptions != null) && (actionOptions.component != undefined))
				actionOptions.component.release();
			// alert(JSON.stringify(viewModel.dataSource()));
			// popupVisible(false);
			//textStatus contains the status: success, error, etc
		}).fail(function(jqxhr, textStatus, error) {
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Get Failed: " + err);
			viewModel.loadPanelVisible(false);
			if ((actionOptions != null) && (actionOptions.component != undefined))
				actionOptions.component.release();
		});

	};

	upProduct = function(id) {
		var result = DevExpress.ui.dialog.confirm("Bạn có chắc muốn up sản phẩm?", "Sendo");
		result.done(function(dialogResult) {
			if (dialogResult) {
				viewModel.loadPanelVisible(true);
				// alert(viewModel.id);
				var tokenId = window.localStorage.getItem("MyTokenId");

				var dataToSend = {
					TokenId : tokenId,
					ProductId : id,
				};
				var jsonData = JSON.stringify(dataToSend);
				// alert(jsonData);
				return $.ajax({
					url : "http://180.148.138.140/SellerTest2/api/mobile/UpProduct",
					type : "POST",
					data : jsonData,
					contentType : "application/json; charset=utf-8",
					dataType : "json"
				}).done(function(upData, upTextStatus) {
					var dataToSend = {
						TokenId : tokenId,
						Id : id,
					};
					var jsonData = JSON.stringify(dataToSend);
					$.ajax({
						url : "http://180.148.138.140/SellerTest2/api/mobile/ProductInfoById",
						type : "POST",
						data : jsonData,
						contentType : "application/json; charset=utf-8",
						dataType : "json"
					}).done(function(data, textStatus) {
						// var dateString = data.Data[0].UpProductDate;
						// if (dateString.indexOf("+") == -1)
						// dateString += 'Z';
						// var UpProductDate = new Date(dateString);
						var UpProductDate = convertDate(data.Data.UpProductDate);
						UpProductDateDisplay = Globalize.format(UpProductDate, 'dd/MM/yyyy');

						// dateString = data.Data[0].UpdatedDate;
						// if (dateString.indexOf("+") == -1)
						// dateString += 'Z';
						// var UpdatedDate = new Date(dateString);
						var UpdatedDate = convertDate(data.Data.UpdatedDate);
						UpdatedDateDisplay = Globalize.format(UpdatedDate, 'dd/MM/yyyy');

						productsStore.byKey(id).done(function(dataItem) {
							dataItem.upProductDate = UpProductDate;
							dataItem.upProductDateDisplay = UpProductDateDisplay;
							dataItem.updatedDate = UpdatedDate;
							dataItem.updatedDateDisplay = UpdatedDateDisplay;
							productsStore.remove(id);
							productsStore.insert(dataItem);
							// productsStore.update(id, dataItem);
						});
						doReload(true);
						viewModel.loadPanelVisible(false);
					});
					//textStatus contains the status: success, error, etc
				}).fail(function(jqxhr, textStatus, error) {
					viewModel.loadPanelVisible(false);
					var err = textStatus + ", " + jqxhr.responseText;
					alert("Get Failed: " + err);
				});
			}
		});
	};

	doReload = function(sortType) {
		productsStore.load();
		productsDataSource.sort([{
			getter : 'upProductDate',
			desc : sortType
		}, {
			getter : 'updatedDate',
			desc : sortType
		}]);

		// if (viewModel.searchString() !== '') {
		// DevExpress.ui.notify("search by " + viewModel.searchString(), "info", 3000);
		productsDataSource.filter("name", "contains", viewModel.searchString());
		// }

		productsDataSource.pageIndex(0);
		productsDataSource.load();

		var _items = productsDataSource._items;
		if (_items != undefined) {
			var length = _items.length;
			currentView = length;
		}
	};

	loadImages = function() {
		jQuery("img.product-thumbnail.lazy").lazy({
			effect : "fadeIn",
			effectTime : 1500
		});
	};

	loadNext = function() {
		var _items = productsDataSource._items;
		if (_items != undefined) {
			var length = _items.length;
			currentView = length;
		}
		currentView += 10;
		// alert(currentView);
		if (currentView >= currentLoadStart + currentLoadSize - 1) {
			currentLoadStart += currentLoadSize;
			doLoadProducts();
		}
		loadImages();
	};

	return viewModel;
};
