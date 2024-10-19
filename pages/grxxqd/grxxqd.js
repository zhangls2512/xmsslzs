Page({
	data: {
		email: ''
	},
	onShow() {
		if (wx.getStorageSync('user').zt == true) {
			this.setData({
				email: wx.getStorageSync('user').email
			})
		}
	}
})