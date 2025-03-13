Page({
  data: {
    lb: [],
    qx: false,
    theme: '',
    domain: '',
    options: ['全部', '待授权', '待提交', '已失效', '签发中', '已签发', '已过期'],
    status: '全部',
    value: 0
  },
  sr(e) {
    this.setData({
      domain: e.detail.value
    })
  },
  qk() {
    this.setData({
      domain: ''
    })
  },
  sx(e) {
    var t = e.detail.value
    if (t == '0') {
      this.setData({
        status: '全部'
      })
    }
    if (t == '1') {
      this.setData({
        status: 'pending'
      })
    }
    if (t == '2') {
      this.setData({
        status: 'ready'
      })
    }
    if (t == '3') {
      this.setData({
        status: 'invalid'
      })
    }
    if (t == '4') {
      this.setData({
        status: 'processing'
      })
    }
    if (t == '5') {
      this.setData({
        status: 'valid'
      })
    }
    if (t == '6') {
      this.setData({
        status: 'expired'
      })
    }
    this.hq()
  },
  onShow() {
    var that = this
    that.setData({
      lb: [],
      qx: false,
      theme: wx.getAppBaseInfo().theme
    })
    if (wx.getStorageSync('user').accesstoken) {
      that.setData({
        qx: true
      })
      that.hq()
    }
  },
  hq() {
    var app = getApp(), that = this;
    that.setData({
      lb: []
    })
    if (app.globalData.network == 'none') {
      wx.showToast({
        title: '无网络',
        icon: 'error'
      })
      return
    }
    wx.showLoading({
      title: '获取数据中',
      mask: true
    })
    wx.request({
      url: 'https://api.zhangls2512.cn/ssl/getOrderList',
      method: 'POST',
      data: {
        accessToken: wx.getStorageSync('user').accesstoken,
        domain: that.data.domain,
        status: that.data.status
      },
      enableHttp2: true,
      enableQuic: true,
      useHighPerformanceMode: true,
      enableProfile: false,
      success(res) {
        wx.hideLoading()
        if (res.statusCode == 200) {
          if (res.data.errCode == 0) {
            if (res.data.data.length == 0) {
              wx.showToast({
                title: '无数据',
                icon: 'error'
              })
              return
            }
            const moment = require('moment-timezone')
            that.setData({
              lb: res.data.data.map(item => ({
                ...item,
                createDate: moment(item.createDate).format('YYYY-MM-DD HH:mm:ss')
              }))
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
  },
  onReachBottom() {
    var that = this
    var app = getApp()
    if (app.globalData.network == 'none') {
      wx.showToast({
        title: '无网络',
        icon: 'error'
      })
      return
    }
    wx.showLoading({
      title: '获取更多数据',
      mask: true
    })
    wx.request({
      url: 'https://api.zhangls2512.cn/ssl/getOrderList',
      method: 'POST',
      data: {
        accessToken: wx.getStorageSync('user').accesstoken,
        domain: that.data.domain,
        status: that.data.status,
        skip: that.data.lb.length
      },
      enableHttp2: true,
      enableQuic: true,
      useHighPerformanceMode: true,
      enableProfile: false,
      success(res) {
        wx.hideLoading()
        if (res.statusCode == 200) {
          if (res.data.errCode == 0) {
            if (res.data.data.length == 0) {
              wx.showToast({
                title: '没有更多数据啦~',
                icon: 'none'
              })
              return
            }
            that.setData({
              lb: that.data.lb.concat(res.data.data.map(item => ({
                ...item,
                createDate: moment(item.createDate).format('YYYY-MM-DD HH:mm:ss')
              })))
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
  },
  onShareAppMessage() {
    return {
      title: '轩铭SSL证书，简单、便捷地申请免费DV SSL证书。',
      imageUrl: '../../image/fxfm.png'
    }
  },
  dl() {
    this.pageRouter.navigateTo({
      url: '../login/login'
    })
  },
  add() {
    this.pageRouter.navigateTo({
      url: '../neworder/neworder'
    })
  },
  info(e) {
    var id = e.currentTarget.dataset.id
    this.pageRouter.navigateTo({
      url: '../orderinfo/orderinfo?id=' + id
    })
  },
  auth(e) {
    var id = e.currentTarget.dataset.id
    this.pageRouter.navigateTo({
      url: '../authorization/authorization?id=' + id
    })
  },
  tj(e) {
    var id = e.currentTarget.dataset.id, that = this;
    var app = getApp()
    if (app.globalData.network == 'none') {
      wx.showToast({
        title: '无网络',
        icon: 'error'
      })
      return
    }
    wx.showLoading({
      title: '提交中',
      mask: true
    })
    wx.request({
      url: 'https://api.zhangls2512.cn/ssl/submitOrder',
      method: 'POST',
      data: {
        accessToken: wx.getStorageSync('user').accesstoken,
        id: id
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
              title: '提交成功'
            })
            setTimeout(() => {
              that.onShow()
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
  },
  xg(e) {
    var id = e.currentTarget.dataset.id
    this.pageRouter.navigateTo({
      url: '../updateorder/updateorder?id=' + id
    })
  },
  sc(e) {
    var id = e.currentTarget.dataset.id, that = this;
    wx.showModal({
      title: '提示',
      content: '删除后无法恢复，确定删除？',
      success(res) {
        if (res.confirm) {
          var app = getApp()
          if (app.globalData.network == 'none') {
            wx.showToast({
              title: '无网络',
              icon: 'error'
            })
            return
          }
          wx.showLoading({
            title: '删除中',
            mask: true
          })
          wx.request({
            url: 'https://api.zhangls2512.cn/ssl/deleteOrder',
            method: 'POST',
            data: {
              accessToken: wx.getStorageSync('user').accesstoken,
              id: id
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
                    title: '删除成功'
                  })
                  setTimeout(() => {
                    that.onShow()
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
  }
})