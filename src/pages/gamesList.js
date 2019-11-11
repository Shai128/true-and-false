import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import {useStyles as AppUseStyles} from './../App.js';
import {GamePage} from './GamePage.js'
import {
  useRouteMatch,
  Switch,
  Route,
    Link,
} from "react-router-dom";
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
/*

          <Route path={`${path}/GamePage/:id`}>
            <GamePage game={{date:'1.1.1111'}} />
            </Route> */

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

function getCreatedGames(){
    return [
        {
        id:0,
        date: '8.11.2019',
        playersNum: 3
    },
    {
        id:1,
        date: '6.11.2019',
        playersNum: 20
    }];
}


function getParticipatedGames(){
    return [
        {
        id: 0,
        date: '20.3.2017',
        playersNum: 5
    },
    {
        id:1,
        date: '22.3.2017',
        playersNum: 100
    }];
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
    return (<GetGamesComponentsByGames games= {getCreatedGames()} url ={props.url}/>);
}
function GetParticipatedGamesComponents(props){
  return (<GetGamesComponentsByGames games= {getParticipatedGames()} url ={props.url}/>);
}


function GetGamesComponentsByGames(props){
    const games =props.games;
    const classes = AppUseStyles();
    let url = props.url;
    return (<List className={classes.list}>
          {games.map(({ id, date, playersNum }) => (
            <React.Fragment key={id}>
              <Link to={
                {
                  pathname: `${url}/GamePage/`+id,
                  game: games[id]
                }
              }
              >
              <ListItem button  className={classes.gamesListItems}>
                <ListItemText primary={'date: '+date} secondary={'number of participants : '+playersNum} />
              </ListItem>
              </Link>
            </React.Fragment>
          ))}
        </List>);
}