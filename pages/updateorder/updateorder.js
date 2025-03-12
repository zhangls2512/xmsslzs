Page({
  data: {
    xs: false,
    theme: '',
    id: '',
    desc: '',
    count: 0,
    autoneworder: 'ari',
    autoneworderwz: 'CA建议',
    value: 0,
    array: ['CA建议', '即将到期', '关闭']
  },
  desc(e) {
    this.setData({
      count: e.detail.value.length
    })
  },
  picker(e) {
    var t = e.detail.value
    if (t == 0) {
      this.setData({
        autoneworder: 'ari',
        autoneworderwz: 'CA建议'
      })
    }
    if (t == 1) {
      this.setData({
        autoneworder: 'nearexpire',
        autoneworderwz: '即将到期'
      })
    }
    if (t == 2) {
      this.setData({
        autoneworder: 'close',
        autoneworderwz: '关闭'
      })
    }
  },
  onLoad(e) {
    if (e.id !== undefined) {
      this.setData({
        id: e.id
      })
    }
  },
  onShow() {
    var that = this
    that.setData({
      xs: false,
      theme: wx.getAppBaseInfo().theme,
      desc: '',
      autoneworder: 'ari',
      autoneworderwz: 'CA建议',
      value: 0
    })
    if (wx.getStorageSync('user').accesstoken) {
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
        url: 'https://api.zhangls2512.cn/ssl/getOrderInfo',
        method: 'POST',
        data: {
          accessToken: wx.getStorageSync('user').accesstoken,
          id: that.data.id
        },
        enableHttp2: true,
        enableQuic: true,
        useHighPerformanceMode: true,
        enableProfile: false,
        success(res) {
          wx.hideLoading()
          if (res.statusCode == 200) {
            if (res.data.errCode == 0) {
              const valuemap = {
                ari: 'CA建议',
                nearexpire: '即将到期',
                close: '关闭'
              }
              const namearray = ['ari', 'nearexpire', 'close']
              that.setData({
                desc: res.data.data.desc,
                count: res.data.data.desc.length,
                autoneworder: res.data.data.autoNewOrder,
                autoneworderwz: valuemap[res.data.data.autoNewOrder],
                value: namearray.indexOf(res.data.data.autoNewOrder)
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
  },
  xg() {
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
      title: '修改中',
      mask: true
    })
    wx.request({
      url: 'https://api.zhangls2512.cn/ssl/updateOrder',
      method: 'POST',
      data: {
        accessToken: wx.getStorageSync('user').accesstoken,
        id: that.data.id,
        desc: that.data.desc,
        autoNewOrder: that.data.autoneworder
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
})