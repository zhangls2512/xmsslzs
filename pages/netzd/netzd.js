Page({
  data: {
    load: false,
    ky: false,
    bwz: '开始检测',
    data: '',
    profile: '',
    statuscode: '',
    hs: '',
    hsa: 0
  },
  start() {
    var that = this
    var app = getApp()
    if (app.globalData.network == 'none') {
      wx.showToast({
        title: '无网络',
        icon: 'error'
      })
      return
    }
    that.setData({
      load: true,
      ky: true,
      bwz: '检测中',
      data: '',
      profile: '',
      statuscode: '',
      hs: '',
      hsa: Date.now()
    })
    wx.request({
      url: 'https://api.zhangls2512.cn/test',
      method: 'GET',
      enableHttp2: true,
      enableQuic: true,
      useHighPerformanceMode: true,
      enableProfile: true,
      success(res) {
        that.setData({
          load: false,
          ky: false,
          bwz: '开始检测',
          data: res.data,
          profile: res.profile,
          statuscode: res.statusCode,
          hs: Date.now() - that.data.hsa
        })
        wx.showToast({
          title: '检测完成'
        })
      }
    })
  }
})