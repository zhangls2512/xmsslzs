Page({
  data: {
    xs: false,
    theme: '',
    fs: '经典',
    fsarray: ['经典', 'CSR'],
    lb: [],
    domains: [],
    domain: '',
    csr: '',
    xzmb: false,
    mbdesc: '',
    mbdesccount: 0,
    orderdesc: '',
    orderdesccount: 0,
    keytype: 'rsa',
    keytypewz: 'RSA',
    keytypearray: ['RSA', 'ECDSA'],
    rsakeysize: 2048,
    rsakeysizearray: [2048, 3072, 4096],
    ecdsakeysize: 'prime256v1',
    ecdsakeysizearray: ['prime256v1', 'secp384r1'],
    environmenttype: 'production',
    environmenttypewz: '正式',
    environmenttypearray: ['正式', '测试'],
    certificatetype: 'classic',
    certificatetypewz: '经典',
    certificatetypearray: ['经典', '短期', 'TLS服务器', 'TLS客户端'],
    autoneworder: 'ari',
    autoneworderwz: 'CA建议',
    autoneworderarray: ['CA建议', '即将到期', '关闭']
  },
  onShow() {
    var that = this
    that.setData({
      xs: false,
      theme: wx.getAppBaseInfo().theme,
      lb: []
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
        url: 'https://api.zhangls2512.cn/ssl/getTemplateList',
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
              that.setData({
                lb: res.data.data
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
  yc() {
    this.setData({
      lb: []
    })
  },
  tr(e) {
    var domains = e.currentTarget.dataset.domains
    this.setData({
      domains: domains
    })
  },
  kg(e) {
    var a = e.detail.value
    this.setData({
      xzmb: a
    })
  },
  mbdesc(e) {
    this.setData({
      mbdesccount: e.detail.value.length
    })
  },
  orderdesc(e) {
    this.setData({
      orderdesccount: e.detail.value.length
    })
  },
  domain() {
    var t = this.data
    if (t.domain) {
      if (t.domains.length >= 100) {
        wx.showToast({
          title: '最多只能添加100个域名/IP地址',
          icon: 'none'
        })
        return
      }
      if (t.domains.includes(t.domain)) {
        wx.showToast({
          title: '域名/IP地址已存在',
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
  fspicker(e) {
    var t = e.detail.value
    if (t == 0) {
      this.setData({
        fs: '经典'
      })
    }
    if (t == 1) {
      this.setData({
        fs: 'CSR'
      })
    }
  },
  keytypepicker(e) {
    var t = e.detail.value
    if (t == 0) {
      this.setData({
        keytype: 'rsa',
        keytypewz: 'RSA'
      })
    }
    if (t == 1) {
      this.setData({
        keytype: 'ecdsa',
        keytypewz: 'ECDSA'
      })
    }
  },
  rsakeysizepicker(e) {
    var t = e.detail.value
    if (t == 0) {
      this.setData({
        rsakeysize: 2048
      })
    }
    if (t == 1) {
      this.setData({
        rsakeysize: 3072
      })
    }
    if (t == 2) {
      this.setData({
        rsakeysize: 4096
      })
    }
  },
  ecdsakeysizepicker(e) {
    var t = e.detail.value
    if (t == 0) {
      this.setData({
        ecdsakeysize: 'prime256v1'
      })
    }
    if (t == 1) {
      this.setData({
        ecdsakeysize: 'secp384r1'
      })
    }
  },
  environmenttypepicker(e) {
    var t = e.detail.value
    if (t == 0) {
      this.setData({
        environmenttype: 'production',
        environmenttypewz: '正式'
      })
    }
    if (t == 1) {
      this.setData({
        environmenttype: 'staging',
        environmenttypewz: '测试'
      })
    }
  },
  certificatetypepicker(e) {
    var t = e.detail.value
    if (t == 0) {
      this.setData({
        certificatetype: 'classic',
        certificatetypewz: '经典'
      })
    }
    if (t == 1) {
      this.setData({
        certificatetype: 'shortlived',
        certificatetypewz: '短期'
      })
    }
    if (t == 2) {
      this.setData({
        certificatetype: 'tlsserver',
        certificatetypewz: 'TLS服务器'
      })
    }
    if (t == 3) {
      this.setData({
        certificatetype: 'tlsclient',
        certificatetypewz: 'TLS客户端'
      })
    }
  },
  autoneworderpicker(e) {
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
  xz() {
    var t = this.data, that = this;
    if (t.fs == 'CSR' && t.csr.length == 0) {
      wx.showToast({
        title: '请填写CSR',
        icon: 'error'
      })
      return
    }
    if (t.fs == '经典' && t.domains.length == 0) {
      wx.showToast({
        title: '请添加域名/IP地址',
        icon: 'none'
      })
      return
    }
    if (t.fs != '经典' && t.domains.length > 25) {
      wx.showToast({
        title: '非经典证书类型最多仅支持添加25个域名/IP地址',
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
    let keysize = ''
    if (t.keytype == 'rsa') {
      keysize = t.rsakeysize
    }
    if (t.keytype == 'ecdsa') {
      keysize = t.ecdsakeysize
    }
    wx.showLoading({
      title: '新增中',
      mask: true
    })
    wx.cloud.callFunction({
      name: 'newSslOrder',
      data: {
        accessToken: wx.getStorageSync('user').accesstoken,
        csr: t.csr,
        domains: t.domains,
        desc: t.orderdesc,
        keyType: t.keytype,
        keySize: keysize,
        environmentType: t.environmenttype,
        certificateType: t.certificatetype,
        autoNewOrder: t.autoneworder
      },
      success(res) {
        wx.hideLoading()
        if (res.result.errCode == 0) {
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
            content: '错误码：' + res.result.errCode + '；错误信息：' + res.result.errMsg + '；修复方法：' + res.result.errFix,
            confirmText: '确定',
            showCancel: false
          })
        }
      }
    })
    if (t.xzmb == true && t.fs == '经典') {
      wx.request({
        url: 'https://api.zhangls2512.cn/ssl/newTemplate',
        method: 'POST',
        data: {
          accessToken: wx.getStorageSync('user').accesstoken,
          domains: t.domains,
          desc: t.mbdesc
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