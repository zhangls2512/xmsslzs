Page({
  data: {
    lb: [],
    qx: false,
    theme: ''
  },
  time(time) {
    const date = new Date(time)
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0') + ' ' + String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0') + ':' + String(date.getSeconds()).padStart(2, '0')
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
      var app = getApp()
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
        url: 'https://api.zhangls2512.cn/ssl/getPayOrderList',
        method: 'POST',
        data: {
          accessToken: wx.getStorageSync('user').accesstoken
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
              that.setData({
                lb: res.data.data.map(item => {
                  return {
                    ...item,
                    createTime: that.time(item.createTime),
                    finishTime: that.time(item.finishTime)
                  }
                })
              })
            } else {
              wx.showModal({
                title: '接口调用失败',
                content: '错误码：' + res.data.errCode + '；错误信息：' + res.data.errMsg + '；修复方法：' + res.data.errFix,
                confirmText: '确定',
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
  },
  onPullDownRefresh() {
    this.onShow()
    wx.stopPullDownRefresh()
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
      url: 'https://api.zhangls2512.cn/ssl/getPayOrderList',
      method: 'POST',
      data: {
        accessToken: wx.getStorageSync('user').accesstoken,
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
              lb: that.data.lb.concat(res.data.data.map(item => {
                return {
                  ...item,
                  createTime: that.time(item.createTime),
                  finishTime: that.time(item.finishTime)
                }
              }))
            })
          } else {
            wx.showModal({
              title: '接口调用失败',
              content: '错误码：' + res.data.errCode + '；错误信息：' + res.data.errMsg + '；修复方法：' + res.data.errFix,
              confirmText: '确定',
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
  dl() {
    this.pageRouter.navigateTo({
      url: '../login/login'
    })
  },
  sc(e) {
    var id = e.currentTarget.dataset.id, that = this;
    wx.showModal({
      title: '提示',
      content: '删除成功后无法恢复，确定删除？',
      confirmText: '确定',
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
            url: 'https://api.zhangls2512.cn/ssl/deletePayOrder',
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
                    confirmText: '确定',
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