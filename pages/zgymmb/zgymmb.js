Page({
  data: {
    xs: false,
    theme: '',
    wz: '新增',
    yuming: [],
    ym: '',
    bz: '',
    id: '',
    count: 0,
    focus: true
  },
  onLoad(t) {
    var that = this
    if (t.id !== undefined) {
      that.setData({
        id: t.id,
        wz: '修改',
        focus: false
      })
      if (wx.getStorageSync('user').zt == true) {
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
          url: 'https://api.dqmybkj.com/sslgetymmbinfo',
          method: 'POST',
          data: {
            email: wx.getStorageSync('user').email,
            password: require('../../password').token(),
            id: t.id
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
                  yuming: res.data.data.yuming,
                  bz: res.data.data.bz,
                  count: res.data.data.bz.length
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
      }
    }
  },
  onShow() {
    var that = this
    that.setData({
      xs: false,
      theme: wx.getAppBaseInfo().theme
    })
    if (wx.getStorageSync('user').zt == true) {
      that.setData({
        xs: true
      })
    }
  },
  bz(e) {
    this.setData({
      count: e.detail.value.length
    })
  },
  ym() {
    if (this.data.ym != '') {
      if (this.data.yuming.length >= 10) {
        wx.showToast({
          title: '最多只能添加10个域名',
          icon: 'none'
        })
        return
      }
      var yuming = this.data.yuming
      yuming.push(this.data.ym)
      this.setData({
        ym: '',
        yuming: yuming
      })
    }
  },
  sc(e) {
    var index = e.currentTarget.dataset.index, yuming = this.data.yuming;
    yuming.splice(index, 1)
    this.setData({
      yuming: yuming
    })
  },
  tg() {
    var t = this.data, that = this;
    if (t.yuming.length == 0) {
      wx.showToast({
        title: '请添加域名',
        icon: 'error'
      })
      return
    }
    if (wx.getStorageSync('qxsetting').scfwq != true) {
      wx.showModal({
        title: '提示',
        content: '“上传数据并将其存储在服务器”权限未开启，无法使用此功能。如需使用此功能，请点击“确定”进入权限管理页面开启“上传数据并将其存储在服务器”权限。',
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
    if (wx.getStorageSync('qxsetting').scfwqi != true) {
      wx.showModal({
        title: '提示',
        content: '“上传数据并将其存储在服务器”权限的“新增、修改域名模板”场景未开启，无法使用此功能。如需使用此功能，请点击“确定”进入权限管理页面开启“上传数据并将其存储在服务器”权限的“新增、修改域名模板”场景。',
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
        url: 'https://api.dqmybkj.com/sslzgymmb',
        method: 'POST',
        data: {
          email: wx.getStorageSync('user').email,
          password: require('../../password').token(),
          yuming: t.yuming,
          bz: t.bz
        },
        useHighPerformanceMode: true,
        enableHttp2: true,
        enableProfile: false,
        enableQuic: true,
        success(res) {
          wx.hideLoading()
          if (res.statusCode == 200) {
            if (res.data.code == 0) {
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
    } else {
      wx.request({
        url: 'https://api.dqmybkj.com/sslzgymmb',
        method: 'POST',
        data: {
          email: wx.getStorageSync('user').email,
          password: require('../../password').token(),
          yuming: t.yuming,
          bz: t.bz,
          id: t.id
        },
        useHighPerformanceMode: true,
        enableHttp2: true,
        enableProfile: false,
        enableQuic: true,
        success(res) {
          wx.hideLoading()
          if (res.statusCode == 200) {
            if (res.data.code == 0) {
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
    }
  }
})