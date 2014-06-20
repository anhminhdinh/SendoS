MyApp.chatdetails = function(params) {
	var viewModel = {
		// title : ko.observable(),
		chatDetailDataSource : ko.observableArray(),
		id : params.id,
		productName : ko.observable(''),
		loadPanelVisible : ko.observable(false),
		viewShowing : function() {
			doLoadChatDetailData();
		},
		commentToPost : ko.observable(''),
	};
	doLoadChatDetailData = function(actionOptions) {
		viewModel.loadPanelVisible(true);
		var tokenId = window.localStorage.getItem("MyTokenId");
		// alert(jsonData);
		$.post("http://ban.sendo.vn/api/mobile/ListCommentById", {
			TokenId : tokenId,
			Id : viewModel.id
		}, function(data) {
			viewModel.loadPanelVisible(false);
			if ((actionOptions != null) && (actionOptions.component != undefined))
				actionOptions.component.release();
			if (data.Flag != true) {
				alert("Lỗi mạng, thử lại sau!");
				return;
			}
			if (data.Data === null || data.Data.data === null || data.Data.data.length === 0)
				return;
			var result = $.map(data.Data.data, function(item) {
				var today = new Date();
				var date = convertDate(item.Time);
				var isSameDay = (date.getDate() == today.getDate() && date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear());
				var dateString = isSameDay ? Globalize.format(date, 'hh:mm') : Globalize.format(date, 'dd-MM-yy');
				var name = item.Customer_name;
				dateString = name + ' | ' + dateString;
				var message = item.Content;
				var isShop = item.Customer_type === "2";
				return {
					name : name,
					date : dateString,
					id : item.ProductId,
					msg : message,
					isParent : item.IsParent,
					isShop : isShop
				};
			});
			viewModel.productName(data.Data.ProductName);
			viewModel.chatDetailDataSource(result);
			var chatScroll = $("#chatScroll").dxScrollView("instance");
			var scrollHeight = chatScroll.scrollHeight();
			$("#chatScroll").dxScrollView("instance").scrollTo(scrollHeight);

		}, "json").fail(function(jqxhr, textStatus, error) {
			alert("Lỗi mạng, thử lại sau!");
			viewModel.loadPanelVisible(false);
			if ((actionOptions != null) && (actionOptions.component != undefined))
				actionOptions.component.release();
		});

	};
	postComment = function() {
		viewModel.loadPanelVisible(true);
		var tokenId = window.localStorage.getItem("MyTokenId");
		$.post("http://ban.sendo.vn/api/mobile/SendComment", {
			TokenId : tokenId,
			Id : viewModel.id,
			Message : viewModel.commentToPost()
		}, "json").done(function(data) {
			viewModel.commentToPost('');
			doLoadChatDetailData();
		}).fail(function(jqxhr, textStatus, error) {
			alert("Lỗi mạng, thử lại sau!");
			viewModel.loadPanelVisible(false);
		});

	};
	return viewModel;
};
