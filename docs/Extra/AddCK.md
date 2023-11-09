# 添加Cookie

::: warning

**前提是绑定了UID**

以下方法选择其一即可

:::

::: tip

添加Stoken会**自动**补充添加Cookie

:::

- 进入[观测枢](https://bbs.mihoyo.com/ys/obc/?bbs_presentation_style=no_header)，在页面上右键检查或者Ctrl+Shift+i, 复制以下代码到控制台
  - 按下确认自动复制CK、私聊发送给Bot即可

```javascript
var cookie = document.cookie;
var Str_Num = cookie.indexOf('_MHYUUID=');
cookie = '添加 ' + cookie.substring(Str_Num);
var ask = confirm('Cookie:' + cookie + '\n\n按确认，然后粘贴发送给机器人');
if (ask == true) {
  copy(cookie);
  msg = cookie
} else {
  msg = 'Cancel'
}
```

- 直接[添加Stoken](#添加Stoken)

- 群聊发送 `扫码登陆`，进入米游社扫码登录即可完成绑定

::: warning

QQ BOT 因为发送二维码 可能会遭到腾讯风控

`扫码登陆`会**一并**添加`Stoken`

:::

## 添加Stoken

```javascript
var cookie = document.cookie;
var ask = confirm('Cookie:' + cookie + '\n\nDo you want to copy the cookie to the clipboard?');
if (ask == true) {
  copy("添加 stoken" + cookie);
  msg = cookie
} else {
  msg = 'Cancel'
}
```

1. 复制上面全部代码，然后打开http://user.mihoyo.com/
2. 在页面上右键检查或者Ctrl+Shift+i
3. 选择控制台（Console），粘贴，回车，在弹出的窗口点确认（点完自动复制）
4. 然后在和机器人的私聊窗口，粘贴发送即可