Page({
    data: {
        tx: '/image/tx.png',
        nc: '未登录用户',
        tsa: '',
        tsb: '',
        tsc: '',
        tsd: '',
        tse: '',
        xcx1: '',
        xcx2: '',
        xcx3: '',
        ua: '',
        wdxcx: '',
        cd: '',
        ld: '',
        dl: '',
        tsxs: false,
        wllx: '',
        xhqr: 0,
        wldl: '',
        rw: '',
        isSupported: '',
        version: '',
        reason: '',
        wza: '',
        theme: ''
    },
    onShow() {
        var that = this
        that.setData({
            theme: wx.getAppBaseInfo().theme,
            nc: '未登录用户',
            tsa: wx.getSystemSetting(),
            tsb: wx.getDeviceInfo(),
            tsd: wx.getWindowInfo(),
            tse: wx.getAppBaseInfo(),
            xcx1: wx.getAccountInfoSync().miniProgram.appId,
            xcx2: wx.getAccountInfoSync().miniProgram.envVersion,
            xcx3: wx.getAccountInfoSync().miniProgram.version
        })
        wx.getDeviceBenchmarkInfo({
            success(res) {
                that.setData({
                    tsc: res
                })
            }
        })
        wx.getBatteryInfo({
            success(res) {
                that.setData({
                    dl: res.level,
                    cd: String(res.isCharging)
                })
            }
        })
        wx.checkIsOpenAccessibility({
            success(res) {
                that.setData({
                    wza: res.open
                })
            }
        })
        wx.getNetworkType({
            success(res) {
                that.setData({
                    wllx: res.networkType,
                    xhqr: res.signalStrength,
                    wldl: String(res.hasSystemProxy),
                    rw: String(res.weakNet)
                })
            }
        })
        wx.getScreenBrightness({
            success(res) {
                that.setData({
                    ld: res.value
                })
            }
        })
        wx.checkIsAddedToMyMiniProgram({
            success(res) {
                that.setData({
                    wdxcx: String(res.added)
                })
            }
        })
        wx.getSkylineInfo({
            success(res) {
                that.setData({
                    isSupported: String(res.isSupported),
                    version: res.version,
                    reason: res.reason
                })
            }
        })
        wx.getRendererUserAgent({
            success(res) {
                that.setData({
                    ua: res.userAgent
                })
            }
        })
        if (wx.getStorageSync('user').zt == true) {
            that.setData({
                nc: wx.getStorageSync('user').email
            })
        }
    },
    dl() {
        this.router.navigateTo({
            url: '../login/login'
        })
    },
    netzd() {
        this.pageRouter.navigateTo({
            url: '../netzd/netzd'
        })
    },
    setting() {
        this.pageRouter.navigateTo({
            url: '../setting/setting'
        })
    },
    qchc() {
        var that = this
        wx.clearStorage({
            success() {
                wx.showToast({
                    title: '清除成功'
                })
                that.onShow()
            }
        })
    },
    gxwx() {
        var app = getApp()
        if (app.globalData.network == 'none') {
            wx.showToast({
                title: '无网络',
                icon: 'error'
            })
            return
        }
        wx.updateWeChatApp()
    },
    ts() {
        wx.setEnableDebug({
            enableDebug: true,
            complete(res) {
                wx.showModal({
                    title: '提示',
                    content: res.errMsg,
                    showCancel: false
                })
            }
        })
    },
    gbts() {
        wx.setEnableDebug({
            enableDebug: false,
            complete(res) {
                wx.showModal({
                    title: '提示',
                    content: res.errMsg,
                    showCancel: false
                })
            }
        })
    },
    yc() {
        this.setData({
            tsxs: false
        })
    },
    xsts() {
        this.setData({
            tsxs: true
        })
    }
})