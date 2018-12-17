import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';

import LoginPage from './login/login.js';
import MenuPage from './menu/menu.js';

const Routes = () => (
    <BrowserRouter>
        <div>
            <Switch>
                <Route path="/login" component={LoginPage}/>
                <Route path="/menu" component={MenuPage}/>
            </Switch>
        </div>
    </BrowserRouter>
);

export default Routes;