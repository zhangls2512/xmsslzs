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
    if (wx.getStorageSync('user').zt == true) {
      that.setData({
        dl: true
      })
    }
  },
  xgmail() {
    this.router.navigateTo({
      url: '../xgmail/xgmail'
    })
  },
  xgmm() {
    this.router.navigateTo({
      url: '../xgmm/xgmm'
    })
  },
  qhzh() {
    this.router.navigateTo({
      url: '../login/login'
    })
  },
  zxzh() {
    this.router.navigateTo({
      url: '../zxzh/zxzh'
    })
  },
  mailset() {
    this.router.navigateTo({
      url: '../mailset/mailset'
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
  dsfqd() {
    this.pageRouter.navigateTo({
      url: '../lj/lj?id=' + encodeURIComponent('https://docs.qq.com/doc/p/ae7950dad455853978e458d8a6fa4920db39b6af')
    })
  },
  dsfsdk() {
    this.pageRouter.navigateTo({
      url: '../lj/lj?id=' + encodeURIComponent('https://docs.qq.com/doc/p/3f10d16c442bfe62564d8ba90e0b408f50e07956')
    })
  },
  yszcwj() {
    var that = this
    wx.showActionSheet({
      itemList: ['隐私保护指引摘要', '隐私保护指引（完整版）', '隐私保护指引（小程序通用版）'],
      success(res) {
        if (res.tapIndex == 0) {
          that.pageRouter.navigateTo({
            url: '../lj/lj?id=' + encodeURIComponent('https://docs.qq.com/doc/p/6a99249621620fc53bf1111bf2e04fade39f3083')
          })
        }
        if (res.tapIndex == 1) {
          that.pageRouter.navigateTo({
            url: '../lj/lj?id=' + encodeURIComponent('https://docs.qq.com/doc/p/8729061cf62d78803bbc74c922973101d9c02fd5')
          })
        }
        if (res.tapIndex == 2) {
          var app = getApp()
          if (app.globalData.network == 'none') {
            wx.showToast({
              title: '无网络',
              icon: 'error'
            })
            return
          }
          wx.openPrivacyContract()
        }
      }
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