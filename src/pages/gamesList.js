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

    console.log('got here');
    
    return (
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div id='try' className={classes.paper} >
            <Typography component="h1" variant="h2" alignItems="center" justify="center">
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
        date: '8.11.2019',
        playersNum: 3
    },
    {
        date: '6.11.2019',
        playersNum: 20
    }];
}


function getParticipatedGames(){
    return [
        {
        date: '20.3.2017',
        playersNum: 5
    },
    {
        date: '22.3.2017',
        playersNum: 100
    }];
}


function GetGamesComponents(){
    return (
    <Box mt={5} m={1}>
    <Typography variant="h5" component="h3" alignItems="center" justify="center">
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
    return GetGamesComponentsByGames(getCreatedGames());
}
function GetParticipatedGamesComponents(){
    return GetGamesComponentsByGames(getParticipatedGames());
}


function GetGamesComponentsByGames(games){
    const classes = AppUseStyles();
    return (<List className={classes.list}>
          {games.map(({ id, date, playersNum }) => (
            <React.Fragment key={id}>
              <ListItem button>
                <ListItemText primary={'date: '+date} secondary={'number of participants : '+playersNum} />
              </ListItem>
            </React.Fragment>
          ))}
        </List>);
}