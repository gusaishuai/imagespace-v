import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';

import Login from './login/login.js';
import Sql from './sql/sql.js';

const Routes = () => (
    <BrowserRouter>
        <div>
            <Switch>
                <Route path="/login" component={Login}/>
                <Route path="/sql" component={Sql}/>
            </Switch>
        </div>
    </BrowserRouter>
);

export default Routes;