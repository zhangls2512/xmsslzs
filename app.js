App({
  globalData: {
    network: ''
  },
  onLaunch() {
    var that = this
    wx.cloud.init({
      env: 'zhangls2512-5ggbio7hc46f4036'
    })
    wx.getNetworkType({
      success(res) {
        that.globalData.network = res.networkType
        if (res.networkType == 'none') {
          wx.showToast({
            title: '未联网',
            icon: 'error'
          })
        }
        if (res.networkType != 'none' && res.networkType != 'wifi') {
          wx.showToast({
            title: '使用流量中',
            icon: 'error'
          })
        }
        if (res.weakNet == true) {
          wx.showToast({
            title: '网络信号弱',
            icon: 'error'
          })
        }
      }
    })
    wx.onMemoryWarning(function () {
      wx.showToast({
        title: '内存不足告警',
        icon: 'error'
      })
    })
    wx.onNetworkStatusChange((res) => {
      that.globalData.network = res.networkType
      if (res.isConnected == false) {
        wx.showToast({
          title: '网络已断开',
          icon: 'error'
        })
      }
      if (res.networkType != 'wifi' && res.networkType != 'none') {
        wx.showToast({
          title: '切换到流量',
          icon: 'error'
        })
      }
    })
    wx.onNetworkWeakChange((res) => {
      if (res.weakNet == true && that.globalData.network != 'none') {
        wx.showToast({
          title: '网络信号弱',
          icon: 'error'
        })
      }
    })
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      if (res.hasUpdate == true) {
        wx.showToast({
          title: '存在新版本，即将重启更新',
          icon: 'none'
        })
      }
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
    if (wx.getStorageSync('user').accesstoken) {
      if (wx.getStorageSync('user').enddate < Date.now()) {
        wx.removeStorageSync('user')
        wx.showToast({
          title: '登录态过期，请重新登录',
          icon: 'none'
        })
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/login/login'
          })
        }, 1500)
        return
      }
      if (that.globalData.network == 'none') {
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
        url: 'https://api.zhangls2512.cn/account/getAccountInfo',
        method: 'POST',
        data: {
          accessToken: wx.getStorageSync('user').accesstoken
        },
        enableHttp2: true,
        enableQuic: true,
        useHighPerformanceMode: true,
        enableProfile: false,
        success(res) {
          wx.hideLoading()
          if (res.statusCode == 200) {
            if (res.data.errCode == 0) {
              wx.setStorage({
                key: 'user',
                data: {
                  accesstoken: wx.getStorageSync('user').accesstoken,
                  enddate: res.data.endDate,
                  email: wx.getStorageSync('user').email
                }
              })
            } else {
              wx.showModal({
                title: '接口调用失败',
                content: '错误码：' + res.data.errCode + '；错误信息：' + res.data.errMsg + '；修复方法：' + res.data.errFix,
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
      return
    }
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },
  onError: function (res) {
    wx.showModal({
      title: '错误',
      content: '可复制下面的错误信息，联系客服反馈\n' + res,
      confirmText: '复制',
      success(resa) {
        if (resa.confirm) {
          if (wx.getStorageSync('qxsetting').xrjtb != true) {
            wx.showModal({
              title: '提示',
              content: '“写入数据到剪贴板”权限未开启，无法使用此功能。如需使用此功能，请点击“确定”进入权限管理页面开启“写入数据到剪贴板”权限。',
              success(res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '../qxgl/qxgl'
                  })
                }
              }
            })
            return
          }
          wx.setClipboardData({
            data: res
          })
        }
      }
    })
  }
})