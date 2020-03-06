// 这是一个服务器
const express = require('express')

const app = express()

const auth = require('./wechat/auth')

// const wechat = require('./wechat/wechat')
const WeChat = require('./wechat/wechat')
// 验证服务器的有效性(验证签名)
// 接收所有的请求
// 中间件
app.use(auth())

// 获取access-token
// let wx = new WeChat()
// wx.fetchAccessToken().then(res => {
//   console.log(wx.access_token)
// })
// wx.fetchAccessToken().then(res => {
//   console.log(wx.access_token)
// })
// 启动服务器
app.listen(9000, () => {
  console.log('服务器启动成功')
})