﻿(function() {"use strict";

	var MyApp = window.MyApp = { };

	// Uncomment the line below to disable platform-specific look and feel and to use the Generic theme for all devices
	DevExpress.devices.current({
		platform : "android"
	});

	$(function() {
		MyApp.app = new DevExpress.framework.html.HtmlApplication({
			namespace : MyApp,
			// navigationType : "slideout",
			layoutSet : DevExpress.framework.html.layoutSets["slideout"],
			navigation : [{
				title : 'Đơn hàng',
				action : "#home",
				icon : "order",
				// icon : "cart",
			}, {
				title : 'Sản Phẩm',
				action : "#products",
				icon : "products",
				// icon : "box",
			}, {
				title : 'Hỏi & đáp',
				action : "#chats",
				icon : "qa",				
				// icon : "comment",
			}, {
				title : 'Đăng nhập',
				action : "#user",
				icon : "profile",
				// icon : "user",
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
					}, {
						id : "refresh",
						location : 'right',
						showText : false
					}]
				},
				"android-header-toolbar" : {
					commands : [{
						id : "sort",
						location : 'right',
						text : 'Sắp xếp ',
						showText : true
					}, {
						id : "edit",
						location : 'right',
						showText : false
					}, {
						id : "refresh",
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

		function onBackButton() {
			DevExpress.hardwareBackButton.fire();
		}

		function exitApp() {
			var result = DevExpress.ui.dialog.confirm("Bạn có chắc muốn thoát ứng dụng?", "Sendo.vn");
			result.done(function(dialogResult) {
				if (dialogResult) {
					switch(DevExpress.devices.real().platform) {
						case "win8":
							window.external.Notify("DevExpress.ExitApp");
							break;
						default:
							navigator.app.exitApp();
							break;
					}
				}
			});
			// DevExpress.ui.notify("Nhấn lần nữa sẽ thoát ứng dụng!");unction onBackButton() {
		}

		var onDeviceReady = function() {
			//hide splash screen
			// alert("ready");
			intel.xdk.device.hideSplashScreen();
			intel.xdk.device.setRotateOrientation("portrait");
			intel.xdk.device.setAutoRotate(false);
			document.addEventListener("backbutton", onBackButton, false);
			MyApp.app.navigatingBack.add(function(e) {
				// alert("back");
				if (!MyApp.app.canBack()) {
					// alert("quit");
					e.cancel = true;
					if (window.cordova) {
						exitApp();
					}
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
				var myUserName = window.localStorage.getItem("UserName");
				if (window.localStorage.getItem(myUserName + "didAddPushUser") === null) {
					//Set cookie 'didAddPushUser' in order to avoid multiple addPushUser calls
					window.localStorage.setItem(myUserName + "didAddPushUser", true);
					AppMobi.notification.alert("Doing addPushUser now...", "My Message", "OK");
					//Try adding the user now - sending unique user id, password, and email address.
					AppMobi.notification.addPushUser(myUserName, AppMobi.device.uuid, 'no@email.com');
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

		MyApp.app.navigate();
	});
})();
