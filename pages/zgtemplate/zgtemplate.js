Page({
  data: {
    xs: false,
    theme: '',
    id: '',
    wz: '新增',
    domains: [],
    domain: '',
    desc: '',
    count: 0,
    focus: true
  },
  onLoad(e) {
    var that = this
    if (e.id !== undefined) {
      that.setData({
        id: e.id,
        wz: '修改',
        focus: false
      })
      if (wx.getStorageSync('user').accesstoken) {
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
          url: 'https://api.zhangls2512.cn/ssl/getTemplateInfo',
          method: 'POST',
          data: {
            accessToken: wx.getStorageSync('user').accesstoken,
            id: e.id
          },
          enableHttp2: true,
          enableQuic: true,
          useHighPerformanceMode: true,
          enableProfile: false,
          success(res) {
            wx.hideLoading()
            if (res.statusCode == 200) {
              if (res.data.errCode == 0) {
                that.setData({
                  domains: res.data.data.domains,
                  desc: res.data.data.desc,
                  count: res.data.data.desc.length
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
      }
    }
  },
  onShow() {
    var that = this
    that.setData({
      xs: false,
      theme: wx.getAppBaseInfo().theme
    })
    if (wx.getStorageSync('user').accesstoken) {
      that.setData({
        xs: true
      })
    }
  },
  desc(e) {
    this.setData({
      count: e.detail.value.length
    })
  },
  tj() {
    var t = this.data
    if (t.domain != '') {
      if (t.domains.length >= 100) {
        wx.showToast({
          title: '最多只能添加100个域名/IP地址',
          icon: 'none'
        })
        return
      }
      t.domains.push(t.domain)
      this.setData({
        domain: '',
        domains: t.domains
      })
    }
  },
  sc(e) {
    var index = e.currentTarget.dataset.index, domains = this.data.domains;
    domains.splice(index, 1)
    this.setData({
      domains: domains
    })
  },
  add() {
    var t = this.data, that = this;
    if (t.domains.length == 0) {
      wx.showToast({
        title: '请添加域名/IP地址',
        icon: 'none'
      })
      return
    }
    var app = getApp()
    if (app.globalData.network == 'none') {
      wx.showToast({
        title: '无网络',
        icon: 'error'
      })
      return
    }
    wx.showLoading({
      title: t.wz + '中',
      mask: true
    })
    if (t.id == '') {
      wx.request({
        url: 'https://api.zhangls2512.cn/ssl/newTemplate',
        method: 'POST',
        data: {
          accessToken: wx.getStorageSync('user').accesstoken,
          domains: t.domains,
          desc: t.desc
        },
        enableHttp2: true,
        enableQuic: true,
        useHighPerformanceMode: true,
        enableProfile: false,
        success(res) {
          wx.hideLoading()
          if (res.statusCode == 200) {
            if (res.data.errCode == 0) {
              wx.showToast({
                title: '新增成功'
              })
              setTimeout(() => {
                that.router.navigateBack({
                  delta: 1,
                  fail() {
                    wx.showToast({
                      title: '错误',
                      icon: 'error'
                    })
                  }
                })
              }, 1500)
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
    } else {
      wx.request({
        url: 'https://api.zhangls2512.cn/ssl/updateTemplate',
        method: 'POST',
        data: {
          accessToken: wx.getStorageSync('user').accesstoken,
          id: t.id,
          domains: t.domains,
          desc: t.desc
        },
        enableHttp2: true,
        enableQuic: true,
        useHighPerformanceMode: true,
        enableProfile: false,
        success(res) {
          wx.hideLoading()
          if (res.statusCode == 200) {
            if (res.data.errCode == 0) {
              wx.showToast({
                title: '修改成功'
              })
              setTimeout(() => {
                that.router.navigateBack({
                  delta: 1,
                  fail() {
                    wx.showToast({
                      title: '错误',
                      icon: 'error'
                    })
                  }
                })
              }, 1500)
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
    }
  }
})