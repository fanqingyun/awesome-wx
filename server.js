// 这是一个服务器
const express = require('express')
const path = require('path')
const app = express()

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

// 配置理由
app.get('/index', async (req, res) => {
  // 获取access-token
  let noncestr, jsapi_ticket, timestamp, signature, url
  let wx = new WeChat()
  wx.fetchAccessToken().then(async result => {
    console.log(wx.access_token)
    // 获取ticket
    let tc = new Ticket()
    // tc.fetchTicket(wx.access_token).then(res => {
    //   console.log(res)
    // })
    await tc.fetchTicket(wx.access_token)
    // 验证jsapi_ticket
    noncestr = Math.random().toString(36).substr(2, 15)
    jsapi_ticket = tc.ticket
    timestamp = parseInt(Date.now() / 1000).toString()
    url = 'http://fqyweixin.free.idcfengye.com/index'
    signature = sha1([`jsapi_ticket=${jsapi_ticket}`, `noncestr=${noncestr}`, `timestamp=${timestamp}`, `url=${url}`].sort().join('&'))
    res.render('index', {noncestr, timestamp, signature})
    rp(
      {
        method: 'POST',
        url: ` https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${wx.access_token}`,
        json: true,
        body: {
          "button": [
            {
              "type": "click",
              "name": "云海",
              "key": "lover"
            },
            {
              "type": "click",
              "name": "他们",
              "key": "friends"
            },
            {
              "name": "它们",
              "sub_button": [
                {
                  "type": "view",
                  "name": "搜索",
                  "url": "http://www.soso.com/"
                },
                //  {
                //       "type":"miniprogram",
                //       "name":"wxa",
                //       "url":"http://mp.weixin.qq.com",
                //       "appid":"wx286b93c14bbf93aa",
                //       "pagepath":"pages/lunar/index"
                //   },
                {
                  "type": "click",
                  "name": "赞一下我们",
                  "key": "V1001_GOOD"
                }]
            }
          ]
        }
      }
    ).then(res => {
      console.log(res)
    }).catch(e => {
      console.log(`${e}`)
    })
  })
})
// 接收所有的请求
// 中间件
app.use(auth())


// 启动服务器
app.listen(9000, () => {
  console.log('服务器启动成功')
})



