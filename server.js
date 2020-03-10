// 这是一个服务器
const express = require('express')
const path = require('path')
const app = express()
const { token, appID } = require('./config')

const auth = require('./wechat/auth')
const rp = require('request-promise-native')
const sha1 = require('sha1')
// const wechat = require('./wechat/wechat')
const WeChat = require('./wechat/wechat')
const Ticket = require('./wechat/ticket')
// 验证服务器的有效性(验证签名)

// 配置模板引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
let wx = new WeChat()
// wx.fetchAccessToken().then(async (res) => {
//   console.log(res)
//   console.log(`token${wx.access_token}`)
//   let delres = await rp({
//     method: 'GET',
//     url: `https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=${wx.access_token}`,
//     json: true
//   })
//   console.log(`删除：${delres}`)
//   rp(
//     {
//       method: 'POST',
//       url: ` https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${wx.access_token}`,
//       json: true,
//       body: {
//         "button": [
//           {
//             "type": "click",
//             "name": "云海",
//             "key": "lover"
//           },
//           {
//             "type": "view",
//             "name": "他们",
//             "url": "http://fqyweixin.free.idcfengye.com/index"
//           },
//           {
//             "name": "它们",
//             "sub_button": [
//               {
//                 "type": "view",
//                 "name": "搜索",
//                 "url": "http://fqyweixin.free.idcfengye.com/index"
//               },
//               //  {
//               //       "type":"miniprogram",
//               //       "name":"wxa",
//               //       "url":"http://mp.weixin.qq.com",
//               //       "appid":"wx286b93c14bbf93aa",
//               //       "pagepath":"pages/lunar/index"
//               //   },
//               {
//                 "type": "click",
//                 "name": "赞一下我们",
//                 "key": "V1001_GOOD"
//               }]
//           }
//         ]
//       }
//     }
//   ).then(res => {
//     console.log('菜单添加成功')
//   }).catch(e => {
//     console.log(`菜单添加失败`)
//   })
// })
// 接收所有的请求
// 配置理由
app.get('/index', async (req, res) => {
  // 获取access-token
  await wx.fetchAccessToken()
  let noncestr, jsapi_ticket, timestamp, signature, url
  console.log(wx.access_token)
  // 获取ticket
  let tc = new Ticket()
  await tc.fetchTicket(wx.access_token)
  // tc.fetchTicket(wx.access_token).then(res => {
  //   console.log(res)
  // })
  console.log(tc.ticket)
  // 验证jsapi_ticket
  noncestr = Math.random().toString(36).substr(2, 15)
  jsapi_ticket = tc.ticket
  timestamp = parseInt(Date.now() / 1000).toString()
  url = 'http://fqyweixin.free.idcfengye.com/index'
  signature = sha1([`jsapi_ticket=${jsapi_ticket}`, `noncestr=${noncestr}`, `timestamp=${timestamp}`, `url=${url}`].sort().join('&'))
  res.render('index', { noncestr, timestamp, signature })
})
app.get('/user', (req, res) => {
  res.render('user')
})
// 中间件
app.use(auth())


// 启动服务器
app.listen(9000, () => {
  console.log('服务器启动成功')
})



