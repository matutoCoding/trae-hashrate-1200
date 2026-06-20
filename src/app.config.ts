export default defineAppConfig({
  pages: [
    'pages/drug/index',
    'pages/stockout/index',
    'pages/approval/index',
    'pages/distribution/index',
    'pages/drugDetail/index',
    'pages/stockIn/index',
    'pages/stockOutApply/index',
    'pages/approvalDetail/index',
    'pages/distributionRecord/index',
    'pages/qualificationReview/index',
    'pages/warningList/index',
    'pages/routerConfig/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#00B42A',
    navigationBarTitleText: '慈善药品发放系统',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F5F6F7'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#00B42A',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/drug/index',
        text: '药品批次'
      },
      {
        pagePath: 'pages/stockout/index',
        text: '效期出库'
      },
      {
        pagePath: 'pages/approval/index',
        text: '分支审批'
      },
      {
        pagePath: 'pages/distribution/index',
        text: '发放登记'
      }
    ]
  }
})
