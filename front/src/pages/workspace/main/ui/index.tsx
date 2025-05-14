import React, {useState} from "react";
import { useNavigate } from 'react-router-dom';
import searchIcon from '../../../../shared/image/search.png'
import dotIcon from '../../../../shared/image/dots.png'
import chatIcon from '../../../../shared/image/chat.png'
import testImage from '../../../../shared/image/testImage.png'
import "./styles.css";


const WorkspaceMain = () => {
    const navigate = useNavigate();

    const handleWorkspaceChat = () => {
        navigate('/workspace/chat');
    }
    return (
        <div className="workspaceMain-container">
            <div className={"workspaceMain-sidebar"}>
                <div>
                    <div className={"workspaceMain-sidebar-button"}>
                        Home
                    </div>
                    <div className={"workspaceMain-sidebar-button"}
                         onClick={handleWorkspaceChat}>
                        DM
                    </div>
                    <div className={"workspaceMain-sidebar-button"}>
                        일정관리
                    </div>
                    <div className={"workspaceMain-sidebar-button"}>
                        초대하기
                    </div>
                    {/*<div className={"workspaceMain-sidebar-button"}>*/}
                    {/*    X*/}
                    {/*</div>*/}
                    <div className={"workspaceMain-sidebar-button"}>
                        설정
                    </div>
                </div>

                <div className={"workspaceMain-sidebar-button workspaceMain-sidebar-profile"}>
                    <img src={testImage} alt=""/>
                    <div className={"workspaceMain-sidebar-onlineCheck"}></div>
                </div>
            </div>
            <div className={"workspaceMain-body"}>
                <div className={"workspaceMain-titleBox"}>
                    <h2>워크스페이스 이름</h2>
                </div>
                <div className={"workspaceMain-searchBox"}>
                    <input placeholder={"검색하기"}/>
                    <span><img src={searchIcon} alt={""} className={"workspaceMain-searchIcon"}/></span>
                </div>
                <div className={"workspaceMain-memberNum"}>
                    <p>맴버 수 - 10명</p>
                </div>
                <div className={"workspaceMain-memberList"}>
                    <div className={"workspaceMain-memberBox"}>
                        <div>
                            <div className={"workspaceMain-memberProfile"}>
                                {/*<img />*/}
                            </div>
                            <div className={"workspaceMain-memberInfo"}>
                                <p>사용자 이름</p>
                                <p>온라인</p>
                            </div>
                        </div>
                        <div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={chatIcon} alt=""/></span>
                            </div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={dotIcon} alt=""/></span>
                            </div>
                        </div>
                    </div>

                    <div className={"workspaceMain-memberBox"}>
                        <div>
                            <div className={"workspaceMain-memberProfile"}>
                                {/*<img />*/}
                            </div>
                            <div className={"workspaceMain-memberInfo"}>
                                <p>사용자 이름</p>
                                <p>온라인</p>
                            </div>
                        </div>
                        <div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={chatIcon} alt=""/></span>
                            </div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={dotIcon} alt=""/></span>
                            </div>
                        </div>
                    </div>

                    <div className={"workspaceMain-memberBox"}>
                        <div>
                            <div className={"workspaceMain-memberProfile"}>
                                {/*<img />*/}
                            </div>
                            <div className={"workspaceMain-memberInfo"}>
                                <p>사용자 이름</p>
                                <p>온라인</p>
                            </div>
                        </div>
                        <div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={chatIcon} alt=""/></span>
                            </div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={dotIcon} alt=""/></span>
                            </div>
                        </div>
                    </div>

                    <div className={"workspaceMain-memberBox"}>
                        <div>
                            <div className={"workspaceMain-memberProfile"}>
                                {/*<img />*/}
                            </div>
                            <div className={"workspaceMain-memberInfo"}>
                                <p>사용자 이름</p>
                                <p>온라인</p>
                            </div>
                        </div>
                        <div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={chatIcon} alt=""/></span>
                            </div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={dotIcon} alt=""/></span>
                            </div>
                        </div>
                    </div>

                    <div className={"workspaceMain-memberBox"}>
                        <div>
                            <div className={"workspaceMain-memberProfile"}>
                                {/*<img />*/}
                            </div>
                            <div className={"workspaceMain-memberInfo"}>
                                <p>사용자 이름</p>
                                <p>온라인</p>
                            </div>
                        </div>
                        <div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={chatIcon} alt=""/></span>
                            </div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={dotIcon} alt=""/></span>
                            </div>
                        </div>
                    </div>

                    <div className={"workspaceMain-memberBox"}>
                        <div>
                            <div className={"workspaceMain-memberProfile"}>
                                {/*<img />*/}
                            </div>
                            <div className={"workspaceMain-memberInfo"}>
                                <p>사용자 이름</p>
                                <p>온라인</p>
                            </div>
                        </div>
                        <div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={chatIcon} alt=""/></span>
                            </div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={dotIcon} alt=""/></span>
                            </div>
                        </div>
                    </div>

                    <div className={"workspaceMain-memberBox"}>
                        <div>
                            <div className={"workspaceMain-memberProfile"}>
                                {/*<img />*/}
                            </div>
                            <div className={"workspaceMain-memberInfo"}>
                                <p>사용자 이름</p>
                                <p>온라인</p>
                            </div>
                        </div>
                        <div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={chatIcon} alt=""/></span>
                            </div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={dotIcon} alt=""/></span>
                            </div>
                        </div>
                    </div>

                    <div className={"workspaceMain-memberBox"}>
                        <div>
                            <div className={"workspaceMain-memberProfile"}>
                                {/*<img />*/}
                            </div>
                            <div className={"workspaceMain-memberInfo"}>
                                <p>사용자 이름</p>
                                <p>온라인</p>
                            </div>
                        </div>
                        <div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={chatIcon} alt=""/></span>
                            </div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={dotIcon} alt=""/></span>
                            </div>
                        </div>
                    </div>

                    <div className={"workspaceMain-memberBox"}>
                        <div>
                            <div className={"workspaceMain-memberProfile"}>
                                {/*<img />*/}
                            </div>
                            <div className={"workspaceMain-memberInfo"}>
                                <p>사용자 이름</p>
                                <p>온라인</p>
                            </div>
                        </div>
                        <div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={chatIcon} alt=""/></span>
                            </div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={dotIcon} alt=""/></span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WorkspaceMain;
