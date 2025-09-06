Page({
	gzh() {
		var app = getApp()
		if (app.globalData.network == 'none') {
			wx.showToast({
				title: '无网络',
				icon: 'error'
			})
			return
		}
		wx.openOfficialAccountChat({
			username: 'xm2512vlog'
		})
	}
})