const sha1 = require('sha1')
const config = require('../config')
const { token } = config
const Tool = require('../utils/tool')
const Robot = require('./robot')
// 微信服务器会向项目服务器发送2种请求，post和get,get请求用于验证服务器的有效性
// 验证签名
module.exports = () => {
  return async (req, res, next) => {
    const { signature, echostr, timestamp, nonce } = req.query
    // 进行字典排序并拼接,sha1加密
    let str = sha1([timestamp, nonce, token].sort().join(''))
    // 验证签名
    if (req.method === 'GET') {
      if (str === signature) {
        res.send(echostr)
        console.log('连接成功')
      } else {
        res.end('error')
        console.log('连接失败')
      }
    } else if (req.method === 'POST') {
      if (str !== signature) {
        res.end('error')
      } else {
        let xmlData = await Tool.getUserDataAsync(req)
        let jsData = await Tool.parseXMLAsync(xmlData)
        let message = Tool.formatMessage(jsData)
        console.log(message)
        if (message.MsgType === 'event') {
          msg = `<xml><ToUserName><![CDATA[${message.FromUserName}]]></ToUserName><FromUserName><![CDATA[${message.ToUserName}]]></FromUserName><CreateTime>${Date.now()}</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[功能正在开发中，敬请期待哦]]></Content></xml>`
          res.send(msg)
        } else {
          let msg = await Robot(message)
          res.send(msg)
        }
      }
    }
  }
}