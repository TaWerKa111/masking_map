import React from 'react';
import Navbar from "../components/main/Navbar";
import Foot from "../components/main/Foot";

const Layout = (props) => (
    <div>
        <Navbar props={props}/>
            {props.children}
        <Foot/>
    </div>
);

export default Layout;