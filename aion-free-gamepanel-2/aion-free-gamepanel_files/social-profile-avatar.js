define(["exports","packages/jquery","packages/4game-api-client"],function(exports,e,t){"use strict";function s(e){return e&&e.__esModule?e:{"default":e}}Object.defineProperty(exports,"__esModule",{value:!0});var r=s(e),i=s(t),a=i["default"].user.identityTypes,o=a.VKONTAKTE,g=a.FACEBOOK,c=a.ODNOKLASSNIKI,p=a.YANDEX;exports["default"]={resolveImgUrl:function(){var e=this;if(this.state.userId)switch(this.props.contactType){case o:r["default"].getJSON("https://api.vk.com/method/users.get?uids="+this.state.userId+"&fields=photo_100&callback=?").then(function(t){var s;try{s=t.response[0].photo_100}catch(r){}s&&e.isMounted()&&e.setState({imgUrl:s,progress:!1})});break;case g:this.setState({imgUrl:"https://graph.facebook.com/"+this.state.userId+"/picture?type=normal&width=80&height=80",progress:!1});break;case c:this.props.accessToken?i["default"].user.getAvatar(c,{accessToken:this.props.accessToken}).then(function(t){e.setState({imgUrl:t.url,progress:!1})}):this.setState({imgUrl:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAACgElEQVR42u1ZXW/aMBQtgRXBCpU2CVRVadEgEx0ZUktho4Stz/Pr+jL+///YiXpUt9iOEx64rpQrHRkTX+sefD98w0kttdRSy0Hy5++/j+ppN8J4B2TAYz5yPsqfh06gDcxo+KPi+DJ/0p+5rh0iiR6wxknQUBOWZ2ugHxKJPrClcVWxJRlxEi3gZ1nDbSdG/ZY0kbHHSI3imBlLkmjaXIqEfgNfGTstjgm/N9Zzn6YUkYFhkP6lhw6dYcEpDWTdynSXtEgPa1JD73mcSBH55gjooUdvqEm/wUyKyJyG7wf6Z4/eJxsRhf2kiExfiLx1kdijFztiZCpFZOQw6AcQ2eNjF+HZyqE3kiJyrt3CyF4zoGmka97FHDiXrCWrAsMeQGoMXDLDrW0FUT1jJV3ZB8BhFZ2nx3EQwn0rdRpd7r6VhnL7bcHg2wMvjXdyF0Z3NrpR1dzshtktPGGxW7zyfZt7LfJ176Vv7wCXIJKwcCb5HOiEZmgETICMSIAPFfc4JdGMmABRCA3VloR6vv6eBLbUlWuw+AtaqzrnG2DO5upLPnK+MS+ZBPWOTWRTvvhVQnZsIok31fpJArt9solEsE+1AUZf4vjsBveLJN9pzT2Gm3OOxBzP+6Gk4y6DelnyirLk+m6wL7BfJwLlyExBv8jmqTyUCXSu6wZJQpGEbpiK068imeBOwrggvqeTgfFd3cI6kbqbLAD6omRgQIf/iRR1gzFPLVaONcQ630/CnRrAUhVX7nhPJy4qjNyvcWwiZx53unLoXXla354YEbOiaxJeMibOJFxrYTHkuqT+taVo3gMNiTg5ZUbK+PfZRUX9C+r9Ar7jNNsntdRSSy0++Q+/+QHLUuA6SAAAAABJRU5ErkJggg==",progress:!1});break;case p:var t=require.resolve({"*":"st1-ru.4gametest.com","*@live":"st1-ru.4game.com"}),s=String(this.state.userId),a=s.substr(0,2),A=s.substr(2,2);""===A&&(A=a),this.setState({imgUrl:"https://"+t+"/-c/4game/oauth/ya/"+a+"/"+A+"/"+s,progress:!1})}}}});
//# sourceMappingURL=social-profile-avatar.js.map