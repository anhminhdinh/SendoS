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
		loadPanelVisible : ko.observable(false),
	};

	var chatIdsStore = new DevExpress.data.LocalStore({
		name : "chatIdsStore",
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
		var tokenId = window.localStorage.getItem("MyTokenId");
		var timeStamp = window.localStorage.getItem("ListCommentTimeStamp");
		if (timeStamp == undefined)
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
			if (data.Data.data.length > 0) {
				window.localStorage.setItem("ListCommentTimeStamp", data.TimeStamp);
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
			viewModel.loadPanelVisible(false);
			actionOptions.component.release();
			//textStatus contains the status: success, error, etc
		}).fail(function(jqxhr, textStatus, error) {
			var err = textStatus + ", " + jqxhr.responseText;
			alert("Get Failed: " + err);
			viewModel.loadPanelVisible(false);
			actionOptions.component.release();
		});

	};
	textClicked = function(id) {
		MyApp.app.navigate({
			view : 'chatdetails',
			id : id
		});
	};
	return viewModel;
};
