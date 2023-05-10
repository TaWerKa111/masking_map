import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./conteiners/Home";
import { Provider } from "react-redux";
import Layout from "./hocs/Layout";
import TypeWorkQuestions from "./conteiners/questions/TypeWorkQuestions";
import MnObjectQuestions from "./conteiners/questions/MnObjectQuestion";
import MaskingMap from "./conteiners/masking/MaskingMap";
import ProtectedRoute from "./utils/route/index";
import { useEffect, useState } from "react";
import { apiInst } from "./utils/axios";
import LoginForm from "./conteiners/LoginForm";
import Logout from "./conteiners/Logout";
import TypeWorks from "./conteiners/works/TypeWorks";
import Rules from "./conteiners/rules/Rules";
import Locations from "./conteiners/location/Locations";
import Protections from "./conteiners/protection/Protections";
import Rule from "./conteiners/rules/Rule";
import TypeLocations from "./conteiners/location/TypeLocations";
import TypeProtections from "./conteiners/protection/TypeProtections";
import Departments from "./conteiners/works/Departments";
import ParentLocation from "./conteiners/relationship/ParentLocation";
import LocationProtection from "./conteiners/relationship/ProtectionLocation";
import AddRule from "./conteiners/rules/AddRule";
import ChoiceProtections from "./conteiners/protection/ChoiceProtection";
import MaskingMaps from "./conteiners/masking/MaskingMaps";

function App() {
    const [user, setUser] = useState(localStorage.getItem("is_login"));

    useEffect(() => {
        const fetchCurrentUser = () => {
            try {
                apiInst
                    .get("/auth/current-user/", {
                        headers: {
                            Authorization: `${localStorage.getItem(
                                "username"
                            )}:${localStorage.getItem("password")}`,
                        },
                    })
                    .then((resp) => setUser(resp.data));
                console.log(user);
            } catch (error) {
                console.error(error);
            }
        };

        // if (localStorage.getItem("is_login") == "true") {
        //     console.log("is login", localStorage.getItem("is_login"));
        //     setUser({ username: localStorage.getItem("username") });
        // } else {
        //     fetchCurrentUser();
        // }
    }, []);

    const handleLogin = () => {
        apiInst
            .get("/auth/current-user/", {
                headers: {
                    Authorization: `${localStorage.getItem(
                        "username"
                    )}:${localStorage.getItem("password")}`,
                },
            })
            .then((response) => setUser(response.data))
            .catch((e) => console.log(e));
        console.log("log user", user);
    };

    const handleLogout = () => {
        apiInst.get("/auth/logout/").catch((e) => console.log(e));
        setUser(null);
        localStorage.setItem("is_login", false);
        localStorage.removeItem("username");
        localStorage.removeItem("password");
    };

    return (
        <BrowserRouter>
            <Layout user={user}>
                <Routes>
                    <Route exact path="/" element={<Home />} />
                    <Route
                        exact
                        path="/login/"
                        element={<LoginForm onLogin={handleLogin} />}
                    />
                    <Route
                        exact
                        path="/type-works/"
                        element={<TypeWorkQuestions />}
                    />
                    <Route
                        exact
                        path="/locations/"
                        element={<MnObjectQuestions />}
                    />
                    <Route exact path="/questions/" />
                    <Route
                        exact
                        path="/masking-map/"
                        element={<MaskingMap />}
                    />
                    <Route
                        exact
                        path="/list-masking-map/"
                        element={<MaskingMaps />}
                    />

                    {/* <Route path='/rules/' element={ 
                <ProtectedRoute user={user}>
                  <Rules />
                </ProtectedRoute>}>
            </Route>  */}
                    <Route
                        exact
                        path="/logout/"
                        element={<Logout onLogout={handleLogout} />}
                    />
                    <Route path="/expert/rules/" element={<Rules />}></Route>
                    <Route
                        path="/expert/type-works/"
                        element={<TypeWorks />}
                    ></Route>
                    <Route
                        path="/expert/locations/"
                        element={<Locations />}
                    ></Route>
                    <Route
                        path="/expert/protections/"
                        element={<Protections />}
                    ></Route>
                    <Route path="/expert/rule/" element={<Rule />}></Route>
                    <Route
                        path="/expert/add-rule/"
                        element={<AddRule />}
                    ></Route>

                    <Route
                        path="/expert/dep/"
                        element={<Departments />}
                    ></Route>
                    <Route
                        path="/expert/relationship-location-protection/"
                        element={<LocationProtection />}
                    ></Route>
                    <Route
                        path="/expert/type-protections/"
                        element={<TypeProtections />}
                    ></Route>
                    <Route
                        path="/expert/type-locations/"
                        element={<TypeLocations />}
                    ></Route>
                    <Route
                        path="/expert/relationship-location-location/"
                        element={<ParentLocation />}
                    ></Route>
                    <Route
                        path="/expert/choice-protections/"
                        element={<ChoiceProtections />}
                    ></Route>
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
