Page({
  data: {
    lj: ''
  },
  onLoad(e) {
    if (e.id === undefined) {
      return
    }
    this.setData({
      lj: decodeURIComponent(e.id)
    })
  },
  fz() {
    var that = this
    if (that.data.lj == '') {
      wx.showToast({
        title: '进入场景错误',
        icon: 'error'
      })
      return
    }
    wx.setClipboardData({
      data: that.data.lj
    })
  },
  fh() {
    this.router.navigateBack({
      delta: 1,
      fail() {
        wx.showToast({
          title: '错误',
          icon: 'error'
        })
      }
    })
  }
})