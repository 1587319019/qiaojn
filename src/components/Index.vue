<template>
    <div class="wrapper">
        <div class="sidebar">
            <info></info>
            <list></list>
        </div>
        <div class="main">
            <message v-if="showText"></message>
            <text-area v-if="showText"></text-area>
        </div>
    </div>
</template>

<script>
import List from "./indexItem/List";
import Info from "./indexItem/Info";
import TextArea from "./indexItem/TextArea";
import Message from "./indexItem/Message";
import {
    wsMsgSender,
    send2Friend,
    send2Group
} from "../assets/scripts/ws/msgSender.js";
import { wsNoticeEvent } from "../assets/scripts/ws/noticeEvent";
import { mapGetters, mapActions } from "vuex";
import Common from "../assets/scripts/common.js";

export default {
    name: "Index",
    components: {
        List,
        Info,
        TextArea,
        Message
    },
    computed: {
        showText: function() {
            let show = 0;
            if (
                this.tabType == 1 &&
                this.currentGroup.groupId &&
                this.currentGroup.groupId != ""
            ) {
                show = 1;
            }

            if (
                this.tabType == 0 &&
                this.currentFriend.friendId &&
                this.currentFriend.friendId != ""
            ) {
                show = 1;
            }
            return show;
        },
        ...mapGetters(["currentGroup", "user", "currentFriend", "tabType"])
    },
    methods: {
        //桌面消息通知相关
        notice: function(id, isGroup) {
            var that = this;
            if (Notification.permission == "granted") {
                that.showNotice(id, isGroup);
            } else if (Notification.permission != "denied") {
                Notification.requestPermission(function(permission) {
                    if (permission == "granted") {
                        that.showNotice(id, isGroup);
                    }
                });
            }
        },

        showNotice: function(id, isGroup) {
            var that = this;
            var name = "";
            var info;
            var headImg;
            if (isGroup) {
                info = that.$store.getters.GroupInfo(id);
                name = info ? info.groupNickname || info.groupName : "";
                headImg = info ? info.groupHeadImg : "";
            } else {
                info = that.$store.getters.friendInfo(id);
                headImg = info ? info.headImg : "";
                name = info ? info.nickname || info.username : "";
            }
            var notification = new Notification("新消息提示", {
                body: name
                    ? "哎呦，你有来自" + name + "的新消息~"
                    : "哎呦，你有新消息~",
                icon: headImg,
                tag: new Date(),
                renotify: true
            });
            that.timer = setTimeout(function() {
                notification.close();
                setTimeout(that.timer);
            }, 5000);
            notification.onclick = function() {
                notification.close();
                setTimeout(that.timer);
            };
        },

        ...mapActions([
            "updateSessions",
            "updateApplyList",
            "updateGroupFriendList",
            "updateFriendList",
            "updateGroupList",
            "updateGroupSessions"
        ])
    },

    mounted() {
        let that = this;
        // this.$socket.emit('sendMsg',{  
        //     type: '01',  
        //     userId: 'e8532e307e5f44929aabc7d4d12bd7f3'  
        // }); 
        //wsMsgSender("://101.132.66.50:6789");
        wsNoticeEvent(
            "ws://101.132.66.50:6789",
            function(event) {},
            function(event) {},
            function(event) {},
            {
                chat_f2f: function(data) {
                    var item = {
                        id: data.fromUserId,
                        session: {}
                    };
                    item.session = {
                        content: data.data.msg,
                        date: new Date().getTime(),
                        self: false
                    };
                    // 桌面消息通知
                    if (window.Notification) {
                        that.notice(data.fromUserId, false);
                    }
                    // 更新朋友会话信息
                    that.updateSessions(item);
                },
                chat_group: function(data) {
                    var item = {
                        id: data.data.toGroupId,
                        session: {}
                    };

                    item.session = {
                        content: data.data.msg || "",
                        date: new Date().getTime(),
                        self: false,
                        userId: data.fromUserId
                    };

                    // 桌面消息通知
                    if (window.Notification) {
                        that.notice(data.data.toGroupId, true);
                    }
                    that.updateGroupSessions(item);
                },
                friend_add: function(data) {
                    that.updateApplyList({ isGroup: false, info: data });
                },
                friend_add_result: function(data) {
                    let result = data.data;
                    if (result.agree) {
                        that.$notify({
                            title: "提示",
                            message:
                                (result.nickname || result.username) +
                                "已添加你为好友",
                            type: "success"
                        });
                        let tempList = [];
                        let tempItem = {
                            username: result.username || "",
                            nickname: result.nickname || "",
                            headImg: result.headImg || "",
                            sex: result.sex || "",
                            sign: result.sign || "",
                            remark: result.remark || "",
                            userId: result.userId,
                            status: result.status || "1",
                            isRead: true
                        };
                        tempList.push(tempItem);
                        that.updateFriendList({
                            list: tempList,
                            type: 1
                        });
                    } else {
                        that.$notify({
                            title: "提示",
                            message:
                                "喔豁" +
                                (result.nickname || result.username) +
                                "已拒绝添加你为好友",
                            type: "warning"
                        });
                    }
                },
                friend_status_change: function(data) {
                    // 更新好友列表中好友的状态
                    that.updateFriendList({
                        list: data,
                        type: 2
                    });
                }
            },
            function() {
                // 与服务器断开连接且无法重连时调用
                that.$notify({
                    title: "提示",
                    message: "掉线了",
                    type: "warning"
                });
            }
        );
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style type="text/css" lang="scss">
.wrapper {
    margin: 0.5rem auto;
    width: 8rem;
    height: 6rem;

    overflow: hidden;
    border-radius: 0.03rem;

    .sidebar,
    .main {
        height: 100%;
    }
    .sidebar {
        float: left;
        width: 2rem;
        color: #f4f4f4;
        background-color: #2e3238;
    }
    .main {
        position: relative;
        overflow: hidden;
        background-color: #eee;
    }
}
.el-dialog__body {
    padding: 0.1rem 0.2rem;
}
</style>
