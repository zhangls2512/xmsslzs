Page({
    data: {
        tx: '/image/tx.png',
        theme: '',
        nc: '未登录用户',
        tsa: '',
        tsb: '',
        tsc: '',
        tsd: '',
        tse: '',
        xcx1: '',
        xcx2: '',
        xcx3: '',
        jnw: '',
        jnh: '',
        jnt: '',
        jnr: '',
        jnb: '',
        jnl: '',
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
        hevc: ''
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
            xcx3: wx.getAccountInfoSync().miniProgram.version,
            jnw: wx.getMenuButtonBoundingClientRect().width,
            jnh: wx.getMenuButtonBoundingClientRect().height,
            jnt: wx.getMenuButtonBoundingClientRect().top,
            jnr: wx.getMenuButtonBoundingClientRect().right,
            jnb: wx.getMenuButtonBoundingClientRect().bottom,
            jnl: wx.getMenuButtonBoundingClientRect().left
        })
        wx.getDeviceBenchmarkInfo({
            success(res) {
                that.setData({
                    tsc: res
                })
            }
        })
        wx.checkDeviceSupportHevc({
            success(res) {
                that.setData({
                    hevc: res.supportHevc
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
        wx.showActionSheet({
            itemList: ['登录态', '授权设置', '全部'],
            success(res) {
                if (res.tapIndex == 0) {
                    wx.removeStorage({
                        key: 'user',
                        success() {
                            wx.showToast({
                                title: '清除成功'
                            })
                            that.onShow()
                        }
                    })
                }
                if (res.tapIndex == 1) {
                    wx.removeStorage({
                        key: 'qxsetting',
                        success() {
                            wx.showToast({
                                title: '清除成功'
                            })
                        }
                    })
                }
                if (res.tapIndex == 2) {
                    wx.clearStorage({
                        success() {
                            wx.showToast({
                                title: '清除成功'
                            })
                            that.onShow()
                        }
                    })
                }
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