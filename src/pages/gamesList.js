import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import {useStyles as AppUseStyles} from './../App.js';

export function GamesListPage(){
    const classes = AppUseStyles();
    
    return (
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={classes.paper} >
            <Typography component="h1" variant="h2" justify="center">
              Games List
            </Typography>
        
          <GetGamesComponents />
                    
          </div>

          

        </Container>
      );

};

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


function GetGamesComponents(){
    return (
    <Box mt={5} m={1}>
    <Typography variant="h5" component="h3" justify="center">
        Games I Created
    </Typography>
<GetCreatedGamesComponents/>

<Typography variant="h5" component="h3">
        Games I Was Participated In
    </Typography>

    <GetParticipatedGamesComponents/>
    </Box>
    
        );

}
function GetCreatedGamesComponents(){
    return (<GetGamesComponentsByGames games= {getCreatedGames()}/>);
}
function GetParticipatedGamesComponents(){
  return (<GetGamesComponentsByGames games= {getParticipatedGames()}/>);
}


function GetGamesComponentsByGames(props){
    const games =props.games;
    const classes = AppUseStyles();

    return (<List className={classes.list}>
          {games.map(({ id, date, playersNum }) => (
            <React.Fragment key={id}>
              <ListItem button  className={classes.gamesListItems}>
                <ListItemText primary={'date: '+date} secondary={'number of participants : '+playersNum} />
              </ListItem>
            </React.Fragment>
          ))}
        </List>);
}