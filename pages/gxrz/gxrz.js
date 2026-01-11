Page({
  gxrz() {
    this.pageRouter.navigateTo({
      url: '../lj/lj?id=' + encodeURIComponent('https://www.zhangls2512.cn/product/updatelog/sslwxxcx')
    })
  },
  onShareAppMessage() {
    return {
      title: '更新介绍'
    }
  },
  onShareTimeline() {
    return {
      title: '更新介绍'
    }
  }
})