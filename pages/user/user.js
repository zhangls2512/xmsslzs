Page({
  data: {
    theme: '',
    email: '未登录',
    production: 0,
    staging: 0,
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
    hevc: '',
    wza: '',
    dl: '',
    cd: '',
    sd: '',
    wllx: '',
    xhqr: '',
    wldl: '',
    rw: '',
    isSupported: '',
    version: '',
    reason: '',
    ld: '',
    wdxcx: '',
    ua: '',
    tsxs: false
  },
  onShow() {
    var that = this
    that.setData({
      theme: wx.getAppBaseInfo().theme,
      email: '未登录',
      production: 0,
      staging: 0,
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
          cd: String(res.isCharging),
          sd: String(res.isLowPowerModeEnabled)
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
    if (wx.getStorageSync('user').accesstoken) {
      that.setData({
        email: wx.getStorageSync('user').email
      })
      var app = getApp()
      if (app.globalData.network == 'none') {
        wx.showToast({
          title: '无网络',
          icon: 'error'
        })
        return
      }
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      wx.request({
        url: 'https://api.zhangls2512.cn/product/getUserInfo',
        method: 'POST',
        data: {
          accessToken: wx.getStorageSync('user').accesstoken,
          product: 'ssl'
        },
        enableHttp2: true,
        enableQuic: true,
        useHighPerformanceMode: true,
        enableProfile: false,
        success(res) {
          wx.hideLoading()
          if (res.statusCode == 200) {
            if (res.data.errCode == 0) {
              that.setData({
                production: res.data.data.productionLimit,
                staging: res.data.data.stagingLimit
              })
            } else {
              wx.showModal({
                title: '接口调用失败',
                content: '错误码：' + res.data.errCode + '；错误信息：' + res.data.errMsg + '；修复方法：' + res.data.errFix,
                confirmText: '确定',
                showCancel: false
              })
            }
          } else {
            wx.showToast({
              title: '请求失败，错误码：' + res.statusCode,
              icon: 'none'
            })
          }
        },
        fail(res) {
          wx.hideLoading()
          wx.showToast({
            title: '请求失败，错误信息：' + res.errMsg,
            icon: 'none'
          })
        }
      })
    }
  },
  dl() {
    this.router.navigateTo({
      url: '../login/login'
    })
  },
  scan() {
    wx.scanCode({
      scanType: ['qrCode'],
      success(scanres) {
        const lj = 'https://www.zhangls2512.cn/product/account/login?ticket='
        if (!scanres.result.startsWith(lj) || scanres == lj) {
          wx.showModal({
            title: '提示',
            content: '请扫描有效的登录二维码',
            confirmText: '确定',
            showCancel: false
          })
          return
        }
        wx.showModal({
          title: '提示',
          content: '确定登录？',
          confirmText: '确定',
          success(res) {
            if (res.confirm) {
              var app = getApp()
              if (app.globalData.network == 'none') {
                wx.showToast({
                  title: '无网络',
                  icon: 'error'
                })
                return
              }
              wx.showLoading({
                title: '加载中',
                mask: true
              })
              wx.request({
                url: 'https://api.zhangls2512.cn/account/confirmTicket',
                method: 'POST',
                data: {
                  accessToken: wx.getStorageSync('user').accesstoken,
                  ticket: scanres.result.replace(lj, '')
                },
                enableHttp2: true,
                enableQuic: true,
                useHighPerformanceMode: true,
                enableProfile: false,
                success(res) {
                  wx.hideLoading()
                  if (res.statusCode == 200) {
                    if (res.data.errCode == 0) {
                      wx.showToast({
                        title: '确定成功'
                      })
                    } else {
                      wx.showModal({
                        title: '接口调用失败',
                        content: '错误码：' + res.data.errCode + '；错误信息：' + res.data.errMsg + '；修复方法：' + res.data.errFix,
                        confirmText: '确定',
                        showCancel: false
                      })
                    }
                  } else {
                    wx.showToast({
                      title: '请求失败，错误码：' + res.statusCode,
                      icon: 'none'
                    })
                  }
                },
                fail(res) {
                  wx.hideLoading()
                  wx.showToast({
                    title: '请求失败，错误信息：' + res.errMsg,
                    icon: 'none'
                  })
                }
              })
            }
          }
        })
      }
    })
  },
  setting() {
    this.pageRouter.navigateTo({
      url: '../setting/setting'
    })
  },
  netzd() {
    this.pageRouter.navigateTo({
      url: '../netzd/netzd'
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
              setTimeout(() => {
                that.onShow()
              }, 1500)
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
              setTimeout(() => {
                that.onShow()
              }, 1500)
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
  dkts() {
    wx.setEnableDebug({
      enableDebug: true,
      complete(res) {
        wx.showModal({
          title: '提示',
          content: res.errMsg,
          confirmText: '确定',
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
          confirmText: '确定',
          showCancel: false
        })
      }
    })
  },
  xs() {
    this.setData({
      tsxs: true
    })
  },
  yc() {
    this.setData({
      tsxs: false
    })
  }
})