module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1730283658250, function(require, module, exports) {
module.exports = {
  sm2: require('./sm2/index'),
  sm3: require('./sm3/index'),
  sm4: require('./sm4/index'),
}

}, function(modId) {var map = {"./sm2/index":1730283658251,"./sm3/index":1730283658256,"./sm4/index":1730283658257}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1730283658251, function(require, module, exports) {
/* eslint-disable no-use-before-define */
const {BigInteger} = require('jsbn')
const {encodeDer, decodeDer} = require('./asn1')
const _ = require('./utils')
const sm3 = require('./sm3').sm3

const {G, curve, n} = _.generateEcparam()
const C1C2C3 = 0

/**
 * 加密
 */
function doEncrypt(msg, publicKey, cipherMode = 1) {
  msg = typeof msg === 'string' ? _.hexToArray(_.utf8ToHex(msg)) : Array.prototype.slice.call(msg)
  publicKey = _.getGlobalCurve().decodePointHex(publicKey) // 先将公钥转成点

  const keypair = _.generateKeyPairHex()
  const k = new BigInteger(keypair.privateKey, 16) // 随机数 k

  // c1 = k * G
  let c1 = keypair.publicKey
  if (c1.length > 128) c1 = c1.substr(c1.length - 128)

  // (x2, y2) = k * publicKey
  const p = publicKey.multiply(k)
  const x2 = _.hexToArray(_.leftPad(p.getX().toBigInteger().toRadix(16), 64))
  const y2 = _.hexToArray(_.leftPad(p.getY().toBigInteger().toRadix(16), 64))

  // c3 = hash(x2 || msg || y2)
  const c3 = _.arrayToHex(sm3([].concat(x2, msg, y2)))

  let ct = 1
  let offset = 0
  let t = [] // 256 位
  const z = [].concat(x2, y2)
  const nextT = () => {
    // (1) Hai = hash(z || ct)
    // (2) ct++
    t = sm3([...z, ct >> 24 & 0x00ff, ct >> 16 & 0x00ff, ct >> 8 & 0x00ff, ct & 0x00ff])
    ct++
    offset = 0
  }
  nextT() // 先生成 Ha1

  for (let i = 0, len = msg.length; i < len; i++) {
    // t = Ha1 || Ha2 || Ha3 || Ha4
    if (offset === t.length) nextT()

    // c2 = msg ^ t
    msg[i] ^= t[offset++] & 0xff
  }
  const c2 = _.arrayToHex(msg)

  return cipherMode === C1C2C3 ? c1 + c2 + c3 : c1 + c3 + c2
}

/**
 * 解密
 */
function doDecrypt(encryptData, privateKey, cipherMode = 1, {
  output = 'string',
} = {}) {
  privateKey = new BigInteger(privateKey, 16)

  let c3 = encryptData.substr(128, 64)
  let c2 = encryptData.substr(128 + 64)

  if (cipherMode === C1C2C3) {
    c3 = encryptData.substr(encryptData.length - 64)
    c2 = encryptData.substr(128, encryptData.length - 128 - 64)
  }

  const msg = _.hexToArray(c2)
  const c1 = _.getGlobalCurve().decodePointHex('04' + encryptData.substr(0, 128))

  const p = c1.multiply(privateKey)
  const x2 = _.hexToArray(_.leftPad(p.getX().toBigInteger().toRadix(16), 64))
  const y2 = _.hexToArray(_.leftPad(p.getY().toBigInteger().toRadix(16), 64))

  let ct = 1
  let offset = 0
  let t = [] // 256 位
  const z = [].concat(x2, y2)
  const nextT = () => {
    // (1) Hai = hash(z || ct)
    // (2) ct++
    t = sm3([...z, ct >> 24 & 0x00ff, ct >> 16 & 0x00ff, ct >> 8 & 0x00ff, ct & 0x00ff])
    ct++
    offset = 0
  }
  nextT() // 先生成 Ha1

  for (let i = 0, len = msg.length; i < len; i++) {
    // t = Ha1 || Ha2 || Ha3 || Ha4
    if (offset === t.length) nextT()

    // c2 = msg ^ t
    msg[i] ^= t[offset++] & 0xff
  }

  // c3 = hash(x2 || msg || y2)
  const checkC3 = _.arrayToHex(sm3([].concat(x2, msg, y2)))

  if (checkC3 === c3.toLowerCase()) {
    return output === 'array' ? msg : _.arrayToUtf8(msg)
  } else {
    return output === 'array' ? [] : ''
  }
}

/**
 * 签名
 */
function doSignature(msg, privateKey, {
  pointPool, der, hash, publicKey, userId
} = {}) {
  let hashHex = typeof msg === 'string' ? _.utf8ToHex(msg) : _.arrayToHex(msg)

  if (hash) {
    // sm3杂凑
    publicKey = publicKey || getPublicKeyFromPrivateKey(privateKey)
    hashHex = getHash(hashHex, publicKey, userId)
  }

  const dA = new BigInteger(privateKey, 16)
  const e = new BigInteger(hashHex, 16)

  // k
  let k = null
  let r = null
  let s = null

  do {
    do {
      let point
      if (pointPool && pointPool.length) {
        point = pointPool.pop()
      } else {
        point = getPoint()
      }
      k = point.k

      // r = (e + x1) mod n
      r = e.add(point.x1).mod(n)
    } while (r.equals(BigInteger.ZERO) || r.add(k).equals(n))

    // s = ((1 + dA)^-1 * (k - r * dA)) mod n
    s = dA.add(BigInteger.ONE).modInverse(n).multiply(k.subtract(r.multiply(dA))).mod(n)
  } while (s.equals(BigInteger.ZERO))

  if (der) return encodeDer(r, s) // asn.1 der 编码

  return _.leftPad(r.toString(16), 64) + _.leftPad(s.toString(16), 64)
}

/**
 * 验签
 */
function doVerifySignature(msg, signHex, publicKey, {der, hash, userId} = {}) {
  let hashHex = typeof msg === 'string' ? _.utf8ToHex(msg) : _.arrayToHex(msg)

  if (hash) {
    // sm3杂凑
    hashHex = getHash(hashHex, publicKey, userId)
  }

  let r; let
    s
  if (der) {
    const decodeDerObj = decodeDer(signHex) // asn.1 der 解码
    r = decodeDerObj.r
    s = decodeDerObj.s
  } else {
    r = new BigInteger(signHex.substring(0, 64), 16)
    s = new BigInteger(signHex.substring(64), 16)
  }

  const PA = curve.decodePointHex(publicKey)
  const e = new BigInteger(hashHex, 16)

  // t = (r + s) mod n
  const t = r.add(s).mod(n)

  if (t.equals(BigInteger.ZERO)) return false

  // x1y1 = s * G + t * PA
  const x1y1 = G.multiply(s).add(PA.multiply(t))

  // R = (e + x1) mod n
  const R = e.add(x1y1.getX().toBigInteger()).mod(n)

  return r.equals(R)
}

/**
 * sm3杂凑算法
 */
function getHash(hashHex, publicKey, userId = '1234567812345678') {
  // z = hash(entl || userId || a || b || gx || gy || px || py)
  userId = _.utf8ToHex(userId)
  const a = _.leftPad(G.curve.a.toBigInteger().toRadix(16), 64)
  const b = _.leftPad(G.curve.b.toBigInteger().toRadix(16), 64)
  const gx = _.leftPad(G.getX().toBigInteger().toRadix(16), 64)
  const gy = _.leftPad(G.getY().toBigInteger().toRadix(16), 64)
  let px
  let py
  if (publicKey.length === 128) {
    px = publicKey.substr(0, 64)
    py = publicKey.substr(64, 64)
  } else {
    const point = G.curve.decodePointHex(publicKey)
    px = _.leftPad(point.getX().toBigInteger().toRadix(16), 64)
    py = _.leftPad(point.getY().toBigInteger().toRadix(16), 64)
  }
  const data = _.hexToArray(userId + a + b + gx + gy + px + py)

  const entl = userId.length * 4
  data.unshift(entl & 0x00ff)
  data.unshift(entl >> 8 & 0x00ff)

  const z = sm3(data)

  // e = hash(z || msg)
  return _.arrayToHex(sm3(z.concat(_.hexToArray(hashHex))))
}

/**
 * 计算公钥
 */
function getPublicKeyFromPrivateKey(privateKey) {
  const PA = G.multiply(new BigInteger(privateKey, 16))
  const x = _.leftPad(PA.getX().toBigInteger().toString(16), 64)
  const y = _.leftPad(PA.getY().toBigInteger().toString(16), 64)
  return '04' + x + y
}

/**
 * 获取椭圆曲线点
 */
function getPoint() {
  const keypair = _.generateKeyPairHex()
  const PA = curve.decodePointHex(keypair.publicKey)

  keypair.k = new BigInteger(keypair.privateKey, 16)
  keypair.x1 = PA.getX().toBigInteger()

  return keypair
}

module.exports = {
  generateKeyPairHex: _.generateKeyPairHex,
  compressPublicKeyHex: _.compressPublicKeyHex,
  comparePublicKeyHex: _.comparePublicKeyHex,
  doEncrypt,
  doDecrypt,
  doSignature,
  doVerifySignature,
  getPublicKeyFromPrivateKey,
  getPoint,
  verifyPublicKey: _.verifyPublicKey,
}

}, function(modId) { var map = {"./asn1":1730283658252,"./utils":1730283658253,"./sm3":1730283658255}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1730283658252, function(require, module, exports) {
/* eslint-disable class-methods-use-this */
const {BigInteger} = require('jsbn')

function bigintToValue(bigint) {
  let h = bigint.toString(16)
  if (h[0] !== '-') {
    // 正数
    if (h.length % 2 === 1) h = '0' + h // 补齐到整字节
    else if (!h.match(/^[0-7]/)) h = '00' + h // 非0开头，则补一个全0字节
  } else {
    // 负数
    h = h.substr(1)

    let len = h.length
    if (len % 2 === 1) len += 1 // 补齐到整字节
    else if (!h.match(/^[0-7]/)) len += 2 // 非0开头，则补一个全0字节

    let mask = ''
    for (let i = 0; i < len; i++) mask += 'f'
    mask = new BigInteger(mask, 16)

    // 对绝对值取反，加1
    h = mask.xor(bigint).add(BigInteger.ONE)
    h = h.toString(16).replace(/^-/, '')
  }
  return h
}

class ASN1Object {
  constructor() {
    this.tlv = null
    this.t = '00'
    this.l = '00'
    this.v = ''
  }

  /**
   * 获取 der 编码比特流16进制串
   */
  getEncodedHex() {
    if (!this.tlv) {
      this.v = this.getValue()
      this.l = this.getLength()
      this.tlv = this.t + this.l + this.v
    }
    return this.tlv
  }

  getLength() {
    const n = this.v.length / 2 // 字节数
    let nHex = n.toString(16)
    if (nHex.length % 2 === 1) nHex = '0' + nHex // 补齐到整字节

    if (n < 128) {
      // 短格式，以 0 开头
      return nHex
    } else {
      // 长格式，以 1 开头
      const head = 128 + nHex.length / 2 // 1(1位) + 真正的长度占用字节数(7位) + 真正的长度
      return head.toString(16) + nHex
    }
  }

  getValue() {
    return ''
  }
}

class DERInteger extends ASN1Object {
  constructor(bigint) {
    super()

    this.t = '02' // 整型标签说明
    if (bigint) this.v = bigintToValue(bigint)
  }

  getValue() {
    return this.v
  }
}

class DERSequence extends ASN1Object {
  constructor(asn1Array) {
    super()

    this.t = '30' // 序列标签说明
    this.asn1Array = asn1Array
  }

  getValue() {
    this.v = this.asn1Array.map(asn1Object => asn1Object.getEncodedHex()).join('')
    return this.v
  }
}

/**
 * 获取 l 占用字节数
 */
function getLenOfL(str, start) {
  if (+str[start + 2] < 8) return 1 // l 以0开头，则表示短格式，只占一个字节
  return +str.substr(start + 2, 2) & 0x7f + 1 // 长格式，取第一个字节后7位作为长度真正占用字节数，再加上本身
}

/**
 * 获取 l
 */
function getL(str, start) {
  // 获取 l
  const len = getLenOfL(str, start)
  const l = str.substr(start + 2, len * 2)

  if (!l) return -1
  const bigint = +l[0] < 8 ? new BigInteger(l, 16) : new BigInteger(l.substr(2), 16)

  return bigint.intValue()
}

/**
 * 获取 v 的位置
 */
function getStartOfV(str, start) {
  const len = getLenOfL(str, start)
  return start + (len + 1) * 2
}

module.exports = {
  /**
   * ASN.1 der 编码，针对 sm2 签名
   */
  encodeDer(r, s) {
    const derR = new DERInteger(r)
    const derS = new DERInteger(s)
    const derSeq = new DERSequence([derR, derS])

    return derSeq.getEncodedHex()
  },

  /**
   * 解析 ASN.1 der，针对 sm2 验签
   */
  decodeDer(input) {
    // 结构：
    // input = | tSeq | lSeq | vSeq |
    // vSeq = | tR | lR | vR | tS | lS | vS |
    const start = getStartOfV(input, 0)

    const vIndexR = getStartOfV(input, start)
    const lR = getL(input, start)
    const vR = input.substr(vIndexR, lR * 2)

    const nextStart = vIndexR + vR.length
    const vIndexS = getStartOfV(input, nextStart)
    const lS = getL(input, nextStart)
    const vS = input.substr(vIndexS, lS * 2)

    const r = new BigInteger(vR, 16)
    const s = new BigInteger(vS, 16)

    return {r, s}
  }
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1730283658253, function(require, module, exports) {
/* eslint-disable no-bitwise, no-mixed-operators, no-use-before-define, max-len */
const {BigInteger, SecureRandom} = require('jsbn')
const {ECCurveFp} = require('./ec')

const rng = new SecureRandom()
const {curve, G, n} = generateEcparam()

/**
 * 获取公共椭圆曲线
 */
function getGlobalCurve() {
  return curve
}

/**
 * 生成ecparam
 */
function generateEcparam() {
  // 椭圆曲线
  const p = new BigInteger('FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFF', 16)
  const a = new BigInteger('FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFC', 16)
  const b = new BigInteger('28E9FA9E9D9F5E344D5A9E4BCF6509A7F39789F515AB8F92DDBCBD414D940E93', 16)
  const curve = new ECCurveFp(p, a, b)

  // 基点
  const gxHex = '32C4AE2C1F1981195F9904466A39C9948FE30BBFF2660BE1715A4589334C74C7'
  const gyHex = 'BC3736A2F4F6779C59BDCEE36B692153D0A9877CC62A474002DF32E52139F0A0'
  const G = curve.decodePointHex('04' + gxHex + gyHex)

  const n = new BigInteger('FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFF7203DF6B21C6052B53BBF40939D54123', 16)

  return {curve, G, n}
}

/**
 * 生成密钥对：publicKey = privateKey * G
 */
function generateKeyPairHex(a, b, c) {
  const random = a ? new BigInteger(a, b, c) : new BigInteger(n.bitLength(), rng)
  const d = random.mod(n.subtract(BigInteger.ONE)).add(BigInteger.ONE) // 随机数
  const privateKey = leftPad(d.toString(16), 64)

  const P = G.multiply(d) // P = dG，p 为公钥，d 为私钥
  const Px = leftPad(P.getX().toBigInteger().toString(16), 64)
  const Py = leftPad(P.getY().toBigInteger().toString(16), 64)
  const publicKey = '04' + Px + Py

  return {privateKey, publicKey}
}

/**
 * 生成压缩公钥
 */
function compressPublicKeyHex(s) {
  if (s.length !== 130) throw new Error('Invalid public key to compress')

  const len = (s.length - 2) / 2
  const xHex = s.substr(2, len)
  const y = new BigInteger(s.substr(len + 2, len), 16)

  let prefix = '03'
  if (y.mod(new BigInteger('2')).equals(BigInteger.ZERO)) prefix = '02'

  return prefix + xHex
}

/**
 * utf8串转16进制串
 */
function utf8ToHex(input) {
  input = unescape(encodeURIComponent(input))

  const length = input.length

  // 转换到字数组
  const words = []
  for (let i = 0; i < length; i++) {
    words[i >>> 2] |= (input.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8)
  }

  // 转换到16进制
  const hexChars = []
  for (let i = 0; i < length; i++) {
    const bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
    hexChars.push((bite >>> 4).toString(16))
    hexChars.push((bite & 0x0f).toString(16))
  }

  return hexChars.join('')
}

/**
 * 补全16进制字符串
 */
function leftPad(input, num) {
  if (input.length >= num) return input

  return (new Array(num - input.length + 1)).join('0') + input
}

/**
 * 转成16进制串
 */
function arrayToHex(arr) {
  return arr.map(item => {
    item = item.toString(16)
    return item.length === 1 ? '0' + item : item
  }).join('')
}

/**
 * 转成utf8串
 */
function arrayToUtf8(arr) {
  const words = []
  let j = 0
  for (let i = 0; i < arr.length * 2; i += 2) {
    words[i >>> 3] |= parseInt(arr[j], 10) << (24 - (i % 8) * 4)
    j++
  }

  try {
    const latin1Chars = []

    for (let i = 0; i < arr.length; i++) {
      const bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
      latin1Chars.push(String.fromCharCode(bite))
    }

    return decodeURIComponent(escape(latin1Chars.join('')))
  } catch (e) {
    throw new Error('Malformed UTF-8 data')
  }
}

/**
 * 转成字节数组
 */
function hexToArray(hexStr) {
  const words = []
  let hexStrLength = hexStr.length

  if (hexStrLength % 2 !== 0) {
    hexStr = leftPad(hexStr, hexStrLength + 1)
  }

  hexStrLength = hexStr.length

  for (let i = 0; i < hexStrLength; i += 2) {
    words.push(parseInt(hexStr.substr(i, 2), 16))
  }
  return words
}

/**
 * 验证公钥是否为椭圆曲线上的点
 */
function verifyPublicKey(publicKey) {
  const point = curve.decodePointHex(publicKey)
  if (!point) return false

  const x = point.getX()
  const y = point.getY()

  // 验证 y^2 是否等于 x^3 + ax + b
  return y.square().equals(x.multiply(x.square()).add(x.multiply(curve.a)).add(curve.b))
}

/**
 * 验证公钥是否等价，等价返回true
 */
function comparePublicKeyHex(publicKey1, publicKey2) {
  const point1 = curve.decodePointHex(publicKey1)
  if (!point1) return false

  const point2 = curve.decodePointHex(publicKey2)
  if (!point2) return false

  return point1.equals(point2)
}

module.exports = {
  getGlobalCurve,
  generateEcparam,
  generateKeyPairHex,
  compressPublicKeyHex,
  utf8ToHex,
  leftPad,
  arrayToHex,
  arrayToUtf8,
  hexToArray,
  verifyPublicKey,
  comparePublicKeyHex,
}

}, function(modId) { var map = {"./ec":1730283658254}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1730283658254, function(require, module, exports) {
/* eslint-disable no-case-declarations, max-len */
const {BigInteger} = require('jsbn')

/**
 * thanks for Tom Wu : http://www-cs-students.stanford.edu/~tjw/jsbn/
 *
 * Basic Javascript Elliptic Curve implementation
 * Ported loosely from BouncyCastle's Java EC code
 * Only Fp curves implemented for now
 */

const TWO = new BigInteger('2')
const THREE = new BigInteger('3')

/**
 * 椭圆曲线域元素
 */
class ECFieldElementFp {
  constructor(q, x) {
    this.x = x
    this.q = q
    // TODO if (x.compareTo(q) >= 0) error
  }

  /**
   * 判断相等
   */
  equals(other) {
    if (other === this) return true
    return (this.q.equals(other.q) && this.x.equals(other.x))
  }

  /**
   * 返回具体数值
   */
  toBigInteger() {
    return this.x
  }

  /**
   * 取反
   */
  negate() {
    return new ECFieldElementFp(this.q, this.x.negate().mod(this.q))
  }

  /**
   * 相加
   */
  add(b) {
    return new ECFieldElementFp(this.q, this.x.add(b.toBigInteger()).mod(this.q))
  }

  /**
   * 相减
   */
  subtract(b) {
    return new ECFieldElementFp(this.q, this.x.subtract(b.toBigInteger()).mod(this.q))
  }

  /**
   * 相乘
   */
  multiply(b) {
    return new ECFieldElementFp(this.q, this.x.multiply(b.toBigInteger()).mod(this.q))
  }

  /**
   * 相除
   */
  divide(b) {
    return new ECFieldElementFp(this.q, this.x.multiply(b.toBigInteger().modInverse(this.q)).mod(this.q))
  }

  /**
   * 平方
   */
  square() {
    return new ECFieldElementFp(this.q, this.x.square().mod(this.q))
  }
}

class ECPointFp {
  constructor(curve, x, y, z) {
    this.curve = curve
    this.x = x
    this.y = y
    // 标准射影坐标系：zinv == null 或 z * zinv == 1
    this.z = z == null ? BigInteger.ONE : z
    this.zinv = null
    // TODO: compression flag
  }

  getX() {
    if (this.zinv === null) this.zinv = this.z.modInverse(this.curve.q)

    return this.curve.fromBigInteger(this.x.toBigInteger().multiply(this.zinv).mod(this.curve.q))
  }

  getY() {
    if (this.zinv === null) this.zinv = this.z.modInverse(this.curve.q)

    return this.curve.fromBigInteger(this.y.toBigInteger().multiply(this.zinv).mod(this.curve.q))
  }

  /**
   * 判断相等
   */
  equals(other) {
    if (other === this) return true
    if (this.isInfinity()) return other.isInfinity()
    if (other.isInfinity()) return this.isInfinity()

    // u = y2 * z1 - y1 * z2
    const u = other.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(other.z)).mod(this.curve.q)
    if (!u.equals(BigInteger.ZERO)) return false

    // v = x2 * z1 - x1 * z2
    const v = other.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(other.z)).mod(this.curve.q)
    return v.equals(BigInteger.ZERO)
  }

  /**
   * 是否是无穷远点
   */
  isInfinity() {
    if ((this.x === null) && (this.y === null)) return true
    return this.z.equals(BigInteger.ZERO) && !this.y.toBigInteger().equals(BigInteger.ZERO)
  }

  /**
   * 取反，x 轴对称点
   */
  negate() {
    return new ECPointFp(this.curve, this.x, this.y.negate(), this.z)
  }

  /**
   * 相加
   *
   * 标准射影坐标系：
   *
   * λ1 = x1 * z2
   * λ2 = x2 * z1
   * λ3 = λ1 − λ2
   * λ4 = y1 * z2
   * λ5 = y2 * z1
   * λ6 = λ4 − λ5
   * λ7 = λ1 + λ2
   * λ8 = z1 * z2
   * λ9 = λ3^2
   * λ10 = λ3 * λ9
   * λ11 = λ8 * λ6^2 − λ7 * λ9
   * x3 = λ3 * λ11
   * y3 = λ6 * (λ9 * λ1 − λ11) − λ4 * λ10
   * z3 = λ10 * λ8
   */
  add(b) {
    if (this.isInfinity()) return b
    if (b.isInfinity()) return this

    const x1 = this.x.toBigInteger()
    const y1 = this.y.toBigInteger()
    const z1 = this.z
    const x2 = b.x.toBigInteger()
    const y2 = b.y.toBigInteger()
    const z2 = b.z
    const q = this.curve.q

    const w1 = x1.multiply(z2).mod(q)
    const w2 = x2.multiply(z1).mod(q)
    const w3 = w1.subtract(w2)
    const w4 = y1.multiply(z2).mod(q)
    const w5 = y2.multiply(z1).mod(q)
    const w6 = w4.subtract(w5)

    if (BigInteger.ZERO.equals(w3)) {
      if (BigInteger.ZERO.equals(w6)) {
        return this.twice() // this == b，计算自加
      }
      return this.curve.infinity // this == -b，则返回无穷远点
    }

    const w7 = w1.add(w2)
    const w8 = z1.multiply(z2).mod(q)
    const w9 = w3.square().mod(q)
    const w10 = w3.multiply(w9).mod(q)
    const w11 = w8.multiply(w6.square()).subtract(w7.multiply(w9)).mod(q)

    const x3 = w3.multiply(w11).mod(q)
    const y3 = w6.multiply(w9.multiply(w1).subtract(w11)).subtract(w4.multiply(w10)).mod(q)
    const z3 = w10.multiply(w8).mod(q)

    return new ECPointFp(this.curve, this.curve.fromBigInteger(x3), this.curve.fromBigInteger(y3), z3)
  }

  /**
   * 自加
   *
   * 标准射影坐标系：
   *
   * λ1 = 3 * x1^2 + a * z1^2
   * λ2 = 2 * y1 * z1
   * λ3 = y1^2
   * λ4 = λ3 * x1 * z1
   * λ5 = λ2^2
   * λ6 = λ1^2 − 8 * λ4
   * x3 = λ2 * λ6
   * y3 = λ1 * (4 * λ4 − λ6) − 2 * λ5 * λ3
   * z3 = λ2 * λ5
   */
  twice() {
    if (this.isInfinity()) return this
    if (!this.y.toBigInteger().signum()) return this.curve.infinity

    const x1 = this.x.toBigInteger()
    const y1 = this.y.toBigInteger()
    const z1 = this.z
    const q = this.curve.q
    const a = this.curve.a.toBigInteger()

    const w1 = x1.square().multiply(THREE).add(a.multiply(z1.square())).mod(q)
    const w2 = y1.shiftLeft(1).multiply(z1).mod(q)
    const w3 = y1.square().mod(q)
    const w4 = w3.multiply(x1).multiply(z1).mod(q)
    const w5 = w2.square().mod(q)
    const w6 = w1.square().subtract(w4.shiftLeft(3)).mod(q)

    const x3 = w2.multiply(w6).mod(q)
    const y3 = w1.multiply(w4.shiftLeft(2).subtract(w6)).subtract(w5.shiftLeft(1).multiply(w3)).mod(q)
    const z3 = w2.multiply(w5).mod(q)

    return new ECPointFp(this.curve, this.curve.fromBigInteger(x3), this.curve.fromBigInteger(y3), z3)
  }

  /**
   * 倍点计算
   */
  multiply(k) {
    if (this.isInfinity()) return this
    if (!k.signum()) return this.curve.infinity

    // 使用加减法
    const k3 = k.multiply(THREE)
    const neg = this.negate()
    let Q = this

    for (let i = k3.bitLength() - 2; i > 0; i--) {
      Q = Q.twice()

      const k3Bit = k3.testBit(i)
      const kBit = k.testBit(i)

      if (k3Bit !== kBit) {
        Q = Q.add(k3Bit ? this : neg)
      }
    }

    return Q
  }
}

/**
 * 椭圆曲线 y^2 = x^3 + ax + b
 */
class ECCurveFp {
  constructor(q, a, b) {
    this.q = q
    this.a = this.fromBigInteger(a)
    this.b = this.fromBigInteger(b)
    this.infinity = new ECPointFp(this, null, null) // 无穷远点
  }

  /**
   * 判断两个椭圆曲线是否相等
   */
  equals(other) {
    if (other === this) return true
    return (this.q.equals(other.q) && this.a.equals(other.a) && this.b.equals(other.b))
  }

  /**
   * 生成椭圆曲线域元素
   */
  fromBigInteger(x) {
    return new ECFieldElementFp(this.q, x)
  }

  /**
   * 解析 16 进制串为椭圆曲线点
   */
  decodePointHex(s) {
    switch (parseInt(s.substr(0, 2), 16)) {
      // 第一个字节
      case 0:
        return this.infinity
      case 2:
      case 3:
        // 压缩
        const x = this.fromBigInteger(new BigInteger(s.substr(2), 16))
        // 对 p ≡ 3 (mod4)，即存在正整数 u，使得 p = 4u + 3
        // 计算 y = (√ (x^3 + ax + b) % p)^(u + 1) modp
        let y = this.fromBigInteger(x.multiply(x.square()).add(
          x.multiply(this.a)
        ).add(this.b).toBigInteger()
          .modPow(
            this.q.divide(new BigInteger('4')).add(BigInteger.ONE), this.q
          ))
        // 算出结果 2 进制最后 1 位不等于第 1 个字节减 2 则取反
        if (!y.toBigInteger().mod(TWO).equals(new BigInteger(s.substr(0, 2), 16).subtract(TWO))) {
          y = y.negate()
        }
        return new ECPointFp(this, x, y)
      case 4:
      case 6:
      case 7:
        const len = (s.length - 2) / 2
        const xHex = s.substr(2, len)
        const yHex = s.substr(len + 2, len)

        return new ECPointFp(this, this.fromBigInteger(new BigInteger(xHex, 16)), this.fromBigInteger(new BigInteger(yHex, 16)))
      default:
        // 不支持
        return null
    }
  }
}

module.exports = {
  ECPointFp,
  ECCurveFp,
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1730283658255, function(require, module, exports) {
// 消息扩展
const W = new Uint32Array(68)
const M = new Uint32Array(64) // W'

/**
 * 循环左移
 */
function rotl(x, n) {
  const s = n & 31
  return (x << s) | (x >>> (32 - s))
}

/**
 * 二进制异或运算
 */
function xor(x, y) {
  const result = []
  for (let i = x.length - 1; i >= 0; i--) result[i] = (x[i] ^ y[i]) & 0xff
  return result
}

/**
 * 压缩函数中的置换函数 P0(X) = X xor (X <<< 9) xor (X <<< 17)
 */
function P0(X) {
  return (X ^ rotl(X, 9)) ^ rotl(X, 17)
}

/**
 * 消息扩展中的置换函数 P1(X) = X xor (X <<< 15) xor (X <<< 23)
 */
function P1(X) {
  return (X ^ rotl(X, 15)) ^ rotl(X, 23)
}

/**
 * sm3 本体
 */
function sm3(array) {
  let len = array.length * 8

  // k 是满足 len + 1 + k = 448mod512 的最小的非负整数
  let k = len % 512
  // 如果 448 <= (512 % len) < 512，需要多补充 (len % 448) 比特'0'以满足总比特长度为512的倍数
  k = k >= 448 ? 512 - (k % 448) - 1 : 448 - k - 1

  // 填充
  const kArr = new Array((k - 7) / 8)
  const lenArr = new Array(8)
  for (let i = 0, len = kArr.length; i < len; i++) kArr[i] = 0
  for (let i = 0, len = lenArr.length; i < len; i++) lenArr[i] = 0
  len = len.toString(2)
  for (let i = 7; i >= 0; i--) {
    if (len.length > 8) {
      const start = len.length - 8
      lenArr[i] = parseInt(len.substr(start), 2)
      len = len.substr(0, start)
    } else if (len.length > 0) {
      lenArr[i] = parseInt(len, 2)
      len = ''
    }
  }
  const m = new Uint8Array([...array, 0x80, ...kArr, ...lenArr])
  const dataView = new DataView(m.buffer, 0)

  // 迭代压缩
  const n = m.length / 64
  const V = new Uint32Array([0x7380166f, 0x4914b2b9, 0x172442d7, 0xda8a0600, 0xa96f30bc, 0x163138aa, 0xe38dee4d, 0xb0fb0e4e])
  for (let i = 0; i < n; i++) {
    W.fill(0)
    M.fill(0)

    // 将消息分组B划分为 16 个字 W0， W1，……，W15
    const start = 16 * i
    for (let j = 0; j < 16; j++) {
      W[j] = dataView.getUint32((start + j) * 4, false)
    }

    // W16 ～ W67：W[j] <- P1(W[j−16] xor W[j−9] xor (W[j−3] <<< 15)) xor (W[j−13] <<< 7) xor W[j−6]
    for (let j = 16; j < 68; j++) {
      W[j] = (P1((W[j - 16] ^ W[j - 9]) ^ rotl(W[j - 3], 15)) ^ rotl(W[j - 13], 7)) ^ W[j - 6]
    }

    // W′0 ～ W′63：W′[j] = W[j] xor W[j+4]
    for (let j = 0; j < 64; j++) {
      M[j] = W[j] ^ W[j + 4]
    }

    // 压缩
    const T1 = 0x79cc4519
    const T2 = 0x7a879d8a
    // 字寄存器
    let A = V[0]
    let B = V[1]
    let C = V[2]
    let D = V[3]
    let E = V[4]
    let F = V[5]
    let G = V[6]
    let H = V[7]
    // 中间变量
    let SS1
    let SS2
    let TT1
    let TT2
    let T
    for (let j = 0; j < 64; j++) {
      T = j >= 0 && j <= 15 ? T1 : T2
      SS1 = rotl(rotl(A, 12) + E + rotl(T, j), 7)
      SS2 = SS1 ^ rotl(A, 12)

      TT1 = (j >= 0 && j <= 15 ? ((A ^ B) ^ C) : (((A & B) | (A & C)) | (B & C))) + D + SS2 + M[j]
      TT2 = (j >= 0 && j <= 15 ? ((E ^ F) ^ G) : ((E & F) | ((~E) & G))) + H + SS1 + W[j]

      D = C
      C = rotl(B, 9)
      B = A
      A = TT1
      H = G
      G = rotl(F, 19)
      F = E
      E = P0(TT2)
    }

    V[0] ^= A
    V[1] ^= B
    V[2] ^= C
    V[3] ^= D
    V[4] ^= E
    V[5] ^= F
    V[6] ^= G
    V[7] ^= H
  }

  // 转回 uint8
  const result = []
  for (let i = 0, len = V.length; i < len; i++) {
    const word = V[i]
    result.push((word & 0xff000000) >>> 24, (word & 0xff0000) >>> 16, (word & 0xff00) >>> 8, word & 0xff)
  }

  return result
}

/**
 * hmac 实现
 */
const blockLen = 64
const iPad = new Uint8Array(blockLen)
const oPad = new Uint8Array(blockLen)
for (let i = 0; i < blockLen; i++) {
  iPad[i] = 0x36
  oPad[i] = 0x5c
}
function hmac(input, key) {
  // 密钥填充
  if (key.length > blockLen) key = sm3(key)
  while (key.length < blockLen) key.push(0)

  const iPadKey = xor(key, iPad)
  const oPadKey = xor(key, oPad)

  const hash = sm3([...iPadKey, ...input])
  return sm3([...oPadKey, ...hash])
}

module.exports = {
  sm3,
  hmac,
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1730283658256, function(require, module, exports) {
const {sm3, hmac} = require('../sm2/sm3')

/**
 * 补全16进制字符串
 */
function leftPad(input, num) {
  if (input.length >= num) return input

  return (new Array(num - input.length + 1)).join('0') + input
}

/**
 * 字节数组转 16 进制串
 */
function ArrayToHex(arr) {
  return arr.map(item => {
    item = item.toString(16)
    return item.length === 1 ? '0' + item : item
  }).join('')
}

/**
 * 转成字节数组
 */
function hexToArray(hexStr) {
  const words = []
  let hexStrLength = hexStr.length

  if (hexStrLength % 2 !== 0) {
    hexStr = leftPad(hexStr, hexStrLength + 1)
  }

  hexStrLength = hexStr.length

  for (let i = 0; i < hexStrLength; i += 2) {
    words.push(parseInt(hexStr.substr(i, 2), 16))
  }
  return words
}

/**
 * utf8 串转字节数组
 */
function utf8ToArray(str) {
  const arr = []

  for (let i = 0, len = str.length; i < len; i++) {
    const point = str.codePointAt(i)

    if (point <= 0x007f) {
      // 单字节，标量值：00000000 00000000 0zzzzzzz
      arr.push(point)
    } else if (point <= 0x07ff) {
      // 双字节，标量值：00000000 00000yyy yyzzzzzz
      arr.push(0xc0 | (point >>> 6)) // 110yyyyy（0xc0-0xdf）
      arr.push(0x80 | (point & 0x3f)) // 10zzzzzz（0x80-0xbf）
    } else if (point <= 0xD7FF || (point >= 0xE000 && point <= 0xFFFF)) {
      // 三字节：标量值：00000000 xxxxyyyy yyzzzzzz
      arr.push(0xe0 | (point >>> 12)) // 1110xxxx（0xe0-0xef）
      arr.push(0x80 | ((point >>> 6) & 0x3f)) // 10yyyyyy（0x80-0xbf）
      arr.push(0x80 | (point & 0x3f)) // 10zzzzzz（0x80-0xbf）
    } else if (point >= 0x010000 && point <= 0x10FFFF) {
      // 四字节：标量值：000wwwxx xxxxyyyy yyzzzzzz
      i++
      arr.push((0xf0 | (point >>> 18) & 0x1c)) // 11110www（0xf0-0xf7）
      arr.push((0x80 | ((point >>> 12) & 0x3f))) // 10xxxxxx（0x80-0xbf）
      arr.push((0x80 | ((point >>> 6) & 0x3f))) // 10yyyyyy（0x80-0xbf）
      arr.push((0x80 | (point & 0x3f))) // 10zzzzzz（0x80-0xbf）
    } else {
      // 五、六字节，暂时不支持
      arr.push(point)
      throw new Error('input is not supported')
    }
  }

  return arr
}

module.exports = function (input, options) {
  input = typeof input === 'string' ? utf8ToArray(input) : Array.prototype.slice.call(input)

  if (options) {
    const mode = options.mode || 'hmac'
    if (mode !== 'hmac') throw new Error('invalid mode')

    let key = options.key
    if (!key) throw new Error('invalid key')

    key = typeof key === 'string' ? hexToArray(key) : Array.prototype.slice.call(key)
    return ArrayToHex(hmac(input, key))
  }

  return ArrayToHex(sm3(input))
}

}, function(modId) { var map = {"../sm2/sm3":1730283658255}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1730283658257, function(require, module, exports) {
/* eslint-disable no-bitwise, no-mixed-operators, complexity */
const DECRYPT = 0
const ROUND = 32
const BLOCK = 16

const Sbox = [
  0xd6, 0x90, 0xe9, 0xfe, 0xcc, 0xe1, 0x3d, 0xb7, 0x16, 0xb6, 0x14, 0xc2, 0x28, 0xfb, 0x2c, 0x05,
  0x2b, 0x67, 0x9a, 0x76, 0x2a, 0xbe, 0x04, 0xc3, 0xaa, 0x44, 0x13, 0x26, 0x49, 0x86, 0x06, 0x99,
  0x9c, 0x42, 0x50, 0xf4, 0x91, 0xef, 0x98, 0x7a, 0x33, 0x54, 0x0b, 0x43, 0xed, 0xcf, 0xac, 0x62,
  0xe4, 0xb3, 0x1c, 0xa9, 0xc9, 0x08, 0xe8, 0x95, 0x80, 0xdf, 0x94, 0xfa, 0x75, 0x8f, 0x3f, 0xa6,
  0x47, 0x07, 0xa7, 0xfc, 0xf3, 0x73, 0x17, 0xba, 0x83, 0x59, 0x3c, 0x19, 0xe6, 0x85, 0x4f, 0xa8,
  0x68, 0x6b, 0x81, 0xb2, 0x71, 0x64, 0xda, 0x8b, 0xf8, 0xeb, 0x0f, 0x4b, 0x70, 0x56, 0x9d, 0x35,
  0x1e, 0x24, 0x0e, 0x5e, 0x63, 0x58, 0xd1, 0xa2, 0x25, 0x22, 0x7c, 0x3b, 0x01, 0x21, 0x78, 0x87,
  0xd4, 0x00, 0x46, 0x57, 0x9f, 0xd3, 0x27, 0x52, 0x4c, 0x36, 0x02, 0xe7, 0xa0, 0xc4, 0xc8, 0x9e,
  0xea, 0xbf, 0x8a, 0xd2, 0x40, 0xc7, 0x38, 0xb5, 0xa3, 0xf7, 0xf2, 0xce, 0xf9, 0x61, 0x15, 0xa1,
  0xe0, 0xae, 0x5d, 0xa4, 0x9b, 0x34, 0x1a, 0x55, 0xad, 0x93, 0x32, 0x30, 0xf5, 0x8c, 0xb1, 0xe3,
  0x1d, 0xf6, 0xe2, 0x2e, 0x82, 0x66, 0xca, 0x60, 0xc0, 0x29, 0x23, 0xab, 0x0d, 0x53, 0x4e, 0x6f,
  0xd5, 0xdb, 0x37, 0x45, 0xde, 0xfd, 0x8e, 0x2f, 0x03, 0xff, 0x6a, 0x72, 0x6d, 0x6c, 0x5b, 0x51,
  0x8d, 0x1b, 0xaf, 0x92, 0xbb, 0xdd, 0xbc, 0x7f, 0x11, 0xd9, 0x5c, 0x41, 0x1f, 0x10, 0x5a, 0xd8,
  0x0a, 0xc1, 0x31, 0x88, 0xa5, 0xcd, 0x7b, 0xbd, 0x2d, 0x74, 0xd0, 0x12, 0xb8, 0xe5, 0xb4, 0xb0,
  0x89, 0x69, 0x97, 0x4a, 0x0c, 0x96, 0x77, 0x7e, 0x65, 0xb9, 0xf1, 0x09, 0xc5, 0x6e, 0xc6, 0x84,
  0x18, 0xf0, 0x7d, 0xec, 0x3a, 0xdc, 0x4d, 0x20, 0x79, 0xee, 0x5f, 0x3e, 0xd7, 0xcb, 0x39, 0x48
]

const CK = [
  0x00070e15, 0x1c232a31, 0x383f464d, 0x545b6269,
  0x70777e85, 0x8c939aa1, 0xa8afb6bd, 0xc4cbd2d9,
  0xe0e7eef5, 0xfc030a11, 0x181f262d, 0x343b4249,
  0x50575e65, 0x6c737a81, 0x888f969d, 0xa4abb2b9,
  0xc0c7ced5, 0xdce3eaf1, 0xf8ff060d, 0x141b2229,
  0x30373e45, 0x4c535a61, 0x686f767d, 0x848b9299,
  0xa0a7aeb5, 0xbcc3cad1, 0xd8dfe6ed, 0xf4fb0209,
  0x10171e25, 0x2c333a41, 0x484f565d, 0x646b7279
]

/**
 * 16 进制串转字节数组
 */
function hexToArray(str) {
  const arr = []
  for (let i = 0, len = str.length; i < len; i += 2) {
    arr.push(parseInt(str.substr(i, 2), 16))
  }
  return arr
}

/**
 * 字节数组转 16 进制串
 */
function ArrayToHex(arr) {
  return arr.map(item => {
    item = item.toString(16)
    return item.length === 1 ? '0' + item : item
  }).join('')
}

/**
 * utf8 串转字节数组
 */
function utf8ToArray(str) {
  const arr = []

  for (let i = 0, len = str.length; i < len; i++) {
    const point = str.codePointAt(i)

    if (point <= 0x007f) {
      // 单字节，标量值：00000000 00000000 0zzzzzzz
      arr.push(point)
    } else if (point <= 0x07ff) {
      // 双字节，标量值：00000000 00000yyy yyzzzzzz
      arr.push(0xc0 | (point >>> 6)) // 110yyyyy（0xc0-0xdf）
      arr.push(0x80 | (point & 0x3f)) // 10zzzzzz（0x80-0xbf）
    } else if (point <= 0xD7FF || (point >= 0xE000 && point <= 0xFFFF)) {
      // 三字节：标量值：00000000 xxxxyyyy yyzzzzzz
      arr.push(0xe0 | (point >>> 12)) // 1110xxxx（0xe0-0xef）
      arr.push(0x80 | ((point >>> 6) & 0x3f)) // 10yyyyyy（0x80-0xbf）
      arr.push(0x80 | (point & 0x3f)) // 10zzzzzz（0x80-0xbf）
    } else if (point >= 0x010000 && point <= 0x10FFFF) {
      // 四字节：标量值：000wwwxx xxxxyyyy yyzzzzzz
      i++
      arr.push((0xf0 | (point >>> 18) & 0x1c)) // 11110www（0xf0-0xf7）
      arr.push((0x80 | ((point >>> 12) & 0x3f))) // 10xxxxxx（0x80-0xbf）
      arr.push((0x80 | ((point >>> 6) & 0x3f))) // 10yyyyyy（0x80-0xbf）
      arr.push((0x80 | (point & 0x3f))) // 10zzzzzz（0x80-0xbf）
    } else {
      // 五、六字节，暂时不支持
      arr.push(point)
      throw new Error('input is not supported')
    }
  }

  return arr
}

/**
 * 字节数组转 utf8 串
 */
function arrayToUtf8(arr) {
  const str = []
  for (let i = 0, len = arr.length; i < len; i++) {
    if (arr[i] >= 0xf0 && arr[i] <= 0xf7) {
      // 四字节
      str.push(String.fromCodePoint(((arr[i] & 0x07) << 18) + ((arr[i + 1] & 0x3f) << 12) + ((arr[i + 2] & 0x3f) << 6) + (arr[i + 3] & 0x3f)))
      i += 3
    } else if (arr[i] >= 0xe0 && arr[i] <= 0xef) {
      // 三字节
      str.push(String.fromCodePoint(((arr[i] & 0x0f) << 12) + ((arr[i + 1] & 0x3f) << 6) + (arr[i + 2] & 0x3f)))
      i += 2
    } else if (arr[i] >= 0xc0 && arr[i] <= 0xdf) {
      // 双字节
      str.push(String.fromCodePoint(((arr[i] & 0x1f) << 6) + (arr[i + 1] & 0x3f)))
      i++
    } else {
      // 单字节
      str.push(String.fromCodePoint(arr[i]))
    }
  }

  return str.join('')
}

/**
 * 32 比特循环左移
 */
function rotl(x, n) {
  const s = n & 31
  return (x << s) | (x >>> (32 - s))
}

/**
 * 非线性变换
 */
function byteSub(a) {
  return (Sbox[a >>> 24 & 0xFF] & 0xFF) << 24 |
    (Sbox[a >>> 16 & 0xFF] & 0xFF) << 16 |
    (Sbox[a >>> 8 & 0xFF] & 0xFF) << 8 |
    (Sbox[a & 0xFF] & 0xFF)
}

/**
 * 线性变换，加密/解密用
 */
function l1(b) {
  return b ^ rotl(b, 2) ^ rotl(b, 10) ^ rotl(b, 18) ^ rotl(b, 24)
}

/**
 * 线性变换，生成轮密钥用
 */
function l2(b) {
  return b ^ rotl(b, 13) ^ rotl(b, 23)
}

/**
 * 以一组 128 比特进行加密/解密操作
 */
function sms4Crypt(input, output, roundKey) {
  const x = new Array(4)

  // 字节数组转成字数组（此处 1 字 = 32 比特）
  const tmp = new Array(4)
  for (let i = 0; i < 4; i++) {
    tmp[0] = input[4 * i] & 0xff
    tmp[1] = input[4 * i + 1] & 0xff
    tmp[2] = input[4 * i + 2] & 0xff
    tmp[3] = input[4 * i + 3] & 0xff
    x[i] = tmp[0] << 24 | tmp[1] << 16 | tmp[2] << 8 | tmp[3]
  }

  // x[i + 4] = x[i] ^ l1(byteSub(x[i + 1] ^ x[i + 2] ^ x[i + 3] ^ roundKey[i]))
  for (let r = 0, mid; r < 32; r += 4) {
    mid = x[1] ^ x[2] ^ x[3] ^ roundKey[r + 0]
    x[0] ^= l1(byteSub(mid)) // x[4]

    mid = x[2] ^ x[3] ^ x[0] ^ roundKey[r + 1]
    x[1] ^= l1(byteSub(mid)) // x[5]

    mid = x[3] ^ x[0] ^ x[1] ^ roundKey[r + 2]
    x[2] ^= l1(byteSub(mid)) // x[6]

    mid = x[0] ^ x[1] ^ x[2] ^ roundKey[r + 3]
    x[3] ^= l1(byteSub(mid)) // x[7]
  }

  // 反序变换
  for (let j = 0; j < 16; j += 4) {
    output[j] = x[3 - j / 4] >>> 24 & 0xff
    output[j + 1] = x[3 - j / 4] >>> 16 & 0xff
    output[j + 2] = x[3 - j / 4] >>> 8 & 0xff
    output[j + 3] = x[3 - j / 4] & 0xff
  }
}

/**
 * 密钥扩展算法
 */
function sms4KeyExt(key, roundKey, cryptFlag) {
  const x = new Array(4)

  // 字节数组转成字数组（此处 1 字 = 32 比特）
  const tmp = new Array(4)
  for (let i = 0; i < 4; i++) {
    tmp[0] = key[0 + 4 * i] & 0xff
    tmp[1] = key[1 + 4 * i] & 0xff
    tmp[2] = key[2 + 4 * i] & 0xff
    tmp[3] = key[3 + 4 * i] & 0xff
    x[i] = tmp[0] << 24 | tmp[1] << 16 | tmp[2] << 8 | tmp[3]
  }

  // 与系统参数做异或
  x[0] ^= 0xa3b1bac6
  x[1] ^= 0x56aa3350
  x[2] ^= 0x677d9197
  x[3] ^= 0xb27022dc

  // roundKey[i] = x[i + 4] = x[i] ^ l2(byteSub(x[i + 1] ^ x[i + 2] ^ x[i + 3] ^ CK[i]))
  for (let r = 0, mid; r < 32; r += 4) {
    mid = x[1] ^ x[2] ^ x[3] ^ CK[r + 0]
    roundKey[r + 0] = x[0] ^= l2(byteSub(mid)) // x[4]

    mid = x[2] ^ x[3] ^ x[0] ^ CK[r + 1]
    roundKey[r + 1] = x[1] ^= l2(byteSub(mid)) // x[5]

    mid = x[3] ^ x[0] ^ x[1] ^ CK[r + 2]
    roundKey[r + 2] = x[2] ^= l2(byteSub(mid)) // x[6]

    mid = x[0] ^ x[1] ^ x[2] ^ CK[r + 3]
    roundKey[r + 3] = x[3] ^= l2(byteSub(mid)) // x[7]
  }

  // 解密时使用反序的轮密钥
  if (cryptFlag === DECRYPT) {
    for (let r = 0, mid; r < 16; r++) {
      mid = roundKey[r]
      roundKey[r] = roundKey[31 - r]
      roundKey[31 - r] = mid
    }
  }
}

function sm4(inArray, key, cryptFlag, {
  padding = 'pkcs#7', mode, iv = [], output = 'string'
} = {}) {
  if (mode === 'cbc') {
    // CBC 模式，默认走 ECB 模式
    if (typeof iv === 'string') iv = hexToArray(iv)
    if (iv.length !== (128 / 8)) {
      // iv 不是 128 比特
      throw new Error('iv is invalid')
    }
  }

  // 检查 key
  if (typeof key === 'string') key = hexToArray(key)
  if (key.length !== (128 / 8)) {
    // key 不是 128 比特
    throw new Error('key is invalid')
  }

  // 检查输入
  if (typeof inArray === 'string') {
    if (cryptFlag !== DECRYPT) {
      // 加密，输入为 utf8 串
      inArray = utf8ToArray(inArray)
    } else {
      // 解密，输入为 16 进制串
      inArray = hexToArray(inArray)
    }
  } else {
    inArray = [...inArray]
  }

  // 新增填充，sm4 是 16 个字节一个分组，所以统一走到 pkcs#7
  if ((padding === 'pkcs#5' || padding === 'pkcs#7') && cryptFlag !== DECRYPT) {
    const paddingCount = BLOCK - inArray.length % BLOCK
    for (let i = 0; i < paddingCount; i++) inArray.push(paddingCount)
  }

  // 生成轮密钥
  const roundKey = new Array(ROUND)
  sms4KeyExt(key, roundKey, cryptFlag)

  const outArray = []
  let lastVector = iv
  let restLen = inArray.length
  let point = 0
  while (restLen >= BLOCK) {
    const input = inArray.slice(point, point + 16)
    const output = new Array(16)

    if (mode === 'cbc') {
      for (let i = 0; i < BLOCK; i++) {
        if (cryptFlag !== DECRYPT) {
          // 加密过程在组加密前进行异或
          input[i] ^= lastVector[i]
        }
      }
    }

    sms4Crypt(input, output, roundKey)


    for (let i = 0; i < BLOCK; i++) {
      if (mode === 'cbc') {
        if (cryptFlag === DECRYPT) {
          // 解密过程在组解密后进行异或
          output[i] ^= lastVector[i]
        }
      }

      outArray[point + i] = output[i]
    }

    if (mode === 'cbc') {
      if (cryptFlag !== DECRYPT) {
        // 使用上一次输出作为加密向量
        lastVector = output
      } else {
        // 使用上一次输入作为解密向量
        lastVector = input
      }
    }

    restLen -= BLOCK
    point += BLOCK
  }

  // 去除填充，sm4 是 16 个字节一个分组，所以统一走到 pkcs#7
  if ((padding === 'pkcs#5' || padding === 'pkcs#7') && cryptFlag === DECRYPT) {
    const len = outArray.length
    const paddingCount = outArray[len - 1]
    for (let i = 1; i <= paddingCount; i++) {
      if (outArray[len - i] !== paddingCount) throw new Error('padding is invalid')
    }
    outArray.splice(len - paddingCount, paddingCount)
  }

  // 调整输出
  if (output !== 'array') {
    if (cryptFlag !== DECRYPT) {
      // 加密，输出转 16 进制串
      return ArrayToHex(outArray)
    } else {
      // 解密，输出转 utf8 串
      return arrayToUtf8(outArray)
    }
  } else {
    return outArray
  }
}

module.exports = {
  encrypt(inArray, key, options) {
    return sm4(inArray, key, 1, options)
  },
  decrypt(inArray, key, options) {
    return sm4(inArray, key, 0, options)
  }
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1730283658250);
})()
//miniprogram-npm-outsideDeps=["jsbn"]
//# sourceMappingURL=index.js.map