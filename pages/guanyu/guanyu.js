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
	fwxy() {
		this.pageRouter.navigateTo({
			url: '../lj/lj?id=' + encodeURIComponent('https://docs.qq.com/doc/p/b0df80e716a22794683c027ed0733aee0a624bdd')
		})
	},
	yinsi() {
		var that = this
		wx.showActionSheet({
			itemList: ['完整版', '小程序通用版'],
			success(res) {
				if (res.tapIndex == 0) {
					that.pageRouter.navigateTo({
						url: '../lj/lj?id=' + encodeURIComponent('https://docs.qq.com/doc/p/8729061cf62d78803bbc74c922973101d9c02fd5')
					})
				}
				if (res.tapIndex == 1) {
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
			}
		})
	},
	yszy() {
		this.pageRouter.navigateTo({
			url: '../lj/lj?id=' + encodeURIComponent('https://docs.qq.com/doc/p/6a99249621620fc53bf1111bf2e04fade39f3083')
		})
	}
})