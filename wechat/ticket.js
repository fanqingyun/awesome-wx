const Wechat = require('./wechat')
const rp = require('request-promise-native')
//引入fs模块
const { writeFile, readFile } = require('fs')
class Ticket {
  constructor() {

  }
  getTicket (token) {
    return new Promise(async (resolve, reject) => {
      // const token = await (new Wechat()).fetchAccessToken()
      console.log('来着')
      console.log(token)
      const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`
      rp({
        method: 'GET',
        url,
        json: true
      }).then(res => {
        console.log(res)
        res.expires_in = Date.now() + (res.expires_in - 5 * 60) * 1000
        resolve(res)
      }).catch(e => {
        reject(e)
      })
    })
  }
  saveTicket (ticket) {
    return new Promise((resolve, reject) => {
      writeFile('./wechat/ticket.txt', JSON.stringify(ticket), err => {
        if (!err) {
          console.log('保存成功票据')
          resolve()
        } else {
          console.log(`保存失败l${err}`)
          reject()
        }
      })
    })
  }
  readTicket () {
    return new Promise((resolve, reject) => {
      readFile('./wechat/ticket.txt', (err, data) => {
        if (!err) {
          console.log('读取成功')
          resolve(JSON.parse(data))
        } else {
          console.log(`读取失败l1${err}`)
          reject()
        }
      })
    })
  }
  isValidTicket (data = this) {
    if (!data || !data.ticket || !data.expires_in) {
      return false
    }
    return data.expires_in > Date.now()
  }
  fetchTicket (token) {
    if (this.isValidTicket()) {
      return Promise.resolve({
        ticket: this.ticket,
        expires_in: this.expires_in
      })
    }
    return this.readTicket()
      .then(async res => {
        if (this.isValidTicket(res)) {
          return Promise.resolve(res)
        } else {
          const res = await this.getTicket(token)
          await this.saveTicket(res)
          return Promise.resolve(res)
        }
      })
      .catch(async err => {
        const res = await this.getTicket(token)
        await this.saveTicket(res)
        return Promise.resolve(res)
      })
      .then(res => {
        this.ticket = res.ticket
        this.expires_in = res.expires_in
        return Promise.resolve(res)
      })
  }
}

module.exports = Ticket