App({
  globalData: {
    network: ''
  },
  onLaunch() {
    var that = this
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
    if (wx.getStorageSync('user').zt == true) {
      return
    }
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },
  onError: function (res) {
    wx.showModal({
      title: '提示',
      content: '发生错误，错误信息：' + res,
      confirmText: '反馈',
      success(res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/help/help'
          })
        }
      }
    })
  }
})