MyApp.profile = function(params) {
	// var isPhone = DevExpress.devices.current().screenSize === "small";
	logout = function() {
		DevExpress.ui.dialog.alert("Logout is not implemented in this demo application.");
	};

	return {
		user : {
			photo : "images/user.png",
			name : 'Minh',
			surname : 'Dinh',
			email : 'anhminhde@yahoo.com',
			billingAddress : {
				city : 'Ho Chi Minh',
				district : '7',
				address : 'Nguyen Luong Bang',
				phoneNumber : '+84985945326'
			},
			shippingAddress : {
				city : 'Ho Chi Minh',
				district : '7',
				address : 'Nguyen Luong Bang',
				phoneNumber : '+84985945326'
			}
		},
		// isPhone : isPhone,

		// showLookup : function(e) {
		// if (isPhone)
		// return;
		// $(".dx-viewport .dx-lookup-popup-wrapper:visible").addClass(e.element.closest(".billing").length ? "billing-popup" : "shipping-popup");
		// },
		//
		// viewShown : function() {
		// if (isPhone)
		// $(".dx-viewport .profile").dxScrollView();
		// else
		// $(".dx-viewport .profile-address-info").dxScrollView();
		// }
	};
};
