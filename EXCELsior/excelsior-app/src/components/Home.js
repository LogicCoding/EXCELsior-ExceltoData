import React from "react";
import { Badge, List } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
const Home = () => {
    return (
        <div>
            <h1 style={{justifyContent:"center", alignItems:"center", display:"flex", marginTop: 40, marginBottom:40}} >Welcome to Excelsior</h1>
            <List>
                <li style={{justifyContent:"center", display:"flex", marginBottom:10, fontSize:30}}>
                    <Badge href="#">Home</Badge>
                </li>
                <li style={{justifyContent:"center", display:"flex", marginBottom:10, fontSize:30}}>
                    <Badge href="/download">Download</Badge>
                </li>
                <li style={{justifyContent:"center", display:"flex", marginBottom:10, fontSize:30}}>
                    <Badge href="/upload">Upload</Badge>
                </li>
            </List>
        </div>
    );
};
export default Home;