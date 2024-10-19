Page({
	data: {
		theme: '',
		email: '',
		password: ''
	},
	onShow() {
		var that = this
		that.setData({
			theme: wx.getAppBaseInfo().theme
		})
	},
	dl() {
		var t = this.data, that = this;
		if (t.email == '') {
			wx.showToast({
				title: '请填写邮箱',
				icon: 'error'
			})
			return
		}
		if (t.password == '') {
			wx.showToast({
				title: '请填写密码',
				icon: 'error'
			})
			return
		}
		var app = getApp()
		if (app.globalData.network == 'none') {
			wx.showToast({
				title: '无网络',
				icon: 'error'
			})
			return
		}
		const sm2 = require('sm-crypto').sm2
		const sm3 = require('sm-crypto').sm3
		let passwordhash = sm3(t.password)
		let pinjieopen = 'sm2' + '\0' + passwordhash + '\0' + Date.now()
		let publicKey = '04af5e16abb9b0fec1e423a53a94400b42eb8036176da1434aebdc5ff54afaaa0ef1b34f893e149d35f9df144fe71283411ab1caa0caddd4dd15439d9b0b010db1'
		let pinjieclose = sm2.doEncrypt(pinjieopen, publicKey)
		wx.showLoading({
			title: '登录中',
			mask: true
		})
		wx.request({
			url: 'https://api.dqmybkj.com/ssllogin',
			method: 'POST',
			data: {
				email: t.email,
				password: pinjieclose
			},
			useHighPerformanceMode: true,
			enableHttp2: true,
			enableProfile: false,
			enableQuic: true,
			success(res) {
				wx.hideLoading()
				if (res.statusCode == 200) {
					if (res.data.code == 0) {
						wx.showToast({
							title: '登录成功'
						})
						wx.setStorage({
							key: 'user',
							data: {
								zt: true,
								email: t.email,
								password: pinjieclose
							}
						})
						setTimeout(() => {
							that.router.navigateBack({
								delta: 1,
								fail() {
									wx.showToast({
										title: '错误',
										icon: 'error'
									})
								}
							})
						}, 1500)
					} else {
						wx.showModal({
							title: '接口调用失败',
							content: '错误码：' + res.data.code + '；错误信息：' + res.data.msg,
							showCancel: false
						})
					}
				} else {
					wx.showToast({
						title: 'HTTP请求失败，错误码：' + res.statusCode,
						icon: 'none'
					})
				}
			}
		})
	},
	zccz() {
		this.router.navigateTo({
			url: '../zccz/zccz'
		})
	}
})