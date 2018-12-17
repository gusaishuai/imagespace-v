import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';

import Login from './login/login.js';
import Sql from './sql/sql.js';
import Menu1 from './menu.js';

const Routes = () => (
    <BrowserRouter>
        <div>
            <Switch>
                <Route path="/login" component={Login}/>
                <Route path="/sql" component={Sql}/>
                <Route path="/menu" component={Menu1}/>
            </Switch>
        </div>
    </BrowserRouter>
);

export default Routes;