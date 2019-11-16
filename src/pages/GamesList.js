import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';

import {useStyles as AppUseStyles} from '../App.js';
import {GamePage} from './GamePage.js'
import {
  useRouteMatch,
  Switch,
  Route,
} from "react-router-dom";

import {PrintGames} from '../PagesUtils.js';
import {getParticipatedGames, getCreatedGames} from '../user.js';

export function GamesListPage(){
  let { path, url } = useRouteMatch();
  
   return(
          <Switch>

          <Route exact path={path}>
            <Home path = {path} url = {url}/>
          </Route>

          <Route path={`${path}/GamePage/:id`} exact component={GamePage} />

      </Switch>
      );

};


function Home(props){
  const classes = AppUseStyles();
    let url = props.url;

    return (
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={classes.paper} >
            <Typography component="h1" variant="h2" justify="center">
              Games List
            </Typography>
        
          <GetGamesComponents url={url}/>
                    
          </div>

          
         
        </Container>
      );
}


function GetGamesComponents(props){
  let url = props.url;
    return (

     

    <Box mt={5} m={1}>
    <Typography variant="h5" component="h3" justify="center">
        Games I Created
    </Typography>
<GetCreatedGamesComponents url={url}/>

<Typography variant="h5" component="h3">
        Games I Was Participated In
    </Typography>

    <GetParticipatedGamesComponents url={url}/>
    </Box>
    
        );

}
function GetCreatedGamesComponents(props){
    return (<PrintGames classes={AppUseStyles()} games= {getCreatedGames()} url ={props.url}/>);
}
function GetParticipatedGamesComponents(props){
  return (<PrintGames classes={AppUseStyles()} games= {getParticipatedGames()} url ={props.url}/>);
}

