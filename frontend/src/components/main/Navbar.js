import React from 'react';
import '../../style/main.css'
import { Dropdown } from 'react-bootstrap';

const Navbar = (props) => {
    const divStyle = {
        color: '#FFF',
        backgroundColor: '#1B527C'
    }
    const user = props.props.user;
    const aStyle = {
        textDecoration: 'none',
        color: '#FFF',
    }
    console.log("user nav", props.props.user);

    // if (!user){
    //     return (
    //         <div className='container' style={divStyle}>
    //             <div className='row'>
    //                 <h1 className='text-center'>
    //                     Экспертная система для формирования карт маскирования
    //                 </h1>
    //             </div>
    //             <div className='row navbar'>
    //                 <div className='col '>
    //                     <a href='/' style={aStyle}><h2 className='navButton'>Главное меню</h2></a>
    //                 </div>
    //                 <div className='col'>
    //                     <a href='/type-work/' style={aStyle}><h2 className='navButton'>Вопросы</h2></a>
    //                 </div>
    //                 <div className='col'>
    //                     <a href='/login/' style={aStyle}><h2 className='navButton'>Войти</h2></a>
    //                 </div>
    //             </div>
    //         </div>
    //     )
    // }
    // else{
        return (
            <div className='container-fluid' style={divStyle}>
                <div className='row'>
                    <h1 className='text-center'>
                        Экспертная система для формирования карт маскирования
                    </h1>
                </div>
                <div className='row navbar'>
                    <div className='col '>
                        <a href='/expert/' style={aStyle}><h2 className='navButton'>Инструкция</h2></a>
                    </div>
                    <div className='col'>
                        <a href='/expert/type-works/' style={aStyle}><h2 className='navButton'>Виды работ</h2></a>
                    </div>
                    <div className='col'>
                        <a href='/expert/locations/' style={aStyle}><h2 className='navButton'>Локации</h2></a>
                    </div>
                    <div className='col'>
                        <a href='/expert/protections/' style={aStyle}><h2 className='navButton'>Защиты</h2></a>
                    </div>
                    <div className='col'>
                        <a href='/expert/rules/' style={aStyle}><h2 className='navButton'>Правила</h2></a>
                    </div>
                    <div className='col'>
                        <Dropdown>
                            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                                Прочее
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item href="/expert/dep/">Отделы работы</Dropdown.Item>
                                <Dropdown.Item href="/expert/type-locations/">Типы локаций</Dropdown.Item>
                                <Dropdown.Item href="/expert/type-protections/">Типы защит</Dropdown.Item>
                                <Dropdown.Item href="/expert/relationship-location-location/">Связать локации и их компоненты</Dropdown.Item>
                                <Dropdown.Item href="/expert/relationship-location-protection/">Связать локации и их защиты</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    <div className='col'>
                        <a href='/logout/' style={aStyle}><h2 className='navButton'>Выйти</h2></a>
                    </div>
                </div>
            </div>
        )
    // }
};

export default Navbar;