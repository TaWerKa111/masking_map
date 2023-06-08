import React, { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";

const NotificationList = () => {
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const fetchNotifications = () => {
        apiInst
            .get("/notify/")
            .then((resp) => {
                setNotifications(resp.data.notifications);
            })
            .catch((e) => console.log(e));
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleClick = () => {
        // const newNotification = {
        //     id: new Date().getTime(),
        //     text: "Новое уведомление",
        // };

        // setNotifications([...notifications,]);
        fetchNotifications();
        setShowNotifications(!showNotifications);
    };

    return (
        <div style={{ position: "relative", display: "inline-block" }}>
            <button className="btn btn-nav" onClick={handleClick}>
                <h2
                    className="navButton"
                    style={{ display: "inline-block", color: "white" }}
                >
                    Уведомления
                </h2>
                {notifications.length > 0 && (
                    <span
                        style={{
                            position: "absolute",
                            top: "",
                            right: "",
                            width: "10px",
                            height: "10px",
                            backgroundColor: "red",
                            borderRadius: "50%",
                            display: "inline-block",
                        }}
                    />
                )}
            </button>
            {showNotifications && (
                <div
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        width: "100%",
                        maxHeight: "200px",
                        overflowY: "auto",
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        padding: "10px",
                        zIndex: 9999,
                    }}
                    className="notify-container"
                >
                    {notifications.map((notification) => (
                        <div
                            className="nofity-item"
                            key={notification.id}
                            style={{ color: "black" }}
                        >
                            {notification.text}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationList;
