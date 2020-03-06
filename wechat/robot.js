const MD5 = require('md5')
const rp = require('request-promise-native')
module.exports = (message) => {
  return new Promise((resolve, reject) => {
    // 聊天机器人：
    const APPID = 2129702408
    const APPKEY = 'CsR18fCoCn1OArIf'
    // 请求聊天的接口所需要的参数
    let params = {
      app_id: APPID,
      time_stamp: (Date.now() / 1000).toFixed(0),
      nonce_str: Math.random().toString(36).slice(-5),
      session: 10000,
      question: message.Content
    }
    // 根据key进行字典排序
    let arr = Object.keys(params).sort()
    let newParams = {}
    for (let index = 0; index < arr.length; index++) {
      newParams[arr[index]] = params[arr[index]]
    }
    let str = ''
    for (let key in newParams) {
      str += `${key}=${encodeURI(newParams[key])}&`
    }
    str += `app_key=${APPKEY}`
    params['sign'] = MD5(str).toUpperCase()
    const url = 'https://api.ai.qq.com/fcgi-bin/nlp/nlp_textchat'
    let content = ''
    rp(
      {
        method: 'POST',
        url,
        json: true,
        headers: {
          "content-type": "application/json",
        },
        form: params
      }
    ).then(result => {
      content = result.data.answer
      let msg = `<xml><ToUserName><![CDATA[${message.FromUserName}]]></ToUserName><FromUserName><![CDATA[${message.ToUserName}]]></FromUserName><CreateTime>${Date.now()}</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[${content}]]></Content></xml>`
      resolve(msg)
      // res.send(msg)
    }).catch(e => {
      reject(e)
      // res.end('error')
    })
  })
}