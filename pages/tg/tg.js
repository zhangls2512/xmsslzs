Page({
    data: {
        xs: false,
        theme: '',
        yuming: [],
        ym: '',
        suanfa: '',
        array: ['RSA（2048位）', 'RSA（3072位）', 'RSA（4096位）', 'ECDSA（P-256）', 'ECDSA（P-384）'],
        sf: '请选择'
    },
    onShow() {
        var that = this
        that.setData({
            xs: false,
            theme: wx.getAppBaseInfo().theme
        })
        if (wx.getStorageSync('user').zt == true) {
            that.setData({
                xs: true
            })
        }
    },
    ym() {
        if (this.data.ym != '') {
            if (this.data.yuming.length >= 10) {
                wx.showToast({
                    title: '最多只能添加10个域名',
                    icon: 'none'
                })
                return
            }
            var yuming = this.data.yuming
            yuming.push(this.data.ym)
            this.setData({
                ym: '',
                yuming: yuming
            })
        }
    },
    sc(e) {
        var id = e.currentTarget.dataset.id, yuming = this.data.yuming;
        const index = yuming.indexOf(id)
        yuming.splice(index, 1)
        this.setData({
            yuming: yuming
        })
    },
    picker(e) {
        var t = e.detail.value
        if (t == 0) {
            this.setData({
                suanfa: 'rsa2048',
                sf: 'RSA（2048位）'
            })
        }
        if (t == 1) {
            this.setData({
                suanfa: 'rsa3072',
                sf: 'RSA（3072位）'
            })
        }
        if (t == 2) {
            this.setData({
                suanfa: 'rsa4096',
                sf: 'RSA（4096位）'
            })
        }
        if (t == 3) {
            this.setData({
                suanfa: 'ecdsap256',
                sf: 'ECDSA（P-256）'
            })
        }
        if (t == 4) {
            this.setData({
                suanfa: 'ecdsap384',
                sf: 'ECDSA（P-384）'
            })
        }
    },
    tg() {
        var t = this.data, that = this;
        if (t.yuming.length == 0) {
            wx.showToast({
                title: '请添加域名',
                icon: 'error'
            })
            return
        }
        if (t.suanfa == '') {
            wx.showToast({
                title: '请选择加密算法',
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
        wx.showLoading({
            title: '新增中',
            mask: true
        })
        wx.request({
            url: 'https://api.dqmybkj.com/sslsq',
            method: 'POST',
            data: {
                email: wx.getStorageSync('user').email,
                password: require('../../password').token(),
                yuming: t.yuming,
                suanfa: t.suanfa
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
                            title: '新增成功'
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
    }
})