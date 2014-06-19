MyApp.chats = function(params) {
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
				// chatIdsStore.clear();
				doLoadChatIdsData();
			}
		},
		viewShown : function() {
			var isAndroid = DevExpress.devices.real().platform === 'android';
			var obj = null;
			obj = $("#chatidlist");
			var list = obj.dxList("instance");
			list.option('showNextButton', isAndroid);
			list.option('pullRefreshEnabled', !isAndroid);
			// list.option('autoPagingEnabled', !isAndroid);
			loadImages();
		},
		loadPanelVisible : ko.observable(false),
	};

	var myUserName = window.localStorage.getItem("UserName");
	var chatIdsStore = new DevExpress.data.LocalStore({
		name : myUserName + "chatIdsStore",
		key : "id",
		flushInterval : 1000,
		// immediate: true,
	});
	chatsDataSource = new DevExpress.data.DataSource({
		store : chatIdsStore,
		sort : [{
			getter : 'updatedDate',
			desc : true
		}, {
			getter : 'createdDate',
			desc : true
		}],
		pageSize : 10
	});

	doLoadChatIdsData = function(actionOptions) {
		// alert(viewModel.id);
		viewModel.loadPanelVisible(true);
		var myUserName = window.localStorage.getItem("UserName");
		var tokenId = window.localStorage.getItem("MyTokenId");
		var timeStamp = Number(window.localStorage.getItem(myUserName + "ListCommentTimeStamp"));
		if (timeStamp === null)
			timeStamp = 0;
		var dataToSend = {
			TokenId : tokenId,
			TimeStamp : timeStamp
		};
		var jsonData = JSON.stringify(dataToSend);
		// alert(jsonData);
		return $.ajax({
			url : "http://180.148.138.140/SellerTest2/api/mobile/ListComment",
			type : "POST",
			data : jsonData,
			contentType : "application/json; charset=utf-8",
			dataType : "json"
		}).done(function(data, textStatus) {
			if (data.Flag === true) {
				window.localStorage.setItem(myUserName + "ListCommentTimeStamp", data.TimeStamp);
				if ((data.Data != undefined) && (data.Data.data != undefined) && (data.Data.data.length > 0)) {
					var result = $.map(data.Data.data, function(item) {
						var date = convertDate(item.Time);
						var dateString = Globalize.format(date, 'dd-MM-yy');
						var name = item.Customer_name.toUpperCase();
						var message = name + ' (' + dateString + '): ' + item.Content;
						var updatedDate = convertDate(item.Time_update);
						var totalComment = item.SubLength + ' ';

						return {
							id : item.Id,
							name : item.Product_Name,
							thumbnail : item.Product_thumb,
							msg : message,
							// isParent : item.IsParent,
							updatedDate : updatedDate,
							createdDate : date,
							totalComment : totalComment,
						};
					});
					for (var i = 0; i < result.length; i++) {
						chatIdsStore.byKey(result[i].id).done(function(dataItem) {
							if (dataItem != undefined)
								chatIdsStore.update(result[i].id, result[i]);
							else
								chatIdsStore.insert(result[i]);
						}).fail(function(error) {
							chatIdsStore.insert(result[i]);
						});
					}
					chatIdsStore.load();
					chatsDataSource.sort([{
						getter : 'updatedDate',
						desc : true
					}, {
						getter : 'createdDate',
						desc : true
					}]);
					chatsDataSource.pageIndex(0);
					chatsDataSource.load();
					// alert(JSON.stringify(data));
					// viewModel.dataSource(result);
					// alert(JSON.stringify(viewModel.dataSource()));
					// popupVisible(false);
				}
			}
			viewModel.loadPanelVisible(false);
			if ((actionOptions != null) && (actionOptions.component != undefined))
				actionOptions.component.release();
			//textStatus contains the status: success, error, etc
		}).fail(function(jqxhr, textStatus, error) {
			alert("Lỗi mạng, thử lại sau!");
			viewModel.loadPanelVisible(false);
			if ((actionOptions != null) && (actionOptions.component != undefined))
				actionOptions.component.release();
		});
	};
	
	textClicked = function(id) {
		MyApp.app.navigate({
			view : 'chatdetails',
			id : id
		});
	};
	
	loadImages = function() {
		jQuery("img.product-thumbnail.lazy").lazy({
			effect : "fadeIn",
			effectTime : 1500
		});
	};
	
	return viewModel;
};
