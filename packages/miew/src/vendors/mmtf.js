!(function (r, t) {
  if ('function' == typeof define && define.amd) define(['exports'], t)
  else if ('object' == typeof exports && 'undefined' != typeof module)
    t(exports)
  else t((r.MMTF = r.MMTF || {}))
})(this, function (r) {
  'use strict'
  function t(r, t, n) {
    for (var e = (r.byteLength, 0), i = n.length; i > e; e++) {
      var o = n.charCodeAt(e)
      if (128 > o) r.setUint8(t++, ((o >>> 0) & 127) | 0)
      else if (2048 > o)
        r.setUint8(t++, ((o >>> 6) & 31) | 192),
          r.setUint8(t++, ((o >>> 0) & 63) | 128)
      else if (65536 > o)
        r.setUint8(t++, ((o >>> 12) & 15) | 224),
          r.setUint8(t++, ((o >>> 6) & 63) | 128),
          r.setUint8(t++, ((o >>> 0) & 63) | 128)
      else {
        if (!(1114112 > o)) throw new Error('bad codepoint ' + o)
        r.setUint8(t++, ((o >>> 18) & 7) | 240),
          r.setUint8(t++, ((o >>> 12) & 63) | 128),
          r.setUint8(t++, ((o >>> 6) & 63) | 128),
          r.setUint8(t++, ((o >>> 0) & 63) | 128)
      }
    }
  }
  function n(r) {
    for (var t = 0, n = 0, e = r.length; e > n; n++) {
      var i = r.charCodeAt(n)
      if (128 > i) t += 1
      else if (2048 > i) t += 2
      else if (65536 > i) t += 3
      else {
        if (!(1114112 > i)) throw new Error('bad codepoint ' + i)
        t += 4
      }
    }
    return t
  }
  function e(r, i, o) {
    var a = typeof r
    if ('string' === a) {
      var u = n(r)
      if (32 > u) return i.setUint8(o, 160 | u), t(i, o + 1, r), 1 + u
      if (256 > u)
        return i.setUint8(o, 217), i.setUint8(o + 1, u), t(i, o + 2, r), 2 + u
      if (65536 > u)
        return i.setUint8(o, 218), i.setUint16(o + 1, u), t(i, o + 3, r), 3 + u
      if (4294967296 > u)
        return i.setUint8(o, 219), i.setUint32(o + 1, u), t(i, o + 5, r), 5 + u
    }
    if (r instanceof Uint8Array) {
      var u = r.byteLength,
        s = new Uint8Array(i.buffer)
      if (256 > u)
        return i.setUint8(o, 196), i.setUint8(o + 1, u), s.set(r, o + 2), 2 + u
      if (65536 > u)
        return i.setUint8(o, 197), i.setUint16(o + 1, u), s.set(r, o + 3), 3 + u
      if (4294967296 > u)
        return i.setUint8(o, 198), i.setUint32(o + 1, u), s.set(r, o + 5), 5 + u
    }
    if ('number' === a) {
      if (!isFinite(r)) throw new Error('Number not finite: ' + r)
      if (Math.floor(r) !== r)
        return i.setUint8(o, 203), i.setFloat64(o + 1, r), 9
      if (r >= 0) {
        if (128 > r) return i.setUint8(o, r), 1
        if (256 > r) return i.setUint8(o, 204), i.setUint8(o + 1, r), 2
        if (65536 > r) return i.setUint8(o, 205), i.setUint16(o + 1, r), 3
        if (4294967296 > r) return i.setUint8(o, 206), i.setUint32(o + 1, r), 5
        throw new Error('Number too big 0x' + r.toString(16))
      }
      if (r >= -32) return i.setInt8(o, r), 1
      if (r >= -128) return i.setUint8(o, 208), i.setInt8(o + 1, r), 2
      if (r >= -32768) return i.setUint8(o, 209), i.setInt16(o + 1, r), 3
      if (r >= -2147483648) return i.setUint8(o, 210), i.setInt32(o + 1, r), 5
      throw new Error('Number too small -0x' + (-r).toString(16).substr(1))
    }
    if (null === r) return i.setUint8(o, 192), 1
    if ('boolean' === a) return i.setUint8(o, r ? 195 : 194), 1
    if ('object' === a) {
      var u,
        f = 0,
        c = Array.isArray(r)
      if (c) u = r.length
      else {
        var d = Object.keys(r)
        u = d.length
      }
      var f
      if (
        (16 > u
          ? (i.setUint8(o, u | (c ? 144 : 128)), (f = 1))
          : 65536 > u
          ? (i.setUint8(o, c ? 220 : 222), i.setUint16(o + 1, u), (f = 3))
          : 4294967296 > u &&
            (i.setUint8(o, c ? 221 : 223), i.setUint32(o + 1, u), (f = 5)),
        c)
      )
        for (var l = 0; u > l; l++) f += e(r[l], i, o + f)
      else
        for (var l = 0; u > l; l++) {
          var v = d[l]
          ;(f += e(v, i, o + f)), (f += e(r[v], i, o + f))
        }
      return f
    }
    throw new Error('Unknown type ' + a)
  }
  function i(r) {
    var t = typeof r
    if ('string' === t) {
      var e = n(r)
      if (32 > e) return 1 + e
      if (256 > e) return 2 + e
      if (65536 > e) return 3 + e
      if (4294967296 > e) return 5 + e
    }
    if (r instanceof Uint8Array) {
      var e = r.byteLength
      if (256 > e) return 2 + e
      if (65536 > e) return 3 + e
      if (4294967296 > e) return 5 + e
    }
    if ('number' === t) {
      if (Math.floor(r) !== r) return 9
      if (r >= 0) {
        if (128 > r) return 1
        if (256 > r) return 2
        if (65536 > r) return 3
        if (4294967296 > r) return 5
        throw new Error('Number too big 0x' + r.toString(16))
      }
      if (r >= -32) return 1
      if (r >= -128) return 2
      if (r >= -32768) return 3
      if (r >= -2147483648) return 5
      throw new Error('Number too small -0x' + r.toString(16).substr(1))
    }
    if ('boolean' === t || null === r) return 1
    if ('object' === t) {
      var e,
        o = 0
      if (Array.isArray(r)) {
        e = r.length
        for (var a = 0; e > a; a++) o += i(r[a])
      } else {
        var u = Object.keys(r)
        e = u.length
        for (var a = 0; e > a; a++) {
          var s = u[a]
          o += i(s) + i(r[s])
        }
      }
      if (16 > e) return 1 + o
      if (65536 > e) return 3 + o
      if (4294967296 > e) return 5 + o
      throw new Error('Array or object too long 0x' + e.toString(16))
    }
    throw new Error('Unknown type ' + t)
  }
  function o(r) {
    var t = new ArrayBuffer(i(r)),
      n = new DataView(t)
    return e(r, n, 0), new Uint8Array(t)
  }
  function a(r, t, n) {
    return t ? new r(t.buffer, t.byteOffset, t.byteLength / (n || 1)) : void 0
  }
  function u(r) {
    return a(DataView, r)
  }
  function s(r) {
    return a(Uint8Array, r)
  }
  function f(r) {
    return a(Int8Array, r)
  }
  function c(r) {
    return a(Int32Array, r, 4)
  }
  function d(r) {
    return a(Float32Array, r, 4)
  }
  function l(r, t) {
    var n = r.length / 2
    t || (t = new Int16Array(n))
    for (var e = 0, i = 0; n > e; ++e, i += 2)
      t[e] = (r[i] << 8) ^ (r[i + 1] << 0)
    return t
  }
  function v(r, t) {
    var n = r.length
    t || (t = new Uint8Array(2 * n))
    for (var e = u(t), i = 0; n > i; ++i) e.setInt16(2 * i, r[i])
    return s(t)
  }
  function g(r, t) {
    var n = r.length / 4
    t || (t = new Int32Array(n))
    for (var e = 0, i = 0; n > e; ++e, i += 4)
      t[e] = (r[i] << 24) ^ (r[i + 1] << 16) ^ (r[i + 2] << 8) ^ (r[i + 3] << 0)
    return t
  }
  function L(r, t) {
    var n = r.length
    t || (t = new Uint8Array(4 * n))
    for (var e = u(t), i = 0; n > i; ++i) e.setInt32(4 * i, r[i])
    return s(t)
  }
  function h(r, t) {
    var n = r.length
    t || (t = new Float32Array(n / 4))
    for (var e = u(t), i = u(r), o = 0, a = 0, s = n / 4; s > o; ++o, a += 4)
      e.setFloat32(a, i.getFloat32(a), !0)
    return t
  }
  function y(r, t, n) {
    var e = r.length,
      i = 1 / t
    n || (n = new Float32Array(e))
    for (var o = 0; e > o; ++o) n[o] = r[o] * i
    return n
  }
  function m(r, t, n) {
    var e = r.length
    n || (n = new Int32Array(e))
    for (var i = 0; e > i; ++i) n[i] = Math.round(r[i] * t)
    return n
  }
  function p(r, t) {
    var n, e
    if (!t) {
      var i = 0
      for (n = 0, e = r.length; e > n; n += 2) i += r[n + 1]
      t = new r.constructor(i)
    }
    var o = 0
    for (n = 0, e = r.length; e > n; n += 2)
      for (var a = r[n], u = r[n + 1], s = 0; u > s; ++s) (t[o] = a), ++o
    return t
  }
  function U(r) {
    if (0 === r.length) return new Int32Array()
    var t,
      n,
      e = 2
    for (t = 1, n = r.length; n > t; ++t) r[t - 1] !== r[t] && (e += 2)
    var i = new Int32Array(e),
      o = 0,
      a = 1
    for (t = 1, n = r.length; n > t; ++t)
      r[t - 1] !== r[t]
        ? ((i[o] = r[t - 1]), (i[o + 1] = a), (a = 1), (o += 2))
        : ++a
    return (i[o] = r[r.length - 1]), (i[o + 1] = a), i
  }
  function b(r, t) {
    var n = r.length
    t || (t = new r.constructor(n)), n && (t[0] = r[0])
    for (var e = 1; n > e; ++e) t[e] = r[e] + t[e - 1]
    return t
  }
  function I(r, t) {
    var n = r.length
    t || (t = new r.constructor(n)), (t[0] = r[0])
    for (var e = 1; n > e; ++e) t[e] = r[e] - r[e - 1]
    return t
  }
  function w(r, t) {
    var n,
      e,
      i = r instanceof Int8Array ? 127 : 32767,
      o = -i - 1,
      a = r.length
    if (!t) {
      var u = 0
      for (n = 0; a > n; ++n) r[n] < i && r[n] > o && ++u
      t = new Int32Array(u)
    }
    for (n = 0, e = 0; a > n; ) {
      for (var s = 0; r[n] === i || r[n] === o; ) (s += r[n]), ++n
      ;(s += r[n]), ++n, (t[e] = s), ++e
    }
    return t
  }
  function C(r, t) {
    var n,
      e = t ? 127 : 32767,
      i = -e - 1,
      o = r.length,
      a = 0
    for (n = 0; o > n; ++n) {
      var u = r[n]
      0 === u
        ? ++a
        : (a +=
            u === e || u === i
              ? 2
              : u > 0
              ? Math.ceil(u / e)
              : Math.ceil(u / i))
    }
    var s = t ? new Int8Array(a) : new Int16Array(a),
      f = 0
    for (n = 0; o > n; ++n) {
      var u = r[n]
      if (u >= 0) for (; u >= e; ) (s[f] = e), ++f, (u -= e)
      else for (; i >= u; ) (s[f] = i), ++f, (u -= i)
      ;(s[f] = u), ++f
    }
    return s
  }
  function A(r, t) {
    return b(p(r), t)
  }
  function x(r) {
    return U(I(r))
  }
  function M(r, t, n) {
    return y(p(r, c(n)), t, n)
  }
  function F(r, t) {
    return U(m(r, t))
  }
  function S(r, t, n) {
    return y(b(r, c(n)), t, n)
  }
  function E(r, t, n) {
    return I(m(r, t), n)
  }
  function N(r, t, n) {
    return y(w(r, c(n)), t, n)
  }
  function O(r, t, n) {
    var e = w(r, c(n))
    return S(e, t, d(e))
  }
  function T(r, t, n) {
    return C(E(r, t), n)
  }
  function k(r) {
    var t = u(r),
      n = t.getInt32(0),
      e = t.getInt32(4),
      i = r.subarray(8, 12),
      r = r.subarray(12)
    return [n, r, e, i]
  }
  function j(r, t, n, e) {
    var i = new ArrayBuffer(12 + e.byteLength),
      o = new Uint8Array(i),
      a = new DataView(i)
    return a.setInt32(0, r), a.setInt32(4, t), n && o.set(n, 8), o.set(e, 12), o
  }
  function q(r) {
    var t = r.length,
      n = s(r)
    return j(2, t, void 0, n)
  }
  function D(r) {
    var t = r.length,
      n = L(r)
    return j(4, t, void 0, n)
  }
  function P(r, t) {
    var n = r.length / t,
      e = L([t]),
      i = s(r)
    return j(5, n, e, i)
  }
  function z(r) {
    var t = r.length,
      n = L(U(r))
    return j(6, t, void 0, n)
  }
  function B(r) {
    var t = r.length,
      n = L(x(r))
    return j(8, t, void 0, n)
  }
  function V(r, t) {
    var n = r.length,
      e = L([t]),
      i = L(F(r, t))
    return j(9, n, e, i)
  }
  function G(r, t) {
    var n = r.length,
      e = L([t]),
      i = v(T(r, t))
    return j(10, n, e, i)
  }
  function R(r) {
    var t = {}
    return (
      rr.forEach(function (n) {
        void 0 !== r[n] && (t[n] = r[n])
      }),
      r.bondAtomList && (t.bondAtomList = D(r.bondAtomList)),
      r.bondOrderList && (t.bondOrderList = q(r.bondOrderList)),
      (t.xCoordList = G(r.xCoordList, 1e3)),
      (t.yCoordList = G(r.yCoordList, 1e3)),
      (t.zCoordList = G(r.zCoordList, 1e3)),
      r.bFactorList && (t.bFactorList = G(r.bFactorList, 100)),
      r.atomIdList && (t.atomIdList = B(r.atomIdList)),
      r.altLocList && (t.altLocList = z(r.altLocList)),
      r.occupancyList && (t.occupancyList = V(r.occupancyList, 100)),
      (t.groupIdList = B(r.groupIdList)),
      (t.groupTypeList = D(r.groupTypeList)),
      r.secStructList && (t.secStructList = q(r.secStructList, 1)),
      r.insCodeList && (t.insCodeList = z(r.insCodeList)),
      r.sequenceIndexList && (t.sequenceIndexList = B(r.sequenceIndexList)),
      (t.chainIdList = P(r.chainIdList, 4)),
      r.chainNameList && (t.chainNameList = P(r.chainNameList, 4)),
      t
    )
  }
  function H(r) {
    function t(r) {
      for (var t = {}, n = 0; r > n; n++) {
        var e = o()
        t[e] = o()
      }
      return t
    }
    function n(t) {
      var n = r.subarray(a, a + t)
      return (a += t), n
    }
    function e(t) {
      var n = r.subarray(a, a + t)
      a += t
      var e = 65535
      if (t > e) {
        for (var i = [], o = 0; o < n.length; o += e)
          i.push(String.fromCharCode.apply(null, n.subarray(o, o + e)))
        return i.join('')
      }
      return String.fromCharCode.apply(null, n)
    }
    function i(r) {
      for (var t = new Array(r), n = 0; r > n; n++) t[n] = o()
      return t
    }
    function o() {
      var o,
        s,
        f = r[a]
      if (0 === (128 & f)) return a++, f
      if (128 === (240 & f)) return (s = 15 & f), a++, t(s)
      if (144 === (240 & f)) return (s = 15 & f), a++, i(s)
      if (160 === (224 & f)) return (s = 31 & f), a++, e(s)
      if (224 === (224 & f)) return (o = u.getInt8(a)), a++, o
      switch (f) {
        case 192:
          return a++, null
        case 194:
          return a++, !1
        case 195:
          return a++, !0
        case 196:
          return (s = u.getUint8(a + 1)), (a += 2), n(s)
        case 197:
          return (s = u.getUint16(a + 1)), (a += 3), n(s)
        case 198:
          return (s = u.getUint32(a + 1)), (a += 5), n(s)
        case 202:
          return (o = u.getFloat32(a + 1)), (a += 5), o
        case 203:
          return (o = u.getFloat64(a + 1)), (a += 9), o
        case 204:
          return (o = r[a + 1]), (a += 2), o
        case 205:
          return (o = u.getUint16(a + 1)), (a += 3), o
        case 206:
          return (o = u.getUint32(a + 1)), (a += 5), o
        case 208:
          return (o = u.getInt8(a + 1)), (a += 2), o
        case 209:
          return (o = u.getInt16(a + 1)), (a += 3), o
        case 210:
          return (o = u.getInt32(a + 1)), (a += 5), o
        case 217:
          return (s = u.getUint8(a + 1)), (a += 2), e(s)
        case 218:
          return (s = u.getUint16(a + 1)), (a += 3), e(s)
        case 219:
          return (s = u.getUint32(a + 1)), (a += 5), e(s)
        case 220:
          return (s = u.getUint16(a + 1)), (a += 3), i(s)
        case 221:
          return (s = u.getUint32(a + 1)), (a += 5), i(s)
        case 222:
          return (s = u.getUint16(a + 1)), (a += 3), t(s)
        case 223:
          return (s = u.getUint32(a + 1)), (a += 5), t(s)
      }
      throw new Error('Unknown type 0x' + f.toString(16))
    }
    var a = 0,
      u = new DataView(r.buffer)
    return o()
  }
  function W(r, t, n, e) {
    switch (r) {
      case 1:
        return h(t)
      case 2:
        return f(t)
      case 3:
        return l(t)
      case 4:
        return g(t)
      case 5:
        return s(t)
      case 6:
        return p(g(t), new Uint8Array(n))
      case 7:
        return p(g(t))
      case 8:
        return A(g(t))
      case 9:
        return M(g(t), g(e)[0])
      case 10:
        return O(l(t), g(e)[0])
      case 11:
        return y(l(t), g(e)[0])
      case 12:
        return N(l(t), g(e)[0])
      case 13:
        return N(f(t), g(e)[0])
      case 14:
        return w(l(t))
      case 15:
        return w(f(t))
    }
  }
  function X(r, t) {
    t = t || {}
    var n = t.ignoreFields,
      e = {}
    return (
      nr.forEach(function (t) {
        var i = n ? -1 !== n.indexOf(t) : !1,
          o = r[t]
        i ||
          void 0 === o ||
          (o instanceof Uint8Array ? (e[t] = W.apply(null, k(o))) : (e[t] = o))
      }),
      e
    )
  }
  function J(r) {
    return String.fromCharCode.apply(null, r).replace(/\0/g, '')
  }
  function K(r, t, n) {
    n = n || {}
    var e,
      i,
      o,
      a,
      u,
      s,
      f = n.firstModelOnly,
      c = t.onModel,
      d = t.onChain,
      l = t.onGroup,
      v = t.onAtom,
      g = t.onBond,
      L = 0,
      h = 0,
      y = 0,
      m = 0,
      p = 0,
      U = -1,
      b = r.chainNameList,
      I = r.secStructList,
      w = r.insCodeList,
      C = r.sequenceIndexList,
      A = r.atomIdList,
      x = r.bFactorList,
      M = r.altLocList,
      F = r.occupancyList,
      S = r.bondAtomList,
      E = r.bondOrderList
    for (e = 0, i = r.chainsPerModel.length; i > e && !(f && L > 0); ++e) {
      var N = r.chainsPerModel[L]
      for (c && c({ chainCount: N, modelIndex: L }), o = 0; N > o; ++o) {
        var O = r.groupsPerChain[h]
        if (d) {
          var T = J(r.chainIdList.subarray(4 * h, 4 * h + 4)),
            k = null
          b && (k = J(b.subarray(4 * h, 4 * h + 4))),
            d({
              groupCount: O,
              chainIndex: h,
              modelIndex: L,
              chainId: T,
              chainName: k
            })
        }
        for (a = 0; O > a; ++a) {
          var j = r.groupList[r.groupTypeList[y]],
            q = j.atomNameList.length
          if (l) {
            var D = null
            I && (D = I[y])
            var P = null
            r.insCodeList && (P = String.fromCharCode(w[y]))
            var z = null
            C && (z = C[y]),
              l({
                atomCount: q,
                groupIndex: y,
                chainIndex: h,
                modelIndex: L,
                groupId: r.groupIdList[y],
                groupType: r.groupTypeList[y],
                groupName: j.groupName,
                singleLetterCode: j.singleLetterCode,
                chemCompType: j.chemCompType,
                secStruct: D,
                insCode: P,
                sequenceIndex: z
              })
          }
          for (u = 0; q > u; ++u) {
            if (v) {
              var B = null
              A && (B = A[m])
              var V = null
              x && (V = x[m])
              var G = null
              M && (G = String.fromCharCode(M[m]))
              var R = null
              F && (R = F[m]),
                v({
                  atomIndex: m,
                  groupIndex: y,
                  chainIndex: h,
                  modelIndex: L,
                  atomId: B,
                  element: j.elementList[u],
                  atomName: j.atomNameList[u],
                  formalCharge: j.formalChargeList[u],
                  xCoord: r.xCoordList[m],
                  yCoord: r.yCoordList[m],
                  zCoord: r.zCoordList[m],
                  bFactor: V,
                  altLoc: G,
                  occupancy: R
                })
            }
            m += 1
          }
          if (g) {
            var H = j.bondAtomList
            for (u = 0, s = j.bondOrderList.length; s > u; ++u)
              g({
                atomIndex1: m - q + H[2 * u],
                atomIndex2: m - q + H[2 * u + 1],
                bondOrder: j.bondOrderList[u]
              })
          }
          y += 1
        }
        h += 1
      }
      if (((p = U + 1), (U = m - 1), g && S))
        for (u = 0, s = S.length; s > u; u += 2) {
          var W = S[u],
            X = S[u + 1]
          ;((W >= p && U >= W) || (X >= p && U >= X)) &&
            g({ atomIndex1: W, atomIndex2: X, bondOrder: E ? E[u / 2] : null })
        }
      L += 1
    }
  }
  function Q(r) {
    return o(R(r))
  }
  function Y(r, t) {
    r instanceof ArrayBuffer && (r = new Uint8Array(r))
    var n
    return (n = r instanceof Uint8Array ? H(r) : r), X(n, t)
  }
  function Z(r, t, n, e) {
    function i() {
      try {
        var r = Y(o.response)
        n(r)
      } catch (t) {
        e(t)
      }
    }
    var o = new XMLHttpRequest()
    o.addEventListener('load', i, !0),
      o.addEventListener('error', e, !0),
      (o.responseType = 'arraybuffer'),
      o.open('GET', t + r.toUpperCase()),
      o.send()
  }
  function $(r, t, n) {
    Z(r, or, t, n)
  }
  function _(r, t, n) {
    Z(r, ar, t, n)
  }
  var rr = [
      'mmtfVersion',
      'mmtfProducer',
      'unitCell',
      'spaceGroup',
      'structureId',
      'title',
      'depositionDate',
      'releaseDate',
      'experimentalMethods',
      'resolution',
      'rFree',
      'rWork',
      'bioAssemblyList',
      'ncsOperatorList',
      'entityList',
      'groupList',
      'numBonds',
      'numAtoms',
      'numGroups',
      'numChains',
      'numModels',
      'groupsPerChain',
      'chainsPerModel'
    ],
    tr = [
      'xCoordList',
      'yCoordList',
      'zCoordList',
      'groupIdList',
      'groupTypeList',
      'chainIdList',
      'bFactorList',
      'atomIdList',
      'altLocList',
      'occupancyList',
      'secStructList',
      'insCodeList',
      'sequenceIndexList',
      'chainNameList',
      'bondAtomList',
      'bondOrderList'
    ],
    nr = rr.concat(tr),
    er = 'v1.1.0dev',
    ir = '//mmtf.rcsb.org/v1.0/',
    or = ir + 'full/',
    ar = ir + 'reduced/'
  ;(r.encode = Q),
    (r.decode = Y),
    (r.traverse = K),
    (r.fetch = $),
    (r.fetchReduced = _),
    (r.version = er),
    (r.fetchUrl = or),
    (r.fetchReducedUrl = ar),
    (r.encodeMsgpack = o),
    (r.encodeMmtf = R),
    (r.decodeMsgpack = H),
    (r.decodeMmtf = X)
})
