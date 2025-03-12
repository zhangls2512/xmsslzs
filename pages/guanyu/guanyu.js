Page({
	data: {
		jl: 0,
		theme: '',
		xs: false
	},
	xs() {
		var that = this
		if (that.data.xs == false) {
			that.setData({
				xs: true
			})
			return
		}
		if (that.data.xs == true) {
			that.setData({
				xs: false
			})
		}
	},
	onShow() {
		var that = this
		that.setData({
			jl: (wx.getWindowInfo().windowWidth - 100) / 2,
			theme: wx.getAppBaseInfo().theme
		})
	},
	gxrz() {
		this.pageRouter.navigateTo({
			url: '../gxrz/gxrz'
		})
	},
	zzgs() {
		this.pageRouter.navigateTo({
			url: '../zzgs/zzgs'
		})
	},
	jcgx() {
		const updateManager = wx.getUpdateManager()
		updateManager.onCheckForUpdate(function (res) {
			if (res.hasUpdate == true) {
				wx.showToast({
					title: '存在新版本，即将重启更新',
					icon: 'none'
				})
				updateManager.onUpdateReady(function () {
					updateManager.applyUpdate()
				})
				updateManager.onUpdateFailed(function () {
					wx.showToast({
						title: '新版本下载失败',
						icon: 'error'
					})
				})
			} else {
				wx.showToast({
					title: '无更新',
					icon: 'none'
				})
			}
		})
	},
	beian() {
		this.pageRouter.navigateTo({
			url: '../lj/lj?id=' + encodeURIComponent('https://beian.miit.gov.cn/#/Integrated/recordQuery')
		})
	},
	gitcode() {
		this.pageRouter.navigateTo({
			url: '../lj/lj?id=' + encodeURIComponent('https://gitcode.com/zhangls2512/xmsslzs')
		})
	},
	yinsi() {
		var app = getApp()
		if (app.globalData.network == 'none') {
			wx.showToast({
				title: '无网络',
				icon: 'error'
			})
			return
		}
		wx.openPrivacyContract()
	}
})