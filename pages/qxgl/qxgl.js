Page({
  data: {
    theme: '',
    xs: false,
    xrjtb: false
  },
  onShow() {
    var that = this
    that.setData({
      theme: wx.getAppBaseInfo().theme,
      xs: false,
      xrjtb: false
    })
    if (wx.getStorageSync('qxsetting').lx == 'qx') {
      wx.getStorage({
        key: 'qxsetting',
        success(res) {
          var t = res.data
          that.setData({
            xrjtb: t.xrjtb
          })
        }
      })
    }
    if (wx.getStorageSync('user').zt != true) {
      return
    }
    that.setData({
      xs: true
    })
  },
  onUnload() {
    var t = this.data
    wx.setStorage({
      key: 'qxsetting',
      data: {
        lx: 'qx',
        xrjtb: t.xrjtb
      }
    })
  },
  ysbhzy() {
    var app = getApp()
    if (app.globalData.network == 'none') {
      wx.showToast({
        title: '无网络',
        icon: 'error'
      })
      return
    }
    wx.openPrivacyContract()
  },
  xrjtb(e) {
    var a = e.detail.value
    this.setData({
      xrjtb: a
    })
  }
})