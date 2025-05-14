import React, {useEffect, useRef} from "react";
import "./styles.css";
import testImage from "../../../../shared/image/testImage.png"

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
    const members: Member[] = [
        {id: 1, name: "윤현기aaaaa", img: testImage, status: "online"},
        {id: 2, name: "임형택", img: testImage, status: "online"},
        {id: 3, name: "박민준", img: testImage, status: "online"},
        {id: 4, name: "서지수", img: testImage, status: "offline"},
        {id: 5, name: "김유정", img: testImage, status: "offline"},
        {id: 6, name: "이동훈", img: testImage, status: "offline"},
    ];

    const messages: Message[] = [
        {id: 1, sender: "임형택", img: "asd", time: "5/14 13:50", content: "형"},
        {id: 2, sender: "임형택", img: "asd", time: "5/14 13:50", content: "담배 피러 가실래요?"},
        {id: 3, sender: "윤현기", img: "asd", time: "5/14 13:50", content: "나는 백 엔드의 신이다"},
        {id: 4, sender: "윤현기", img: "asd", time: "5/14 13:50", content: "무릎을 꿇어라 밍나놈"},
        {id: 5, sender: "임형택", img: "asd", time: "5/14 13:51", content: "ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ"},
        {id: 6, sender: "박민준", img: "asd", time: "5/14 13:52", content: "여러분 안녕하세요!"},
        {id: 7, sender: "박민준", img: "asd", time: "5/14 13:52", content: "이번 프로젝트 진행 상황 공유할게요."},
        {id: 8, sender: "윤현기", img: "asd", time: "5/14 13:53", content: "네, 잘 부탁드립니다."},
        {id: 9, sender: "임형택", img: "asd", time: "5/14 13:54", content: "이번 주까지 마무리 해야 합니다."},
        {id: 10, sender: "박민준", img: "asd", time: "5/14 13:55", content: "회의는 내일 3시로 잡았습니다."},
        {id: 11, sender: "윤현기", img: "asd", time: "5/14 13:56", content: "좋아요. 준비 잘 하겠습니다."},
        {id: 12, sender: "임형택", img: "asd", time: "5/14 13:57", content: "아, 그리고 이번 주 금요일 회식도 잊지 마세요."},
        {id: 13, sender: "박민준", img: "asd", time: "5/14 13:58", content: "좋아요! 기대됩니다."},
        {id: 14, sender: "서지수", img: "asd", time: "5/14 13:59", content: "회식 장소는 어디인가요?"},
        {id: 15, sender: "임형택", img: "asd", time: "5/14 14:00", content: "작년 갔던 그 고깃집이에요."},
        {id: 16, sender: "윤현기", img: "asd", time: "5/14 14:01", content: "오, 거기 맛있죠."},
        {id: 17, sender: "서지수", img: "asd", time: "5/14 14:02", content: "참석 여부 체크해 주세요."},
        {id: 18, sender: "박민준", img: "asd", time: "5/14 14:03", content: "저는 갈게요!"},
        {id: 19, sender: "임형택", img: "asd", time: "5/14 14:04", content: "좋습니다."},
        {id: 20, sender: "윤현기", img: "asd", time: "5/14 14:05", content: "저도요!"},
        {id: 21, sender: "서지수", img: "asd", time: "5/14 14:06", content: "완벽하네요."},
        {id: 22, sender: "임형택", img: "asd", time: "5/14 14:10", content: "그럼 회의 준비도 잊지 말고요."},
        {id: 23, sender: "박민준", img: "asd", time: "5/14 14:11", content: "네, 문서 정리 중입니다."},
        {id: 24, sender: "윤현기", img: "asd", time: "5/14 14:12", content: "개발 일정도 체크해 보겠습니다."},
        {id: 25, sender: "서지수", img: "asd", time: "5/14 14:13", content: "수고 많으십니다 여러분."},
        {id: 26, sender: "임형택", img: "asd", time: "5/14 14:14", content: "화이팅!"},
    ];


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
                                    <img src={testImage}/> {/* 이미지 추가 해야하ㅁ */}
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
