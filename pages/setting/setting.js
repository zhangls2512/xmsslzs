Page({
  data: {
    theme: '',
    dl: false
  },
  onShow() {
    var that = this
    that.setData({
      theme: wx.getAppBaseInfo().theme,
      dl: false
    })
    if (wx.getStorageSync('user').accesstoken) {
      that.setData({
        dl: true
      })
    }
  },
  bdzh() {
    this.router.navigateTo({
      url: '../bindaccount/bindaccount'
    })
  },
  qhzh() {
    this.router.navigateTo({
      url: '../login/login'
    })
  },
  noticeset() {
    this.router.navigateTo({
      url: '../noticeset/noticeset'
    })
  },
  functionset() {
    this.router.navigateTo({
      url: '../functionset/functionset'
    })
  },
  qxgl() {
    this.router.navigateTo({
      url: '../qxgl/qxgl'
    })
  },
  qxsyqd() {
    this.router.navigateTo({
      url: '../qxsyqd/qxsyqd'
    })
  },
  grxxqd() {
    this.router.navigateTo({
      url: '../grxxqd/grxxqd'
    })
  },
  guanyu() {
    this.router.navigateTo({
      url: '../guanyu/guanyu'
    })
  },
  help() {
    this.router.navigateTo({
      url: '../help/help'
    })
  },
  tc() {
    var that = this
    if (that.data.dl == true) {
      wx.showActionSheet({
        itemList: ['退出登录', '关闭轩铭SSL证书'],
        success(res) {
          if (res.tapIndex == 0) {
            wx.removeStorage({
              key: 'user',
              success() {
                that.onShow()
                that.router.navigateBack({
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
          }
          if (res.tapIndex == 1) {
            wx.exitMiniProgram()
          }
        }
      })
      return
    }
    wx.exitMiniProgram()
  }
})