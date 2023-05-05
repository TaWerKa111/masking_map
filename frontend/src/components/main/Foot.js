import React from 'react';

const Foot = () => {

    const divStyle = {
        color: '#FFF',
        backgroundColor: '#1B527C',
    }

    const aStyle = {
        textDecoration: 'none',
        color: '#FFF',
    }

    return (
        <div className='fixed-bottom panel-footer' style={divStyle}>
            <div className='container'>
                <div className='row'>
                    <div className='col-5'>
                        Copyright© 2023
                    </div>
                    <div className='col-5'>
                        <a href='https://t.me/gleb4lk' style={aStyle}>Telegram</a>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Foot;
