Page({
  cjwt() {
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
    wx.openEmbeddedMiniProgram({
      appId: 'wx8abaf00ee8c3202e',
      allowFullScreen: true,
      path: 'scenes/embed__faqs-more/index',
      extraData: {
        id: '672719'
      },
      complete() {
        wx.hideLoading()
      }
    })
  },
  sq() {
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
    wx.openEmbeddedMiniProgram({
      appId: 'wx8abaf00ee8c3202e',
      allowFullScreen: true,
      extraData: {
        id: '672719'
      },
      complete() {
        wx.hideLoading()
      }
    })
  }
})