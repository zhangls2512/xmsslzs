Page({
	ck1() {
		this.pageRouter.navigateTo({
			url: '../lj/lj?id=' + encodeURIComponent('https://beian.miit.gov.cn/#/Integrated/recordQuery')
		})
	},
	ck2() {
		this.pageRouter.navigateTo({
			url: '../lj/lj?id=' + encodeURIComponent('https://beian.mps.gov.cn/#/query/appletSearch')
		})
	},
	ck3() {
		this.pageRouter.navigateTo({
			url: '../tscj/tscj'
		})
	},
	myblj(e) {
		var t = e.currentTarget.dataset.id
		this.pageRouter.navigateTo({
			url: '../lj/lj?id=' + encodeURIComponent('https://www.dqmybkj.com/#/jqcx?id=' + t)
		})
	}
})