import React, { useState } from "react";

const FullscreenImage = ({ imageName, caption }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const imageUrl = require(`./images/${imageName}`);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <div style={{ margin: "20px" }}>
            {isFullscreen ? (
                <div
                    className={`fullscreen-overlay ${
                        isFullscreen ? "open" : "close"
                    }`}
                    onClick={toggleFullscreen}
                >
                    <img
                        src={imageUrl}
                        alt="Fullscreen"
                        className="fullscreen-image"
                    />
                    {/* <div className="image-caption">{caption}</div> */}
                </div>
            ) : (
                <div>
                    <img
                        src={imageUrl}
                        alt="Thumbnail"
                        onClick={toggleFullscreen}
                        className="thumbnail-image"
                    />
                    <div className="image-caption">{caption}</div>
                </div>
            )}
        </div>
    );
};

export default FullscreenImage;
