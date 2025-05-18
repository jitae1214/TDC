"use client";

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles.css";
import chatImage from "../../../../shared/image/chat.png"

type Member = {
    id: number;
    name: string;
    img: string;
    status: "online" | "offline";
};

type Message = {
    id: number;
    sender: string;
    img: string;
    time: string;
    content: string;
};

type GroupedMessage = {
    id: number;
    sender: string;
    time: string;
    contents: string[];
};

const WorkspaceChat: React.FC = () => {
    const members: Member[] = [];
    const messages: Message[] = [];

    const groupConsecutiveMessages = (messages: Message[]): GroupedMessage[] => {
        const grouped: GroupedMessage[] = [];
        let currentGroup: GroupedMessage | null = null;

        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            const isSameSender = currentGroup && msg.sender === currentGroup.sender;
            const isSameTime = currentGroup && msg.time === currentGroup.time;

            if (isSameSender && isSameTime && currentGroup) {
                currentGroup.contents.push(msg.content);
            } else {
                currentGroup = {
                    id: msg.id,
                    sender: msg.sender,
                    time: msg.time,
                    contents: [msg.content],
                };
                grouped.push(currentGroup);
            }
        }

        return grouped;
    };

    const groupedMessages = groupConsecutiveMessages(messages);
    const chatBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [groupedMessages]);

    return (
        <div className="workspaceChat-container">
            {/* 사이드바 */}
            <div className="workspaceChat-sidebar">
                <div className="workspaceChat-sidebar-menu">홈</div>
                <div className="workspaceChat-sidebar-menu">DM</div>
                <div className="workspaceChat-sidebar-menu">일정관리</div>
                <div className="workspaceChat-sidebar-menu">초대하기</div>
                <div className="workspaceChat-sidebar-menu">X</div>
                <div className="workspaceChat-sidebar-menu">설정</div>
                <div className="workspaceChat-sidebar-menu">설정</div>
            </div>

            {/* 중앙 유저 목록 */}
            <div className="workspaceChat-memberList">
                {["online", "offline"].map((status) => (
                    <div className="workspaceChat-statusGroup" key={status}>
                        <div className="workspaceChat-statusHeader">
                            {status === "online" ? `온라인 - ${members.filter(m => m.status === "online").length}명` : `오프라인 - ${members.filter(m => m.status === "offline").length}명`}
                        </div>
                        {members
                            .filter((member) => member.status === status)
                            .map((member) => (
                                <div className="workspaceChat-member" key={member.id}>
                                    <img src={member.img} className="workspaceChat-avatar" alt="profile"/>
                                    <span
                                        className={`workspaceChat-status-dot ${status === "online" ? "green" : "gray"}`}></span>
                                    <span className="workspaceChat-name">{member.name}</span>
                                </div>
                            ))}
                    </div>
                ))}
            </div>


            {/* 채팅 영역 */}
            <div className="workspaceChat-chat-container">
                <div className="workspaceChat-chat-header">워크스페이스이름</div>
                <div className="workspaceChat-chat-body" ref={chatBodyRef}>
                    <div className="workspaceChat-chat-message">
                        {groupedMessages.map((group) => (
                            <div key={group.id} className="workspaceChat-message-block">
                                <div className={"workspaceChat-message-senderImage"}>
                                    <img src={chatImage}/> {/* 이미지 추가 해야하ㅁ */}
                                </div>
                                <div>
                                    <div className="workspaceChat-message-header">
                                        <div className="sender-time">
                                            <strong>{group.sender}</strong>
                                            <span className="time">{group.time}</span>
                                        </div>
                                        {/*<button className="settings-button" title="설정">*/}
                                        {/*    ⚙️*/}
                                        {/*</button>*/}
                                    </div>
                                    <div className="workspaceChat-message-body">
                                        {group.contents.map((line, i) => (
                                            <div key={i}>{line}</div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                </div>
                <div className="workspaceChat-inputBox">
                    <input type="text" placeholder="메시지 입력..."/>
                    <div className="workspaceChat-button">📎</div>
                    <div className="workspaceChat-button">😊</div>
                    <div className="workspaceChat-button">s</div>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceChat;
