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
    if (!that.data.lj) {
      wx.showToast({
        title: '进入场景错误',
        icon: 'error'
      })
      return
    }
    if (wx.getStorageSync('qxsetting').xrjtb != true) {
      wx.showModal({
        title: '提示',
        content: '“写入数据到剪贴板”权限未开启，无法使用此功能。如需使用此功能，请点击“确定”进入权限管理页面开启“写入数据到剪贴板”权限。',
        confirmText: '确定',
        success(res) {
          if (res.confirm) {
            that.router.navigateTo({
              url: '../qxgl/qxgl'
            })
          }
        }
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