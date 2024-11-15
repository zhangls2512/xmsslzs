Page({
  data: {
    theme: '',
    xs: false,
    yja: false,
    yjb: false,
    yjc: false,
    yjd: false,
    xrjtb: false,
    scfwq: false,
    scfwqa: false,
    scfwqb: false,
    scfwqc: false,
    scfwqd: false,
    scfwqe: false,
    scfwqf: false,
    scfwqg: false,
    scfwqh: false,
    scfwqi: false
  },
  onShow() {
    var that = this
    that.setData({
      theme: wx.getAppBaseInfo().theme,
      xs: false,
      yja: false,
      yjb: false,
      yjc: false,
      yjd: false,
      xrjtb: false,
      scfwq: false,
      scfwqa: false,
      scfwqb: false,
      scfwqc: false,
      scfwqd: false,
      scfwqe: false,
      scfwqf: false,
      scfwqg: false,
      scfwqh: false,
      scfwqi: false
    })
    if (wx.getStorageSync('qxsetting').lx == 'qx') {
      wx.getStorage({
        key: 'qxsetting',
        success(res) {
          var t = res.data
          that.setData({
            yja: t.yja,
            xrjtb: t.xrjtb,
            scfwq: t.scfwq,
            scfwqa: t.scfwqa,
            scfwqb: t.scfwqb,
            scfwqc: t.scfwqc,
            scfwqd: t.scfwqd,
            scfwqe: t.scfwqe,
            scfwqf: t.scfwqf,
            scfwqg: t.scfwqg,
            scfwqh: t.scfwqh,
            scfwqi: t.scfwqi
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
      url: 'https://api.dqmybkj.com/sslgetuserset',
      method: 'POST',
      data: {
        email: wx.getStorageSync('user').email,
        password: require('../../password').token()
      },
      useHighPerformanceMode: true,
      enableHttp2: true,
      enableProfile: false,
      enableQuic: true,
      success(res) {
        wx.hideLoading()
        if (res.statusCode == 200) {
          if (res.data.code == 0) {
            that.setData({
              yjb: res.data.setting.mailsqztbg,
              yjc: res.data.setting.mailzsdq,
              yjd: res.data.setting.mailsqedbg
            })
          } else {
            wx.showModal({
              title: '接口调用失败',
              content: '错误码：' + res.data.code + '；错误信息：' + res.data.msg,
              showCancel: false
            })
          }
        } else {
          wx.showToast({
            title: 'HTTP请求失败，错误码：' + res.statusCode,
            icon: 'none'
          })
        }
      }
    })
  },
  onUnload() {
    var t = this.data
    wx.setStorage({
      key: 'qxsetting',
      data: {
        lx: 'qx',
        yja: t.yja,
        xrjtb: t.xrjtb,
        scfwq: t.scfwq,
        scfwqa: t.scfwqa,
        scfwqb: t.scfwqb,
        scfwqc: t.scfwqc,
        scfwqd: t.scfwqd,
        scfwqe: t.scfwqe,
        scfwqf: t.scfwqf,
        scfwqg: t.scfwqg,
        scfwqh: t.scfwqh,
        scfwqi: t.scfwqi
      }
    })
  },
  tz() {
    this.router.navigateTo({
      url: '../mailset/mailset'
    })
  },
  fwxy() {
    wx.setClipboardData({
      data: 'https://docs.qq.com/doc/p/b0df80e716a22794683c027ed0733aee0a624bdd'
    })
  },
  ysbhzy() {
    wx.showActionSheet({
      itemList: ['完整版', '小程序通用版'],
      success(res) {
        if (res.tapIndex == 0) {
          wx.setClipboardData({
            data: 'https://docs.qq.com/doc/p/8729061cf62d78803bbc74c922973101d9c02fd5'
          })
        }
        if (res.tapIndex == 1) {
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
  yja(e) {
    var a = e.detail.value
    this.setData({
      yja: a
    })
  },
  xrjtb(e) {
    var a = e.detail.value
    this.setData({
      xrjtb: a
    })
  },
  scfwq(e) {
    var a = e.detail.value
    this.setData({
      scfwq: a
    })
  },
  scfwqa(e) {
    var a = e.detail.value
    this.setData({
      scfwqa: a
    })
  },
  scfwqb(e) {
    var a = e.detail.value
    this.setData({
      scfwqb: a
    })
  },
  scfwqc(e) {
    var a = e.detail.value
    this.setData({
      scfwqc: a
    })
  },
  scfwqd(e) {
    var a = e.detail.value
    this.setData({
      scfwqd: a
    })
  },
  scfwqe(e) {
    var a = e.detail.value
    this.setData({
      scfwqe: a
    })
  },
  scfwqf(e) {
    var a = e.detail.value
    this.setData({
      scfwqf: a
    })
  },
  scfwqg(e) {
    var a = e.detail.value
    this.setData({
      scfwqg: a
    })
  },
  scfwqh(e) {
    var a = e.detail.value
    this.setData({
      scfwqh: a
    })
  },
  scfwqi(e) {
    var a = e.detail.value
    this.setData({
      scfwqi: a
    })
  }
})