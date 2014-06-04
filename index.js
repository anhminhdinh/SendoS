(function() {"use strict";

	var MyApp = window.MyApp = { };

	// Uncomment the line below to disable platform-specific look and feel and to use the Generic theme for all devices
	DevExpress.devices.current({
		platform : "android"
	});

	$(function() {
		MyApp.app = new DevExpress.framework.html.HtmlApplication({
			namespace : MyApp,
			navigationType : "slideout",
			navigation : [{
				title : 'Đơn hàng',
				action : "#home",
				icon : "order"
			}, {
				title : 'Sản Phẩm',
				action : "#products",
				icon : "products"
			}, {
				title : 'Hỏi & đáp',
				action : "#chats",
				icon : "qa"
			}, {
				title : 'Người dùng',
				action : "#user",
				icon : "profile"
			}, {
				title : 'Thông tin',
				action : "#about",
				icon : "info"
			}],
			commandMapping : {
				"ios-header-toolbar" : {
					commands : [{
						id : "sort",
						location : 'right',
						showText : true
					}, {
						id : "edit",
						location : 'right',
						showText : false
					}]
				},
				"android-header-toolbar" : {
					commands : [{
						id : "sort",
						location : 'right',
						// text : 'Sắp xếp',
						showText : false
					}, {
						id : "edit",
						location : 'right',
						showText : false
					}]
				}
			}
		});

		localStorage.removeItem("MyTokenId");

		MyApp.app.router.register(":view/:id", {
			view : "user",
			id : undefined
		});
		function exitApp() {
			// var result = DevExpress.ui.dialog.confirm("Bạn có chắc muốn thoát ứng dụng?", "Sendo");
			// result.done(function(dialogResult) {
			// if (dialogResult) {
			// switch(DevExpress.devices.real().platform) {
			// case "win8":
			// window.external.Notify("DevExpress.ExitApp");
			// break;
			// default:
			// navigator.app.exitApp();
			// break;
			// }
			// }
			// });
			DevExpress.ui.notify("Nhấn lần nữa sẽ thoát ứng dụng!");
		};

		var onDeviceReady = function() {
			//hide splash screen
			intel.xdk.device.hideSplashScreen();
			intel.xdk.device.setRotateOrientation("portrait");
			intel.xdk.device.setAutoRotate(false);
			MyApp.app.navigatingBack.add(function() {
				if (!MyApp.app.canBack()) {
					exitApp();
				}
			});
			$.ajaxSetup({
				contentType : "application/json; charset=utf-8"
			});
			// AppMobi.device.hideSplashScreen();
		};
		document.addEventListener("intel.xdk.device.ready", onDeviceReady, false);

		var notificationsRegistered = function(event) {
			//This is first called from the checkPushUser event above.
			//If a user is not found, success = false, and this tries to add that user.
			if (event.success === false) {
				if (window.localStorage.getItem("didAddPushUser") == undefined) {
					//Set cookie 'didAddPushUser' in order to avoid multiple addPushUser calls
					window.localStorage.setItem("didAddPushUser", true);
					AppMobi.notification.alert("Doing addPushUser now...", "My Message", "OK");
					//Try adding the user now - sending unique user id, password, and email address.
					AppMobi.notification.addPushUser(window.localStorage.getItem("UserName"), AppMobi.device.uuid, 'no@email.com');
					//This will fire the push.enable event again, so that is why we use didAdd to make sure
					//we dont add the user twice if this fails for any reason.
					return;
				}
				if ( typeof AppMobi === 'function')
					AppMobi.notification.alert("Notifications Failed: " + event.message, "My Message", "OK");
				return;
			}
			var msg = event.message || 'success';
			if ( typeof AppMobi === 'function')
				AppMobi.notification.alert("Notifications Enabled: " + msg, "My Message", "OK");
		};
		document.addEventListener("appMobi.notification.push.enable", notificationsRegistered, false);

		var receivedPush = function() {
			//Get the notifications object
			var myNotifications = AppMobi.notification.getNotificationList();
			//It may contain more than one message, so iterate over them
			var len = myNotifications.length;
			if (len > 0) {
				for ( i = 0; i < len; i++) {
					//Get message object
					msgObj = AppMobi.notification.getNotificationData(myNotifications[i]);
					try {
						if ( typeof msgObj == "object" && msgObj.id == myNotifications[i]) {
							//Display the message now.
							//You can do this however you like - it doesn't have to be an alert.
							AppMobi.notification.alert(msgObj.msg + "\n" + msgObj.data + "\n" + msgObj.userkey, "pushMobi Message", "OK");
							//Always mark the messages as read and delete them.
							//If you dont, your users will get them over and over again.

							AppMobi.notification.deletePushNotifications(msgObj.id);
							//here we have added return statement to show only first valid message, you can manage it accordingly if you want to read all messages
							return;
						}
						AppMobi.notification.alert("Invalid Message Object: " + i, "My Message", "OK");
					} catch(e) {
						AppMobi.notification.alert("Caught Exception For: " + msgObj.id, "My Message", "OK");
						//Always mark the messages as read and delete them.
						//If you dont, your users will get them over and over again.
						AppMobi.notification.deletePushNotifications(msgObj.id);
					}
				}
			}
		};
		document.addEventListener("appMobi.notification.push.receive", receivedPush, false);

		// MyApp.app.initialized.add(function() {
		// var $view = MyApp.app.getViewTemplate("LogOnPopup");
		// $view.appendTo(".dx-viewport");
		// MyApp.logOnPopupViewModel = MyApp.LogOnPopup();
		//
		// ko.applyBindings(MyApp.logOnPopupViewModel, $view[0]);
		// });
		//
		// MyApp.app.navigating.add(function(e) {
		// var params = MyApp.app.router.parse(e.uri), viewInfo = MyApp.app.getViewTemplateInfo(params.view);
		// var localTokenId = window.localStorage.getItem("MyTokenId");
		// if (viewInfo.secure && localTokenId == null) {
		// // DevExpress.ui.notify("show logon", "info", 1000);
		// e.cancel = true;
		// MyApp.logOnPopupViewModel.show(e);
		// }
		// // else
		// // DevExpress.ui.notify(localTokenId, "info", 1000);
		// });
		MyApp.app.navigate();
	});
})();
